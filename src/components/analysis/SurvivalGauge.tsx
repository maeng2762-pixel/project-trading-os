'use client';
import React from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { AnalysisResult } from '@/lib/analysis';
import { Shield, ShieldCheck, ShieldAlert, Skull } from 'lucide-react';

export const SurvivalGauge = ({ analysis }: { analysis: AnalysisResult | null }) => {
    const { t } = useLanguageStore();

    if (!analysis) return null;

    // Calculate Score
    const { recommendedLeverage, atr, riskLevel } = analysis;

    // 1. Leverage Penalty
    // 1x = 0 penalty. 5x = 20 penalty. 10x = 45 penalty (non-linear?). 
    // Let's use linear for now: (Lev - 1) * 8
    const levPenalty = Math.max(0, (recommendedLeverage - 1) * 8);

    // 2. Volatility Penalty
    // Risk High = 30, Medium = 15, Low = 0.
    let volPenalty = 0;
    if (riskLevel === 'HIGH') volPenalty = 30;
    else if (riskLevel === 'MEDIUM') volPenalty = 15;

    // Base Score
    let score = 100 - levPenalty - volPenalty;
    score = Math.max(0, Math.min(100, score));

    // Color & Icon
    let color = 'text-green-500';
    let icon = <ShieldCheck className="h-4 w-4" />;

    if (score < 50) {
        color = 'text-red-500 animate-pulse';
        icon = <Skull className="h-4 w-4" />;
    } else if (score < 75) {
        color = 'text-yellow-500';
        icon = <ShieldAlert className="h-4 w-4" />;
    }

    // Gradient bar width
    const width = `${score}%`;

    return (
        <div className="flex flex-col gap-1 w-full mt-2 p-2 bg-zinc-950/30 rounded-lg border border-zinc-800/50">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    {icon} {t('survival.title')}
                </span>
                <span className={`text-sm font-black font-mono ${color}`}>
                    {score.toFixed(0)}%
                </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                    className={`h-full transition-all duration-1000 ${score < 50 ? 'bg-red-500' : score < 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: width }}
                ></div>
            </div>

            {score < 50 && (
                <p className="text-[9px] text-red-400 mt-1 text-right">
                    ⚠️ {t('signal.risk_high')} - Reduce Lev or Wait
                </p>
            )}
        </div>
    );
};
