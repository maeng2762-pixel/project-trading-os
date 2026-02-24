'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, ShieldAlert } from 'lucide-react';

interface MarketStatusTagsProps {
    structure: 'Higher Low 형성 중' | '단기 박스권 횡보' | '하락 다이버전스 발원';
    volatility: '확장 초기' | '수축 (안정)' | '극심한 변동성';
    overheating: '과매수 (위험)' | '중립' | '단기 쿨다운';
}

export const MarketStatusTags = ({ structure, volatility, overheating }: MarketStatusTagsProps) => {
    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mx-auto">

            {/* Tag 1: Structure */}
            <Card className="border-indigo-500/20 bg-indigo-950/20 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <Activity className="w-4 h-4 text-indigo-400 mb-1" />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">단기 구조</span>
                    <span className="text-xs font-bold text-indigo-200">{structure}</span>
                </CardContent>
            </Card>

            {/* Tag 2: Volatility */}
            <Card className="border-amber-500/20 bg-amber-950/20 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <Zap className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">변동성</span>
                    <span className="text-xs font-bold text-amber-200">{volatility}</span>
                </CardContent>
            </Card>

            {/* Tag 3: Overheating */}
            <Card className="border-rose-500/20 bg-rose-950/20 backdrop-blur-sm">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
                    <ShieldAlert className="w-4 h-4 text-rose-400 mb-1" />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">과열도</span>
                    <span className="text-xs font-bold text-rose-200">{overheating}</span>
                </CardContent>
            </Card>

        </div>
    );
};
