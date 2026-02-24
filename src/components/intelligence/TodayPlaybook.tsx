'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Activity, Layers, Clock, Target } from 'lucide-react';

interface TodayPlaybookProps {
    structuralAnalysis: {
        currentStructure: string;
        volatility: string;
    };
    timeframeBriefing: {
        fourHour: string;
        oneHour: string;
        fifteenMin: string;
    };
    finalInstruction: string;
}

export const TodayPlaybook = ({ structuralAnalysis, timeframeBriefing, finalInstruction }: TodayPlaybookProps) => {
    return (
        <Card className="w-full border-blue-500/30 bg-zinc-950 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <CardContent className="p-5 md:p-6 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        HP1 Intelligence Board
                    </div>
                </div>

                {/* 1. Structural Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 flex items-start gap-3">
                        <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">현재 구조 (Structure)</div>
                            <div className="text-sm font-medium text-zinc-200">{structuralAnalysis.currentStructure}</div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 flex items-start gap-3">
                        <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">변동성 (Volatility)</div>
                            <div className="text-sm font-medium text-zinc-200">{structuralAnalysis.volatility}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Multi-Timeframe Briefing */}
                <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/80 p-4">
                    <div className="flex items-center gap-2 mb-3 text-zinc-400 font-bold text-xs">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        HP1 멀티 타임프레임 브리핑
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-[40px_1fr] items-center gap-2 text-sm">
                            <span className="text-xs font-mono text-zinc-500 font-bold text-right pt-0.5">4H</span>
                            <span className="text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded">{timeframeBriefing.fourHour}</span>
                        </div>
                        <div className="grid grid-cols-[40px_1fr] items-center gap-2 text-sm">
                            <span className="text-xs font-mono text-zinc-500 font-bold text-right pt-0.5">1H</span>
                            <span className="text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded">{timeframeBriefing.oneHour}</span>
                        </div>
                        <div className="grid grid-cols-[40px_1fr] items-center gap-2 text-sm">
                            <span className="text-xs font-mono text-zinc-500 font-bold text-right pt-0.5">15M</span>
                            <span className="text-zinc-300 bg-zinc-800/50 px-3 py-1.5 rounded">{timeframeBriefing.fifteenMin}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Final Strategy Instruction */}
                <div className="bg-indigo-950/40 p-4 rounded-lg border border-indigo-500/30 flex items-start gap-3">
                    <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-1">최종 전략 지시</div>
                        <div className="text-base font-bold text-indigo-100">{finalInstruction}</div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
