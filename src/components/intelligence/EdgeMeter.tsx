'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface EdgeMeterProps {
    longProb: number;  // e.g. 63
    shortProb: number; // e.g. 37
}

export const EdgeMeter = ({ longProb, shortProb }: EdgeMeterProps) => {
    // We assume the rest is neutral/wait if they don't sum to 100.
    // For this design: [🟢 매수 우위 63% | 🔴 매도 우위 37% | ⚖️ 관망 0%]
    // The user specifically requested 3 colors: Green, Red, Gray/Yellow (Wait).
    // Let's ensure they sum to 100. If long + short < 100, the rest is wait.

    // As per user prompt example: [🟢 매수 우위 63% | 🔴 매도 우위 17% | ⚖️ 관망 20%]
    // I will use 63, 17, 20 as defaults if props aren't provided exactly.
    const l = longProb;
    const s = shortProb;
    const w = Math.max(0, 100 - (l + s));

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-white shadow-xl relative overflow-hidden">
            <CardContent className="pt-6 pb-6 flex flex-col items-center">

                {/* 1. Header */}
                <div className="text-center mb-4">
                    <h3 className="text-zinc-500 text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-1">
                        <Target className="w-3 h-3" /> Market Edge Distribution
                    </h3>
                </div>

                {/* 2. Traffic Light Bar */}
                <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-bold px-1">
                        <span className="text-emerald-400">🟢 매수 우위 {l}%</span>
                        {w > 0 && <span className="text-zinc-400">⚖️ 관망 {w}%</span>}
                        <span className="text-rose-400">🔴 매도 우위 {s}%</span>
                    </div>

                    {/* The Bar */}
                    <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                        {l > 0 && (
                            <div
                                className="h-full bg-emerald-500/80 transition-all duration-700 relative flex items-center justify-center"
                                style={{ width: `${l}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                            </div>
                        )}
                        {w > 0 && (
                            <div
                                className="h-full bg-zinc-600/80 transition-all duration-700 relative flex items-center justify-center border-l border-r border-zinc-700/50"
                                style={{ width: `${w}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5" />
                            </div>
                        )}
                        {s > 0 && (
                            <div
                                className="h-full bg-rose-500/80 transition-all duration-700 relative flex items-center justify-center"
                                style={{ width: `${s}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
