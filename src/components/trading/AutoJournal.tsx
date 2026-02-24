'use client';

import React, { useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDownRight, ArrowUpRight, History, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { PricingModal } from '@/components/billing/PricingModal';
import { Button } from '@/components/ui/button';

const EMOTION_TAGS = ['FOMO', '대기/지루함', '원칙 준수', '뇌동매매'];

export const AutoJournal = () => {
    const { tradeHistory, fetchTradeHistory, isSyncingHistory, tier, emotionTags, setEmotionTag } = useTradingStore();
    const { user } = useAuthStore();
    const [showPricing, setShowPricing] = React.useState(false);

    // Initial fetch if PRO (or just logged in, but we restrict view later)
    useEffect(() => {
        if (user && tier === 'PRO') {
            fetchTradeHistory();
        }
    }, [user, tier, fetchTradeHistory]);

    const handleManualSync = () => {
        if (tier !== 'PRO') {
            setShowPricing(true);
            return;
        }
        fetchTradeHistory();
    };

    return (
        <>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} triggerReason="Auto-Journal Sync" />
            <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-white shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-400" />
                        오토 저널 (Auto-Journal)
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManualSync}
                        disabled={isSyncingHistory}
                        className="text-zinc-400 hover:text-white"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingHistory ? 'animate-spin' : ''}`} />
                        {isSyncingHistory ? '동기화 중...' : '동기화'}
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {tier !== 'PRO' ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <History className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-300 mb-2">PRO 자동 일지 동기화</h3>
                            <p className="text-sm text-zinc-500 max-w-sm mb-6">
                                바이낸스 실거래 내역을 자동으로 불러와 복기하고 통계를 냅니다. 오직 PRO 유저만 사용 가능합니다.
                            </p>
                            <Button className="bg-amber-600 hover:bg-amber-500 text-white" onClick={() => setShowPricing(true)}>
                                ⭐ PRO 업그레이드
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            {tradeHistory.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-zinc-500 text-sm py-12">
                                    최근 거래 내역이 없습니다.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {tradeHistory.map((trade: any, idx: number) => {
                                        const isWin = trade.pnl > 0;
                                        return (
                                            <div key={trade.id || idx} className="p-4 hover:bg-zinc-800/20 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {isWin ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-sm">{trade.symbol}</span>
                                                            <Badge variant="outline" className={`text-[10px] ${trade.type === 'LONG' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}>
                                                                {trade.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {new Date(trade.timestamp).toLocaleString('ko-KR', {
                                                                month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-mono font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {isWin ? '+' : ''}{trade.pnl?.toFixed(2)} USDT
                                                    </div>

                                                    <div className="flex gap-1 mt-2 justify-end">
                                                        {EMOTION_TAGS.map(tag => {
                                                            const tradeId = trade.id || idx.toString();
                                                            const isSelected = emotionTags[tradeId] === tag;
                                                            return (
                                                                <Badge
                                                                    key={tag}
                                                                    variant={isSelected ? "default" : "outline"}
                                                                    className={`cursor-pointer text-[9px] px-1.5 py-0 transition-colors ${isSelected ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-transparent' : 'text-zinc-500 border-zinc-800 hover:border-indigo-500/50 bg-transparent'}`}
                                                                    onClick={() => setEmotionTag(tradeId, isSelected ? '' : tag)}
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </>
    );
};
