'use client';
import React, { useState, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore'; // Import
import { BinanceService } from '@/services/binance';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, Lock } from 'lucide-react';

import { EntryReasonModal } from './EntryReasonModal';
import { PricingModal } from '@/components/billing/PricingModal';
import { useAuthStore } from '@/store/useAuthStore';

// Update Props to receive Analysis
import { AnalysisResult, AnalysisEngine } from '@/lib/analysis';
import { PositionHandler } from './PositionHandler'; // Import

export const TradeEntryCard = ({ analysis }: { analysis: AnalysisResult | null }) => {
    const { openPosition, balance, positions, maxAllowedLeverage } = useTradingStore();
    const { t } = useLanguageStore();
    const [price, setPrice] = useState<number>(0);
    const [amount, setAmount] = useState<number>(100);
    const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
    const [leverage, setLeverage] = useState<number>(1);
    const [stopLoss, setStopLoss] = useState<number>(0);
    const [takeProfit, setTakeProfit] = useState<number>(0);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [isPyramidEligible, setIsPyramidEligible] = useState(false);

    // Check for Active Position
    // Check for Active Position - Just check if any position exists
    const activePosition = positions.length > 0 ? positions[0] : undefined;

    // Mock Probability
    const probability = analysis?.score || 50;

    // Dynamic Sizing Logic
    const recommendedMax = (balance * 0.1) * (50 / 100); // disciplineScore removed, using static 50 for now
    const isOverSize = amount > recommendedMax;

    // v3.0 Circuit Breaker: Mental Constraint
    const isMentalLow = 50 < 60; // disciplineScore removed, using static 50 for now
    // Header says Mental is static 85. Discipline is dynamic. Prompt says "Mental Score < 60". 
    // I should probably check against Discipline Score for now as there's no dynamic Mental Score state.
    // Assuming Discipline Score acts as the Mental/Behavior score.
    const isTradingDisabled = isMentalLow;

    // Initial Price Fetch & Polling
    useEffect(() => {
        const fetch = async () => {
            const data = await BinanceService.fetchPrice('BTC/USDT');
            if (data) {
                setPrice(data.price);
            }
        };
        fetch();
        const interval = setInterval(fetch, 2000);
        return () => clearInterval(interval);
    }, []);

    // 1. Auto-Pilot: Sync with AI Analysis when it arrives
    useEffect(() => {
        if (!activePosition && analysis && analysis.direction !== 'NEUTRAL') {
            setDirection(analysis.direction);
            // v3.0 Leverage Cap Application
            let safeLev = analysis.recommendedLeverage || 1;
            if (safeLev > maxAllowedLeverage) safeLev = maxAllowedLeverage;
            setLeverage(safeLev);

            if (analysis.recommendedSL) setStopLoss(analysis.recommendedSL);
            if (analysis.recommendedTP) setTakeProfit(analysis.recommendedTP);
        }
    }, [analysis, activePosition, maxAllowedLeverage]);
    // Added maxAllowedLeverage dependency

    // 2. Recalculate SL/TP when direction changes (Manual Switch or Default Init)
    useEffect(() => {
        if (price > 0 && !activePosition) {
            // Check if current SL/TP matches AI to avoid overwriting AI's specific logic
            const isAIValues = analysis && analysis.direction === direction && analysis.recommendedSL === stopLoss;

            if (!isAIValues) {
                if (direction === 'LONG') {
                    // Long: SL below, TP above
                    setStopLoss(Number((price * 0.98).toFixed(0)));
                    setTakeProfit(Number((price * 1.04).toFixed(0)));
                } else {
                    // Short: SL above, TP below
                    setStopLoss(Number((price * 1.02).toFixed(0)));
                    setTakeProfit(Number((price * 0.96).toFixed(0)));
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [direction, activePosition]);



    // --- Monetization Hook ---
    const { user } = useAuthStore();
    const [showPricing, setShowPricing] = useState(false);

    // For MVP: Treat all logged-in users as 'Pro' for now, or check for specific email
    // const isPro = user?.email?.includes('pro') || false; 

    // ... useEffects ...

    const handleTradeClick = () => {
        if (!user) {
            setShowPricing(true);
            return;
        }
        if (isTradingDisabled) {
            // Should be handled by button disabled state too, but double check
            return;
        }
        setIsReasonModalOpen(true);
    };

    // v3.0 AI Auto-Set Logic (Brain Button)
    // v7.0 Updated to use Centralized Risk Engine (Dual Mode)
    const handleAutoSet = () => {
        if (!analysis || !analysis.atr || price <= 0) return;

        const { currentMode } = useTradingStore.getState();

        if (balance <= 0) {
            alert("모의투자 잔고가 0원입니다.");
            return;
        }

        // 1. Calculate Risk using Central Engine (Use Live Balance if API connected)
        const risk = AnalysisEngine.calculatePersonalRisk(analysis, balance, price, currentMode);

        // 2. Apply Values
        if (!risk.margin || risk.margin === 0 || risk.leverage === 0) {
            alert(`${t('entry.auto_set_blocked')}: ${risk.reason}`);
            return;
        }

        setDirection(analysis.direction !== 'NEUTRAL' ? analysis.direction : direction);
        setStopLoss(risk.sl);
        setTakeProfit(risk.tp);
        setLeverage(risk.leverage);
        setIsPyramidEligible(risk.isPyramidEligible || false);

        // Set exactly the calculated margin from Live Balance constraints
        setAmount(Number(risk.margin.toFixed(0)));

        // Toast/Notify (Optional)
        console.log(`Auto-Set Applied (${currentMode}):`, risk.reason);
    };

    const handleConfirmTrade = async (reason: string) => {
        try {
            // Sync Locally (Paper or Real success)
            openPosition({
                symbol: 'BTC/USDT',
                type: direction,
                entryPrice: price,
                size: amount,
                leverage: leverage,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                entryReason: reason,
                sentinelScore: analysis?.score || 50,
                originalAnalysis: analysis ? analysis : undefined,
                isPyramidEligible: isPyramidEligible,
            });

            setIsReasonModalOpen(false);
            setAmount(0); // Reset after trade
        } catch (error: any) {
            console.error("Trade Execution Error:", error);
            alert(error.message || "Failed to execute trade");
        }
    };

    const riskAmount = (Math.abs(price - stopLoss) / price) * amount * leverage;

    if (activePosition) {
        return <PositionHandler position={activePosition} analysis={analysis} />;
    }

    return (
        <>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} triggerReason="Trade Execution" />
            <EntryReasonModal
                isOpen={isReasonModalOpen}
                onClose={() => setIsReasonModalOpen(false)}
                onConfirm={handleConfirmTrade}
                riskAmount={amount}
            />
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-white">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>BTC/USDT</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                                Lev x{leverage}
                            </span>
                            <span className="font-mono text-xl text-yellow-500">${price.toLocaleString()}</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Probability Badge */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                        <span className="text-sm text-zinc-400">AI Win Rate</span>
                        <div className="flex items-center gap-2">
                            {analysis?.direction !== 'NEUTRAL' && (
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Auto-Config Ready
                                </span>
                            )}
                            <Badge variant={probability > 50 ? "default" : "destructive"} className="text-lg">
                                {probability}%
                            </Badge>
                        </div>
                    </div>

                    {/* Pyramid Eligibility Badge */}
                    {isPyramidEligible && (
                        <div className="bg-orange-950/40 border border-orange-500/50 rounded-lg p-2 text-[11px] text-orange-400 font-medium">
                            <span className="flex items-center gap-1 mb-1 font-bold text-xs text-orange-300">
                                <span>🔥</span> S급 타점 (손익비 1:5+)
                            </span>
                            <span className="opacity-80">현재 2% 진입 ➔ 수익 진입 시 3% 추가 불타기 메뉴 활성화</span>
                        </div>
                    )}

                    {/* v3.0 The Easy Button (AI Auto-Set) */}
                    <Button
                        variant="outline"
                        className="w-full bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20 text-indigo-400 mb-2 h-10 flex items-center justify-center gap-2 group transition-all"
                        onClick={handleAutoSet}
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🧠</span>
                        {t('entry.auto_set')}
                        <span className="text-[10px] opacity-70 ml-1 font-normal border border-indigo-500/30 rounded px-1">
                            Current ATR: {analysis?.atr?.toFixed(1) || '0.0'}
                        </span>
                    </Button>

                    <Tabs value={direction.toLowerCase()} onValueChange={(v) => setDirection(v === 'long' ? 'LONG' : 'SHORT')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="long" className="data-[state=active]:bg-green-900 data-[state=active]:text-green-300">{t('entry.long')}</TabsTrigger>
                            <TabsTrigger value="short" className="data-[state=active]:bg-red-900 data-[state=active]:text-red-300">{t('entry.short')}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="space-y-2">
                        <Label>{t('entry.amount')}</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className={`bg-zinc-950 ${isOverSize ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800'}`}
                            />
                            {isOverSize && (
                                <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-zinc-500 flex items-center gap-1">
                                Lev: {leverage}x
                                {maxAllowedLeverage < 20 && (
                                    <span className="text-amber-500 flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> (Locked)
                                    </span>
                                )}
                            </span>
                            <span className={`${isOverSize ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                                {t('entry.rec_size')}: ${recommendedMax.toFixed(0)}
                            </span>
                        </div>
                    </div>

                    {/* SL & TP Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-red-400">{t('entry.sl')}</Label>
                            <Input
                                type="number"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(Number(e.target.value))}
                                className="bg-zinc-950 border-zinc-800 h-8 text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-green-400">{t('entry.tp')}</Label>
                            <Input
                                type="number"
                                value={takeProfit}
                                onChange={(e) => setTakeProfit(Number(e.target.value))}
                                className="bg-zinc-950 border-zinc-800 h-8 text-xs font-mono"
                            />
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button
                        className={`w-full h-12 text-lg font-bold ${direction === 'LONG' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        onClick={handleTradeClick}
                        disabled={isTradingDisabled}
                    >
                        {isTradingDisabled ? (
                            <span className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4" /> 휴식이 필요합니다 (규율 60 미만)
                            </span>
                        ) : (
                            <>
                                {direction === 'LONG' ? <ArrowUpCircle className="mr-2" /> : <ArrowDownCircle className="mr-2" />}
                                {t('entry.execute')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
};
