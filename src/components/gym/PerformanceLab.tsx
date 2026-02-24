'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, AlertOctagon, Brain, DollarSign } from 'lucide-react';

export const PerformanceLab = () => {
    // Mock data for the Gym dashboard
    return (
        <Card className="w-full border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shadow-xl overflow-hidden mt-8">
            <CardHeader className="pb-4 border-b border-indigo-500/20 bg-indigo-950/10">
                <CardTitle className="flex justify-between items-center text-lg">
                    <span className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-400" />
                        HP1 Performance Lab <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1.5 py-0.5 rounded font-black tracking-widest ml-2">PRO</span>
                    </span>
                    <span className="text-xs text-zinc-500 font-normal hidden sm:inline-block">나의 치명적 매매 패턴 교정소</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* 1. Average RR Tracking */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                        <Target className="w-4 h-4 text-emerald-500/50 absolute top-3 left-3" />
                        <span className="text-xs text-zinc-500 font-bold mb-1">최근 20회 평균 손익비(RR)</span>
                        <div className="text-3xl font-black text-emerald-400 my-2">1 : 1.8</div>
                        <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">목표(1.5) 초과 달성 중</span>
                    </div>

                    {/* 2. Delayed Stop-Loss Detection */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                        <AlertOctagon className="w-4 h-4 text-rose-500/50 absolute top-3 left-3" />
                        <span className="text-xs text-zinc-500 font-bold mb-1">손절 지연 감지기</span>
                        <div className="text-3xl font-black text-rose-500 my-2">3<span className="text-lg text-rose-500/70">회</span></div>
                        <span className="text-[10px] text-zinc-400">지연으로 발생한 누수: <b className="text-rose-400">-$420</b></span>
                    </div>

                    {/* 3. Emotion vs PnL */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                        <TrendingUp className="w-4 h-4 text-indigo-500/50 absolute top-3 left-3" />
                        <span className="text-xs text-zinc-500 font-bold mb-3">감정 상태별 승률</span>
                        <div className="w-full space-y-2 px-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-emerald-400">원칙 준수</span>
                                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex items-center justify-end">
                                    <div className="h-full bg-emerald-500" style={{ width: '68%' }}></div>
                                </div>
                                <span className="text-white w-6 text-right font-mono">68%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-amber-400">포모(FOMO)</span>
                                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex items-center justify-end">
                                    <div className="h-full bg-amber-500" style={{ width: '32%' }}></div>
                                </div>
                                <span className="text-white w-6 text-right font-mono">32%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-rose-400">뇌동 매매</span>
                                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex items-center justify-end">
                                    <div className="h-full bg-rose-500" style={{ width: '15%' }}></div>
                                </div>
                                <span className="text-white w-6 text-right font-mono">15%</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. EV Simulation */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                        <DollarSign className="w-4 h-4 text-amber-500/50 absolute top-3 left-3" />
                        <span className="text-xs text-zinc-500 font-bold mb-1">다음 100회 시뮬레이션 (EV)</span>
                        <div className="text-3xl font-black text-amber-400 my-2">+45<span className="text-lg text-amber-500/70">%</span></div>
                        <span className="text-[10px] text-zinc-400 text-center leading-tight">현재 승률(42%)과 RR(1.8) 유지 시<br />기대되는 계좌 성장률</span>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
