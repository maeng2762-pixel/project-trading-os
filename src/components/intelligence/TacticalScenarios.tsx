'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, AlertCircle, ChevronDown, ChevronUp, Flag, Crosshair } from 'lucide-react';
import { TradeEntryCard } from '@/components/trading/TradeEntryCard';
import { AnalysisResult } from '@/lib/analysis';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthButton } from '@/components/auth/AuthButton';

interface TacticalScenariosProps {
    scenarioA: {
        title: string;
        entry: string;
        invalidation: string;
        rr: string;
    };
    scenarioB: {
        title: string;
        entry: string;
        invalidation: string;
        rr: string;
    };
    analysis: AnalysisResult | null;
}

export const TacticalScenarios = ({ scenarioA, scenarioB, analysis }: TacticalScenariosProps) => {
    const { user } = useAuthStore();
    const [showCalculator, setShowCalculator] = useState(false);

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-zinc-800/50 bg-zinc-950/50">
                <CardTitle className="flex justify-between items-center text-lg">
                    <span className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        조건부 전술 가이드
                    </span>
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-1">시장의 확정적 미래는 없습니다. 제시된 조건이 달성될 때만 전술을 집행하세요.</p>
            </CardHeader>

            {user ? (
                <>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">

                            {/* Scenario A */}
                            <div className="p-6 hover:bg-zinc-800/20 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest">SCENARIO A</span>
                                        <h4 className="font-bold text-white text-sm">{scenarioA.title}</h4>
                                    </div>
                                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">RR {scenarioA.rr}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm text-zinc-300">
                                        <Crosshair className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-zinc-400 block mb-0.5 text-xs">진입 조건</span>
                                            {scenarioA.entry}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-red-300 bg-red-950/20 border border-red-500/10 p-2.5 rounded-md">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-red-400 block mb-0.5 text-xs">무효화 (손절)</span>
                                            {scenarioA.invalidation}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scenario B */}
                            <div className="p-6 hover:bg-zinc-800/20 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-widest">SCENARIO B</span>
                                        <h4 className="font-bold text-white text-sm">{scenarioB.title}</h4>
                                    </div>
                                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">RR {scenarioB.rr}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm text-zinc-300">
                                        <Crosshair className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-zinc-400 block mb-0.5 text-xs">진입 조건</span>
                                            {scenarioB.entry}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-red-300 bg-red-950/20 border border-red-500/10 p-2.5 rounded-md">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-red-400 block mb-0.5 text-xs">무효화 (손절)</span>
                                            {scenarioB.invalidation}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </CardContent>

                    <CardFooter className="bg-zinc-950 border-t border-zinc-800/50 p-4 flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200"
                            onClick={() => setShowCalculator(!showCalculator)}
                        >
                            ⚙️ 나의 리스크에 맞게 전술 계산하기
                            {showCalculator ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </Button>

                        {/* Tactical Calculator Panel */}
                        {showCalculator && (
                            <div className="w-full animate-in slide-in-from-top-4 fade-in duration-300">
                                <TradeEntryCard analysis={analysis} />
                            </div>
                        )}
                    </CardFooter>
                </>
            ) : (
                <CardContent className="p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                    {/* Blurred Background Fake Content */}
                    <div className="absolute inset-0 grid grid-cols-2 divide-x divide-zinc-800 opacity-20 blur-md pointer-events-none select-none">
                        <div className="p-6">
                            <div className="h-4 w-24 bg-zinc-700 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-10 w-full bg-zinc-700 rounded"></div>
                                <div className="h-10 w-full bg-rose-900 rounded"></div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="h-4 w-24 bg-zinc-700 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-10 w-full bg-zinc-700 rounded"></div>
                                <div className="h-10 w-full bg-rose-900 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <span className="text-2xl block">🔒</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">무료 계정 생성 후 열람 가능</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                            구체적인 매수/매도 진입 가격과 손절 방어선 시나리오를 보려면 구글 로그인이 필요합니다.
                        </p>
                        <AuthButton />
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
