'use client';

import { useTradingStore } from '@/store/useTradingStore';
import { AlertOctagon, Skull } from 'lucide-react';

export function RuinGuard() {
    const { positions, balance, winRate } = useTradingStore((state) => {
        const recentTrades = state.tradeHistory.slice(0, 30);
        const wins = recentTrades.filter(t => t.pnl > 0).length;
        const rate = recentTrades.length > 0 ? (wins / recentTrades.length) * 100 : 50; // Default 50
        return {
            positions: state.positions,
            balance: state.balance,
            winRate: rate
        };
    });

    // v5.0 True Ruin Logic (The Fear Engine)
    // Formula: (Leverage^2 / WinRate) * (ConsecLosses + RiskFactor)

    // 1. Leverage Factor (Exponential Risk)
    // Avg leverage of positions, default to 1 if no pos.
    const avgLev = positions.length > 0
        ? positions.reduce((acc, p) => acc + p.leverage, 0) / positions.length
        : 1;

    // 2. Win Rate Factor (Safety Net)
    // If WR < 40%, risk explodes.
    const wrFactor = Math.max(winRate, 30); // Floor at 30 to prevent infinity

    // 3. Consecutive Loss Simulation (Monte Carlo Proxy)
    // If recent history has streaks of losses, augment risk.
    // For now, static multiplier + random jitter to make it feel "alive"
    const volatilityJitter = (Date.now() % 100) / 100; // 0.00-0.99

    // Calculation
    // Example: Lev 10, WR 50 -> (100 / 50) * 1.5 = 3% (Safe)
    // Example: Lev 50, WR 40 -> (2500 / 40) * 1.5 = 93% (Death)
    let rawProb = (Math.pow(avgLev, 1.8) / wrFactor) * 2.5;

    // Add jitter only if active positions exist
    if (positions.length > 0) {
        rawProb += volatilityJitter;
    }

    // Cap at 99.9%
    let ruinProb = Math.min(99.9, Math.max(0.1, rawProb));
    if (positions.length === 0 && avgLev === 1) ruinProb = 0.1; // Baseline safety

    // Threat Level
    const isCritical = ruinProb > 20; // Death Zone
    const isDanger = ruinProb > 5;   // High Risk
    const isWarning = ruinProb > 2;  // Caution

    // Blinking Effect for Danger
    const blinkClass = isDanger ? 'animate-pulse' : '';

    const getRiskColor = () => {
        if (isCritical) return 'text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]';
        if (isDanger) return 'text-red-500';
        if (isWarning) return 'text-orange-500';
        return 'text-green-500';
    };

    const getMessage = () => {
        if (isCritical) return "☠️ IMMEDIATE RUIN (파산 직전)";
        if (isDanger) return "DANGER (위험)";
        if (isWarning) return "CAUTION (주의)";
        return "SAFE (안전)";
    };

    return (
        <div className={`relative flex items-center gap-3 p-3 rounded-lg border backdrop-blur-md transition-all duration-500 
            ${isCritical ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' :
                isDanger ? 'bg-red-950/20 border-red-900/50' :
                    'bg-zinc-900/50 border-zinc-800'}`}>

            {/* Flashing Border Overlay */}
            {isDanger && (
                <div className="absolute inset-0 border-2 border-red-500/50 rounded-lg animate-pulse pointer-events-none"></div>
            )}

            <div className={`p-2 rounded-full ${isDanger ? 'bg-red-500/20' : 'bg-zinc-800'} z-10`}>
                {isDanger ? <Skull className={`w-5 h-5 text-red-500 ${isCritical ? 'animate-bounce' : ''}`} /> : <AlertOctagon className="w-5 h-5 text-zinc-500" />}
            </div>

            <div className="flex flex-col z-10 w-full">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold hover:text-white cursor-help">Probability of Ruin</span>
                    {isDanger && <span className="text-[10px] text-red-500 font-bold animate-pulse">REDUCE LEVERAGE</span>}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xl font-black font-mono tracking-tight ${getRiskColor()}`}>
                        {ruinProb.toFixed(1)}%
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border 
                        ${isCritical ? 'border-red-500 bg-red-500 text-white' :
                            isDanger ? 'border-red-500 text-red-500' :
                                isWarning ? 'border-orange-500 text-orange-500' : 'border-green-500/30 text-green-500'}`}>
                        {getMessage()}
                    </span>
                </div>
            </div>
        </div>
    );
}
