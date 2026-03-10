'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, ShieldAlert } from 'lucide-react';

interface MarketStatusTagsProps {
    analysis?: {
        marketRegime?: string;
        isSlingshotMomentumAligned?: boolean;
        direction?: string;
    } | null;
}

export const MarketStatusTags = ({ analysis }: MarketStatusTagsProps) => {
    
    // Default values if analysis is not ready
    const structureText = analysis?.marketRegime || '분석 대기';
    const volatilityText = analysis?.isSlingshotMomentumAligned ? '모멘텀 정렬' : '응축/대기';
    const directionText = analysis?.direction || '중립';

    const isMomentum = analysis?.isSlingshotMomentumAligned;

    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mx-auto">

            {/* Tag 1: Scheme / Regime */}
            <Card className="border-indigo-500/20 bg-indigo-950/20 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <Activity className="w-4 h-4 text-indigo-400 mb-1" />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">시장 체제</span>
                    <span className="text-xs font-bold text-indigo-200">{structureText}</span>
                </CardContent>
            </Card>

            {/* Tag 2: Momentum / Slingshot */}
            <Card className={`border-amber-500/20 backdrop-blur-sm transition-colors ${isMomentum ? 'bg-amber-500/10' : 'bg-amber-950/20'}`}>
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <Zap className={`w-4 h-4 mb-1 ${isMomentum ? 'text-amber-400 animate-bounce' : 'text-amber-600'}`} />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">모멘텀 엔진</span>
                    <span className={`text-xs font-bold ${isMomentum ? 'text-amber-400' : 'text-amber-200'}`}>{volatilityText}</span>
                </CardContent>
            </Card>

            {/* Tag 3: Action Bias */}
            <Card className={`border-rose-500/20 backdrop-blur-sm ${directionText === 'LONG' ? 'bg-emerald-950/20 border-emerald-500/20' : directionText === 'SHORT' ? 'bg-rose-950/20' : 'bg-zinc-950/20 border-zinc-500/20'}`}>
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <ShieldAlert className={`w-4 h-4 mb-1 ${directionText === 'LONG' ? 'text-emerald-400' : directionText === 'SHORT' ? 'text-rose-400' : 'text-zinc-500'}`} />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">단기 바이어스</span>
                    <span className={`text-xs font-bold ${directionText === 'LONG' ? 'text-emerald-400' : directionText === 'SHORT' ? 'text-rose-400' : 'text-zinc-400'}`}>{directionText}</span>
                </CardContent>
            </Card>

        </div>
    );
};
