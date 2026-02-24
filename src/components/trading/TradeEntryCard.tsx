'use client';

import React, { useState, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PricingModal } from '@/components/billing/PricingModal';
import { useAuthStore } from '@/store/useAuthStore';
import { AnalysisResult } from '@/lib/analysis';

export const TradeEntryCard = ({ analysis }: { analysis: AnalysisResult | null }) => {
    const { balance, liveBalance, apiConnected, tradeHistory } = useTradingStore();
    const { t } = useLanguageStore();
    const { user } = useAuthStore();

    // Calculator States
    const [equityInput, setEquityInput] = useState<string>('');
    const [slPercentInput, setSlPercentInput] = useState<string>('2.0');

    // Results
    const [calcResult, setCalcResult] = useState<{
        maxLossUsdt: number;
        positionSizeUsdt: number;
        recommendedMargin: number;
        recommendedLeverage: number;
    } | null>(null);

    const [showPricing, setShowPricing] = useState(false);
    const [overrideBlocker, setOverrideBlocker] = useState(false);

    // Revenge Trade Blocker Logic
    const isRevengeTradeRisk = React.useMemo(() => {
        if (!tradeHistory || tradeHistory.length === 0) return false;

        // Find most recent trade
        const sorted = [...tradeHistory].sort((a, b) => b.timestamp - a.timestamp);
        const lastTrade = sorted[0];

        if (lastTrade.pnl < 0) {
            const oneHour = 60 * 60 * 1000;
            const timeSince = Date.now() - lastTrade.timestamp;
            if (timeSince < oneHour) {
                return true;
            }
        }
        return false;
    }, [tradeHistory]);

    const showBlocker = isRevengeTradeRisk && !overrideBlocker;

    // Auto-fill equity if API connected
    useEffect(() => {
        if (apiConnected && liveBalance > 0) {
            setEquityInput(liveBalance.toFixed(2));
        } else if (!apiConnected && balance > 0 && !equityInput) {
            setEquityInput(balance.toFixed(0));
        }
    }, [apiConnected, liveBalance, balance]);

    const handleCalculate = () => {
        if (!user) {
            setShowPricing(true);
            return;
        }

        const equity = parseFloat(equityInput);
        const slPercent = parseFloat(slPercentInput);

        if (isNaN(equity) || equity <= 0) {
            alert('가용 자산(USDT)을 올바르게 입력해주세요.');
            return;
        }
        if (isNaN(slPercent) || slPercent <= 0) {
            alert('손절 폭(%)을 올바르게 입력해주세요.');
            return;
        }

        // Kelly / 1.5% Risk Rule
        const RISK_PERCENT = 0.015; // 1.5% of total equity
        const maxLossUsdt = equity * RISK_PERCENT;

        // Position Size needed to lose exactly maxLossUsdt if price moves by slPercent
        const positionSizeUsdt = maxLossUsdt / (slPercent / 100);

        // Optimal Leverage (Assuming we want to use ~10% of equity as margin max)
        const targetMargin = equity * 0.1;
        let recommendedLeverage = Math.ceil(positionSizeUsdt / targetMargin);

        // Boundaries for leverage
        if (recommendedLeverage < 5) recommendedLeverage = 5;
        if (recommendedLeverage > 20) recommendedLeverage = 20;

        const recommendedMargin = positionSizeUsdt / recommendedLeverage;

        setCalcResult({
            maxLossUsdt,
            positionSizeUsdt,
            recommendedMargin,
            recommendedLeverage
        });
    };

    return (
        <>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} triggerReason="Pro Feature" />
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-white shadow-xl">
                <CardHeader className="pb-4 border-b border-zinc-800/50">
                    <CardTitle className="flex justify-between items-center text-lg">
                        <span className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-indigo-400" />
                            1-Click 리스크 계산기
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 relative">
                    {/* Tilt Warning Overlay (Revenge Trade Blocker) */}
                    {showBlocker && (
                        <div className="absolute inset-0 z-20 backdrop-blur-xl bg-red-950/90 flex flex-col items-center justify-center p-6 text-center border-t border-red-500/30">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
                            <h3 className="text-lg font-black text-red-100 mb-2">🚨 시스템 강제 제어 중</h3>
                            <p className="text-xs text-red-200/80 mb-6 leading-relaxed">
                                최근 1시간 이내에 손절이 발생했습니다.<br />
                                멘탈 과열 및 복수 매매(Revenge Trade) 위험이 높습니다.
                            </p>
                            <Button
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20 w-full text-xs font-bold"
                                onClick={() => setOverrideBlocker(true)}
                            >
                                멘탈 회복 확인 (서약 후 해제)
                            </Button>
                        </div>
                    )}

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-zinc-400 text-xs font-semibold">가용 자산 (Total Equity)</Label>
                                {apiConnected && <span className="text-[10px] text-green-400 border border-green-400/30 px-1 rounded">API 연동중</span>}
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                <Input
                                    type="number"
                                    value={equityInput}
                                    onChange={(e) => setEquityInput(e.target.value)}
                                    placeholder="예: 1000"
                                    className="bg-zinc-950 border-zinc-800 pl-7 text-white font-mono"
                                    disabled={apiConnected}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs font-semibold">예상 손절 폭 (Stop Loss %)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={slPercentInput}
                                    onChange={(e) => setSlPercentInput(e.target.value)}
                                    placeholder="예: 2.0"
                                    className="bg-zinc-950 border-zinc-800 pr-7 text-white font-mono"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                            </div>
                            {analysis?.atr && analysis?.currentPrice && (
                                <p className="text-[10px] text-zinc-500 text-right mt-1">
                                    현재 시장 권장 손절폭: <span className="text-indigo-400 border-b border-indigo-400/50 border-dashed cursor-pointer" onClick={() => setSlPercentInput(((analysis.atr! / analysis.currentPrice!) * 100 * 2).toFixed(2))}>±{((analysis.atr / analysis.currentPrice) * 100 * 2).toFixed(2)}% (2 ATR)</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Results Display */}
                    {calcResult && (
                        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-500/20">
                                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-bold text-indigo-300">HP1 권장 진입 전략</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">권장 레버리지</p>
                                    <p className="text-2xl font-black text-white">{calcResult.recommendedLeverage}x</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">필요 증거금 (Margin)</p>
                                    <p className="text-2xl font-black text-amber-400">${calcResult.recommendedMargin.toFixed(0)}</p>
                                </div>
                            </div>

                            <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/50 text-xs flex justify-between items-center text-zinc-400">
                                <span>총 포지션 규모:</span>
                                <span className="font-mono text-white">${calcResult.positionSizeUsdt.toFixed(0)}</span>
                            </div>

                            <div className="bg-red-950/20 p-2 rounded border border-red-500/20 text-xs flex justify-between items-center text-red-300/80">
                                <span>손절 발생 시 최대 손실액 (-1.5% Rule):</span>
                                <span className="font-mono font-bold text-red-400">-${calcResult.maxLossUsdt.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="pt-2">
                    <Button
                        className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                        onClick={handleCalculate}
                    >
                        안전 진입 비중 계산하기
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
};
