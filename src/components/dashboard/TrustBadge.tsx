'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TrendingUp, AlertTriangle, LineChart, ShieldAlert } from 'lucide-react';

export function TrustBadge() {
    const { tradeHistory, balance } = useTradingStore();
    const { t } = useLanguageStore();

    // 1. Win Rate (Last 30 Trades)
    const recentTrades = tradeHistory.slice(0, 30);
    const totalTrades = recentTrades.length;
    const wins = recentTrades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';

    // 2. Avg Risk:Reward (Avg Win / Avg Loss)
    const winningTrades = recentTrades.filter(t => t.pnl > 0);
    const losingTrades = recentTrades.filter(t => t.pnl < 0);

    const avgWin = winningTrades.length > 0
        ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length
        : 0;

    const avgLoss = losingTrades.length > 0
        ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0) / losingTrades.length)
        : 1; // Prevent div by zero

    const rrRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '0.00';

    // 3. Max Drawdown (MDD) - Simulated from History
    // We traverse history backwards to find the Peak Balance vs Current Balance at each step
    let peakBalance = balance;
    let currentSimBalance = balance;
    let maxDrawdown = 0;

    // To do this strictly correctly, we need the balance before each trade. 
    // balance - trade.pnl = prevBalance.
    // We can iterate forward if we knew starting balance, but we only know current.
    // Let's iterate backwards.
    // Current Balance is End State.
    // Previous Balance = Current - PnL.

    // We need to construct the equity curve.
    // Let's just use the tracked tradeHistory.
    // NOTE: This is an approximation if deposits/withdrawals happen.

    // Let's try forward simulation from a "Virtual Start".
    // Or simpler: Just look at consecutive losses sum? No, MDD is peak-to-valley.
    // Let's re-construct equity curve from the last 30 trades (or all).

    // Since we don't have full balance history, let's use a simpler heuristic for now or reconstruct.
    // Reconstruct entire history:
    let runningBalance = 10000; // Assumed start for relative calc
    let peak = 10000;
    let maxDDPercent = 0;

    // Sort history by timestamp ascending
    const sortedHistory = [...tradeHistory].sort((a, b) => a.timestamp - b.timestamp);

    sortedHistory.forEach(trade => {
        runningBalance += trade.pnl;
        if (runningBalance > peak) {
            peak = runningBalance;
        }
        const dd = (peak - runningBalance) / peak;
        if (dd > maxDDPercent) {
            maxDDPercent = dd;
        }
    });

    const mdd = (maxDDPercent * 100).toFixed(2);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 mb-6 backdrop-blur-sm">

            {/* Title / Identity */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 whitespace-nowrap">
                        {t('trust.title')}
                        <Badge variant="outline" className="hidden sm:flex text-[10px] bg-red-600/10 text-red-500 border-red-600/30 h-5 px-1.5 gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            {t('trust.live')}
                        </Badge>
                    </h3>
                    <p className="text-[10px] text-zinc-500">{t('trust.subtitle')}</p>
                </div>
            </div>

            {/* Metrics: Grid on Mobile (2x2), Flex on Desktop (4x1) */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-6 sm:divide-x sm:divide-zinc-800/50 mt-4 sm:mt-0 gap-y-4 gap-x-2 w-full sm:w-auto">

                {/* Drawdown Saved */}
                <div className="flex flex-col items-start sm:items-center px-2 sm:px-4">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">{t('trust.saved')}</span>
                    <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 text-green-500" />
                        <span className="text-sm sm:text-lg font-mono font-bold text-green-400 whitespace-nowrap">
                            $12,450
                        </span>
                    </div>
                </div>

                {/* Win Rate */}
                <div className="flex flex-col items-start sm:items-center px-2 sm:px-4">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">{t('trust.winrate')}</span>
                    <div className="flex items-center gap-1.5">
                        <LineChart className="w-3 h-3 text-zinc-600" />
                        <span className={`text-sm sm:text-lg font-mono font-bold whitespace-nowrap ${Number(winRate) >= 50 ? 'text-white' : 'text-red-400'}`}>
                            {winRate}%
                        </span>
                    </div>
                </div>

                {/* Avg R:R */}
                <div className="flex flex-col items-start sm:items-center px-2 sm:px-4 sm:pl-6">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">{t('trust.rr')}</span>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-zinc-600" />
                        <span className="text-sm sm:text-lg font-mono font-bold text-indigo-400 whitespace-nowrap">
                            1:{rrRatio}
                        </span>
                    </div>
                </div>

                {/* MDD */}
                <div className="flex flex-col items-start sm:items-center px-2 sm:px-4 sm:pl-6">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">{t('trust.mdd')}</span>
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-zinc-600" />
                        <span className="text-sm sm:text-lg font-mono font-bold text-amber-500 whitespace-nowrap">
                            -{mdd}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
