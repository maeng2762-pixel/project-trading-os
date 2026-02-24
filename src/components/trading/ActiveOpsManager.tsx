'use client';
import React, { useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore'; // Import
import { AnalysisResult, AnalysisEngine } from '@/lib/analysis'; // Correct Import
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, ShieldAlert, ArrowRight, Zap, Ban, CheckCircle2, Skull } from 'lucide-react';
import { Position } from '@/store/useTradingStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ActiveOpsManagerProps {
    position: Position;
    analysis: AnalysisResult | null;
}

export const ActiveOpsManager = ({ position, analysis }: ActiveOpsManagerProps) => {
    const { updatePosition, closePosition, isSleepMode, toggleSleepMode, liveBalance, balance, apiConnected } = useTradingStore();
    const { t, language } = useLanguageStore();

    const effectiveBalance = apiConnected ? liveBalance : balance;

    // 1. Calculate Real-time Metrics
    // Note: pnl is updated by Dashboard's subscription loop logic
    const entry = position.entryPrice;
    const currentPnL = position.pnl;
    const isWin = currentPnL >= 0;
    const pnlPercent = (currentPnL / (position.size * position.leverage)) * 100;

    const targetPrice = position.takeProfit || (position.type === 'LONG' ? entry * 1.05 : entry * 0.95);
    const stopPrice = position.stopLoss || (position.type === 'LONG' ? entry * 0.95 : entry * 1.05);

    const fullDistance = Math.abs(targetPrice - entry);
    // Rough estimate of current price based on PnL derived
    // Real app would pass currentPrice or have it in store.
    // Let's assume PnL update is accurate.
    // Reconstruct current price from PnL? 
    // PnL = (Price - Entry) * Size * Lev (Unique direction logic)
    // Price - Entry = PnL / (Size * Lev) / Direction
    const directionMult = position.type === 'LONG' ? 1 : -1;
    const currentPriceEst = entry + (currentPnL / (position.size * position.leverage) * entry) / directionMult;

    const distanceCovered = Math.abs(currentPriceEst - entry);
    const distancePercent = Math.min(100, Math.max(0, (distanceCovered / fullDistance) * 100));

    // 2. Generate Advice (Consistency Protocol)
    const { advice, action } = analysis
        ? AnalysisEngine.generatePositionAdvice(position, analysis, language)
        : { advice: t('ops.advice_hold'), action: 'HOLD' }; // Use key if possible, but advice is dynamic.

    // 3. Sleep Mode Logic (Auto-Hedge Check)
    useEffect(() => {
        if (isSleepMode && action === 'CLOSE') {
            const timer = setTimeout(() => {
                closePosition(position.id, currentPriceEst);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isSleepMode, action, closePosition, position.id, currentPriceEst]);

    const handleClose = () => {
        closePosition(position.id, currentPriceEst);
    };

    const handlePyramid = () => {
        const pyramidMargin = effectiveBalance * 0.03;
        updatePosition(position.id, {
            size: position.size + pyramidMargin,
            pyramidAdded: true
        });
    };

    const canPyramid = position.isPyramidEligible && !position.pyramidAdded && isWin;

    // Helper to translate advice if it matches a key, else return as is (for legacy/dynamic params)
    // Since advice is complex string from analysis.ts, we need to update analysis.ts to return keys or localized strings.
    // For this step, I will map the specific hardcoded string from analysis.ts if possible, 
    // BUT the user wants "Everything in Korean". 
    // The advice "Holding position..." comes from generatePositionAdvice. 
    // I will update AnalysisEngine next. For now, let's localize the UI elements.

    const [showExecuteModal, setShowExecuteModal] = React.useState<{ type: 'TP' | 'SL', isOpen: boolean }>({ type: 'TP', isOpen: false });
    const [executeTime, setExecuteTime] = React.useState<string>(new Date().toISOString().slice(0, 16));
    const [isHit, setIsHit] = React.useState(false);

    const openExecuteModal = (type: 'TP' | 'SL') => {
        setExecuteTime(new Date().toISOString().slice(0, 16));
        setShowExecuteModal({ type, isOpen: true });
    };

    const confirmExecute = () => {
        const exitPrice = showExecuteModal.type === 'TP' ? targetPrice : stopPrice;

        if (showExecuteModal.type === 'SL') {
            setIsHit(true);
            setTimeout(() => {
                closePosition(position.id, exitPrice);
                // Also could decrement survival score here if not already handled by store
                useTradingStore.getState().updateSurvivalScore(-5);
                setIsHit(false);
                setShowExecuteModal({ ...showExecuteModal, isOpen: false });
            }, 800); // Wait for red flash
        } else {
            closePosition(position.id, exitPrice);
            setShowExecuteModal({ ...showExecuteModal, isOpen: false });
        }
    };


    return (
        <Card className={`w-full h-full border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ${isHit ? 'bg-red-950 scale-[0.98]' : ''}`}>

            {/* Global Hit Effect Overlay */}
            {isHit && (
                <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none animate-[pulse_0.1s_ease-in-out_infinite]"></div>
            )}

            {/* Execute Modal */}
            <Dialog open={showExecuteModal.isOpen} onOpenChange={(open) => setShowExecuteModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className={`${showExecuteModal.type === 'SL' ? 'bg-rose-950 border-rose-900' : 'bg-zinc-900 border-emerald-900'} text-white`}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {showExecuteModal.type === 'TP' ? (
                                <><CheckCircle2 className="text-emerald-500" /> 목표 도달 (익절 확정)</>
                            ) : (
                                <><Skull className="text-rose-500" /> 무효화 (손절 확정)</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            해당 포지션을 현재 설정된 {showExecuteModal.type === 'TP' ? '목표가(+R)' : '손절가(-1R)'} 기준으로 정산합니다. 종료 시간을 확인해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-xs text-zinc-500 mb-1 block">종료 시간 (Time of Execution)</label>
                        <Input
                            type="datetime-local"
                            className="bg-black/50 border-zinc-700 text-white"
                            value={executeTime}
                            onChange={(e) => setExecuteTime(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="text-zinc-400 border-zinc-700" onClick={() => setShowExecuteModal(prev => ({ ...prev, isOpen: false }))}>
                            취소
                        </Button>
                        <Button
                            className={showExecuteModal.type === 'TP' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}
                            onClick={confirmExecute}
                        >
                            확인 및 자산 업데이트
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Header: Status Bar */}
            <div className={`p-4 flex flex-wrap justify-between items-center gap-y-3 ${isSleepMode ? 'bg-indigo-950' : 'bg-zinc-900'}`}>
                <div className="flex items-center gap-3">
                    <Badge variant={isWin ? "default" : "destructive"} className="text-lg px-3 py-1 animate-pulse whitespace-nowrap">
                        {position.symbol} {position.type}
                    </Badge>
                    <span className={`text-xl sm:text-2xl font-mono font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                        {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-zinc-500 whitespace-nowrap">
                        (${currentPnL.toFixed(2)})
                    </span>
                </div>
                <Button
                    variant={isSleepMode ? "default" : "secondary"}
                    onClick={toggleSleepMode}
                    className={`w-full sm:w-auto gap-2 font-bold transition-all ${isSleepMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                >
                    <Moon className={`h-4 w-4 ${isSleepMode ? 'fill-current' : ''}`} />
                    {isSleepMode ? t('ops.sleep_btn_on') : t('ops.sleep_btn_off')}
                </Button>
            </div>

            <CardContent className="flex-1 p-6 flex flex-col gap-6">

                {/* 1. Progress Visualization */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-400">
                        <span>{t('ops.entry')}: ${entry}</span>
                        <span>{t('ops.target')}: ${targetPrice.toFixed(0)}</span>
                    </div>
                    <Progress value={distancePercent} className={`h-4 bg-zinc-800 ${isWin ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`} />
                    <div className="text-center text-xs text-zinc-500 mt-1">
                        {t('ops.distance')}: {distancePercent.toFixed(1)}%
                    </div>
                </div>

                {/* 2. AI Situation Room (Advice) */}
                <div className={`flex-1 rounded-xl p-6 border ${action === 'CLOSE' ? 'bg-red-950/30 border-red-900' : 'bg-zinc-900/50 border-zinc-800'} flex flex-col justify-center items-center text-center gap-4`}>

                    {action === 'CLOSE' && <ShieldAlert className="h-12 w-12 text-red-500 animate-bounce" />}
                    {action === 'HOLD' && <Zap className="h-12 w-12 text-yellow-500" />}
                    {action === 'TP_ADJUST' && <ArrowRight className="h-12 w-12 text-blue-500" />}

                    <h3 className="text-xl font-bold text-zinc-200">
                        {action === 'CLOSE' ? t('ops.fatal') : t('ops.protocol')}
                    </h3>

                    <p className="text-lg text-zinc-300 leading-relaxed max-w-md">
                        "{advice}"
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
                        {action === 'CLOSE' && (
                            <Button variant="destructive" size="lg" onClick={handleClose} className="w-full md:w-auto animate-pulse text-lg py-6 shadow-red-900/50 shadow-lg">
                                {t('ops.btn_close_now')}
                            </Button>
                        )}
                        {action === 'TP_ADJUST' && (
                            <Button variant="default" size="lg" onClick={() => updatePosition(position.id, { takeProfit: currentPriceEst })} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white py-6">
                                {t('ops.btn_tp_current')}
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={handleClose}
                            className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 py-6"
                        >
                            <Ban className="mr-2 h-5 w-5 text-red-400" />
                            {t('ops.btn_manual')}
                        </Button>
                        {canPyramid && (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handlePyramid}
                                className="w-full md:w-auto bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20 text-orange-400 py-6 font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                            >
                                🔥 3% 추가 불타기
                            </Button>
                        )}
                    </div>
                </div>

                {/* 3. Sleep Mode Info */}
                {isSleepMode && (
                    <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-4 flex gap-3 items-start">
                        <Moon className="h-5 w-5 text-indigo-400 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-indigo-300 text-sm">{t('ops.sleep_active')}</h4>
                            <p className="text-xs text-indigo-400/80 mt-1">
                                {t('ops.sleep_desc')}
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. 1-Click PnL Execution Panel */}
                <div className="border-t border-zinc-800/50 pt-6 mt-2">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 text-center">1-Click PnL Execution</div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="default"
                            className="h-16 flex flex-col items-center justify-center gap-1 bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/40 text-emerald-400 font-black tracking-widest shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]"
                            onClick={() => openExecuteModal('TP')}
                        >
                            <span className="text-lg">🔵 목표 도달</span>
                            <span className="text-[10px] opacity-70">(Take Profit +R)</span>
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-16 flex flex-col items-center justify-center gap-1 bg-rose-900/30 border border-rose-500/50 hover:bg-rose-900/50 text-rose-400 font-black tracking-widest shadow-[inset_0_0_10px_rgba(225,29,72,0.1)]"
                            onClick={() => openExecuteModal('SL')}
                        >
                            <span className="text-lg">🔴 무효화/손절</span>
                            <span className="text-[10px] opacity-70">(Stop Loss -1R)</span>
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
