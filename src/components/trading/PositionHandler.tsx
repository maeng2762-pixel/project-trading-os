'use client';
import React, { useState, useEffect } from 'react';
import { useTradingStore, Position } from '@/store/useTradingStore';
import { AnalysisResult } from '@/lib/analysis';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BinanceService } from '@/services/binance';
import { useLanguageStore } from '@/store/useLanguageStore';

interface PositionHandlerProps {
    position: Position;
    analysis: AnalysisResult | null;
}

export const PositionHandler = ({ position, analysis }: PositionHandlerProps) => {
    const { updatePosition, closePosition } = useTradingStore();
    const { t } = useLanguageStore();
    const [currentPrice, setCurrentPrice] = useState<number>(position.entryPrice);
    const [distancePercent, setDistancePercent] = useState(0);

    // Fetch Price
    useEffect(() => {
        const fetch = async () => {
            const data = await BinanceService.fetchPrice(position.symbol);
            if (data) setCurrentPrice(data.price);
        };
        fetch();
        const interval = setInterval(fetch, 2000);
        return () => clearInterval(interval);
    }, [position.symbol]);

    // Calculate Metrics
    const isLong = position.type === 'LONG';
    const entry = position.entryPrice;
    const tp = position.takeProfit || (isLong ? entry * 1.05 : entry * 0.95);
    const sl = position.stopLoss || (isLong ? entry * 0.95 : entry * 1.05);

    // Distance to Target (0% to 100%)
    useEffect(() => {
        let dist = 0;
        if (isLong) {
            const totalRange = tp - entry;
            const currentMove = currentPrice - entry;
            dist = (currentMove / totalRange) * 100;
        } else {
            const totalRange = entry - tp;
            const currentMove = entry - currentPrice;
            dist = (currentMove / totalRange) * 100;
        }
        setDistancePercent(Math.max(0, Math.min(100, dist)));
    }, [currentPrice, entry, tp, isLong]);

    // The Ratchet Logic (Trailing Stop Suggestion)
    // Show if >50% to target AND SL is not already at Entry
    // Also check if SL is "better" than entry? No, strictly "Move to Entry".
    const showRatchet = distancePercent >= 50 && position.stopLoss !== entry;

    // Invalidation Logic
    let invalidationReason = "";
    if (analysis && analysis.direction !== 'NEUTRAL') {
        const isContrary = (isLong && analysis.direction === 'SHORT') || (!isLong && analysis.direction === 'LONG');
        // Strong contrary signal (Score > 60)
        if (isContrary && analysis.score >= 60) {
            invalidationReason = `Strategy Invalidated by Strong ${analysis.direction} Signal (Score: ${analysis.score}%)`;
        }
    }

    const handleRatchet = () => {
        updatePosition(position.id, { stopLoss: entry });
    };

    const handleClose = () => {
        closePosition(position.id, currentPrice);
    };

    return (
        <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-white">
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                        {isLong ? <ArrowUpCircle className="text-green-500 h-4 w-4" /> : <ArrowDownCircle className="text-red-500 h-4 w-4" />}
                        Active: {position.symbol}
                    </span>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                        Lev x{position.leverage}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {/* PnL Big Display */}
                <div className="text-center">
                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Current PnL</div>
                    <div className={`text-4xl font-mono font-bold ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}%
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">
                        Entry: {entry.toLocaleString()} | Current: {currentPrice.toLocaleString()}
                    </div>
                </div>

                {/* Distance to Target */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                        <span>Entry</span>
                        <span>Target ({tp.toLocaleString()})</span>
                    </div>
                    <Progress value={distancePercent} className={`h-2 ${isLong ? 'bg-zinc-800' : 'bg-zinc-800'}`} />
                    <div className="text-right text-xs text-emerald-400">
                        {distancePercent.toFixed(1)}% to Target
                    </div>
                </div>

                {/* The Handler: AI Coaching */}
                <div className="bg-black/20 rounded-lg p-3 border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 mb-2 uppercase">
                        <ShieldCheck className="h-3 w-3" /> The Handler (AI Coach)
                    </div>

                    {/* Specific Situations */}
                    {invalidationReason ? (
                        <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                                <AlertTriangle className="h-4 w-4" />
                                ⚠️ Strategy Invalidated
                            </div>
                            <p className="text-[10px] text-zinc-400 mb-2">
                                {invalidationReason}. Market structure has changed against your position.
                            </p>
                            <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={handleClose}>
                                Close Position Now
                            </Button>
                        </div>
                    ) : showRatchet ? (
                        <div className="bg-emerald-900/10 border border-emerald-900/30 rounded p-2">
                            <p className="text-xs text-emerald-300 mb-2">
                                🎯 <strong>Target 50% Reached.</strong><br />
                                Protect your capital by moving Stop Loss to Entry (Breakeven).
                            </p>
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs" onClick={handleRatchet}>
                                Move SL to Entry (Risk-Free)
                            </Button>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 italic">
                            "Holding position. Thesis is still valid. Stick to the plan."
                        </p>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                {!invalidationReason && (
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white" onClick={handleClose}>
                        Close Manually
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
