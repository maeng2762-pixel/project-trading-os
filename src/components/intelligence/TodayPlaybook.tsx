'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Activity, Layers, Clock, Target } from 'lucide-react';

interface TodayPlaybookProps {
    analysis?: {
        direction: string;
        score: number;
        actionGrade?: string;
        marketRegime?: string;
        isSlingshotMomentumAligned?: boolean;
        isVolatilityExpansion?: boolean;
        kellyFraction?: number;
        reasons?: string[];
        explanation?: string;
    } | null;
}

export const TodayPlaybook = ({ analysis }: TodayPlaybookProps) => {

    const regimeColorMap: Record<string, string> = {
        'TREND_UP': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        'TREND_DOWN': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        'RANGE': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
        'HIGH_VOL': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        'LOW_VOL': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        'LIQ_HUNT': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    };

    const gradeColorMap: Record<string, string> = {
        'SSS': 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]',
        'S': 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
        'A+': 'text-emerald-400',
        'A': 'text-blue-400',
        'F': 'text-zinc-600',
    };

    const momentumActive = analysis?.isSlingshotMomentumAligned || analysis?.isVolatilityExpansion;

    return (
        <Card className={`w-full bg-zinc-950 shadow-lg relative overflow-hidden transition-all duration-500 ${momentumActive ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-blue-500/30'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${momentumActive ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-blue-500'}`}></div>
            <CardContent className="p-5 md:p-6 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                    <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase tracking-widest text-xs">
                        <Activity className={`w-4 h-4 ${momentumActive ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`} />
                        HP1 Momentum Engine
                    </div>
                    {analysis && (
                        <div className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${regimeColorMap[analysis.marketRegime || 'RANGE'] || regimeColorMap['RANGE']}`}>
                            Regime: {analysis.marketRegime || 'UNKNOWN'}
                        </div>
                    )}
                </div>

                {!analysis ? (
                    <div className="py-8 text-center text-zinc-500 text-sm animate-pulse">
                        시장 데이터 동기화 중... (Sentinel 대기)
                    </div>
                ) : (
                    <>
                        {/* 1. Grade & Sizing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 flex items-start gap-3">
                                <Target className={`w-6 h-6 shrink-0 mt-0.5 ${gradeColorMap[analysis.actionGrade || 'F']}`} />
                                <div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Target Grade</div>
                                    <div className={`text-xl font-black tracking-tighter ${gradeColorMap[analysis.actionGrade || 'F']}`}>
                                        {analysis.actionGrade || 'F'}
                                    </div>
                                    {analysis.actionGrade === 'F' && (
                                         <div className="text-xs text-zinc-400 mt-1">타점 비활성 (관망 권장)</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 flex items-start gap-3 relative overflow-hidden">
                                {momentumActive && <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>}
                                <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 relative z-10" />
                                <div className="relative z-10">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Risk Allocation</div>
                                    <div className="text-sm font-medium text-zinc-200">
                                        켈리 비중: <span className="text-indigo-400 font-bold">{((analysis.kellyFraction || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-1">
                                        모멘텀 승격제: {momentumActive ? <span className="text-amber-400 font-bold">활성화됨 (Active)</span> : '대기 상태'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Core Signals */}
                        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/80 p-4">
                            <div className="flex items-center gap-2 mb-3 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-zinc-500" />
                                Live Assessment
                            </div>
                            <div className="space-y-3">
                                <div className="text-sm text-zinc-300 leading-relaxed">
                                    {analysis.explanation || "대기 상태입니다."}
                                </div>
                                <div className="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold text-right pt-0.5 uppercase">Direction</span>
                                    <span className={`px-3 py-1.5 rounded font-bold text-sm ${analysis.direction === 'LONG' ? 'text-emerald-400 bg-emerald-950/30' : analysis.direction === 'SHORT' ? 'text-rose-400 bg-rose-950/30' : 'text-zinc-500 bg-zinc-800/50'}`}>
                                        {analysis.direction} (Score: {analysis.score})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
