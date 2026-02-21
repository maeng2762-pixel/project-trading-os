'use client';
import React, { useState, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { BinanceService } from '@/services/binance';
import { Button } from '@/components/ui/button';
import { TradeFeedbackModal } from './TradeFeedbackModal';
import { XCircle, Trophy } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Badge } from '@/components/ui/badge';

export const PositionList = () => {
    const { positions, closePosition, updatePnL } = useTradingStore();
    const { t } = useLanguageStore();
    const [feedbackData, setFeedbackData] = useState<{ pnl: number, feedback: string, scoreChange: number } | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [prices, setPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        const interval = setInterval(async () => {
            const data = await BinanceService.fetchPrice('BTC/USDT');
            if (data) {
                updatePnL(data.price);
                setPrices(prev => ({ ...prev, 'BTC/USDT': data.price }));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [updatePnL]);

    const handleClose = async (id: string) => {
        const data = await BinanceService.fetchPrice('BTC/USDT');
        if (data) {
            const result = closePosition(id, data.price);
            if (result) {
                setFeedbackData(result);
                setIsFeedbackModalOpen(true);
            }
        }
    };

    return (
        <div className="w-full max-w-sm space-y-4">
            <TradeFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                data={feedbackData}
            />

            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Open Positions</h3>

            {positions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center">
                    <p className="text-sm italic text-zinc-600">No active positions</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {positions.map((pos) => (
                        <div key={pos.id} className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <span className={`font-bold ${pos.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                                        {pos.type} {pos.symbol}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-zinc-500 hover:text-white"
                                    onClick={() => handleClose(pos.id)}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>

                            {pos.entryReason && (
                                <p className="mb-2 text-[10px] text-zinc-500">Reason: {pos.entryReason}</p>
                            )}

                            {/* SL/TP Display */}
                            <div className="mb-2 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-zinc-600">Stop Loss</span>
                                    <span className="text-xs font-medium text-red-500/80">
                                        {pos.stopLoss ? pos.stopLoss.toLocaleString() : '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] uppercase text-zinc-600">Take Profit</span>
                                    <span className="text-xs font-medium text-green-500/80">
                                        {pos.takeProfit ? pos.takeProfit.toLocaleString() : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-end justify-between border-t border-zinc-800 pt-2">
                                <span className="text-[10px] text-zinc-600">
                                    {t('entry.amount')}: ${pos.size.toLocaleString()}
                                </span>
                                <span className={`text-sm font-bold font-mono ${pos.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
