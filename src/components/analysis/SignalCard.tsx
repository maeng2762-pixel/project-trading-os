'use client';
import React, { useState } from 'react';
import { AnalysisResult } from '@/lib/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, Info, ShieldAlert, Zap, TrendingUp, TrendingDown, Minus, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguageStore } from '@/store/useLanguageStore';
import { SurvivalGauge } from './SurvivalGauge';

interface SignalCardProps {
    analysis: AnalysisResult | null;
}

export const SignalCard = ({ analysis }: SignalCardProps) => {
    const { t } = useLanguageStore();
    const [showWhy, setShowWhy] = useState(false);

    if (!analysis) {
        return (
            <Card className="w-full border-zinc-800 bg-zinc-900/50 text-white animate-pulse">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Radar className="h-4 w-4" />
                        The Cockpit
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-32 flex items-center justify-center text-xs text-zinc-600">
                    Scanning Market (HP1 Protocol)...
                </CardContent>
            </Card>
        );
    }

    const { direction, score, bullishProb, bearishProb, riskLevel, recommendedSize, isCapped, recommendedLeverage, reasons, explanation } = analysis;

    // Direction Colors
    const isLong = direction === 'LONG';
    const isShort = direction === 'SHORT';
    const isNeutral = direction === 'NEUTRAL';

    let cardBorder = 'border-zinc-800';
    let biasColor = 'text-zinc-400';
    let biasIcon = <Minus className="h-6 w-6" />;

    if (isLong) {
        cardBorder = 'border-green-500/50';
        biasColor = 'text-green-400';
        biasIcon = <TrendingUp className="h-6 w-6" />;
    } else if (isShort) {
        cardBorder = 'border-red-500/50';
        biasColor = 'text-red-400';
        biasIcon = <TrendingDown className="h-6 w-6" />;
    }

    const riskLabelKey = riskLevel === 'HIGH' ? 'signal.risk_high' : riskLevel === 'MEDIUM' ? 'signal.risk_medium' : 'signal.risk_low';

    return (
        <Card className={`w-full ${cardBorder} bg-zinc-900/80 text-white transition-all duration-500 shadow-2xl`}>

            {/* 1. Header: Market Bias & Probability Gauge */}
            <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-xl font-black tracking-tighter uppercase flex items-center gap-2 ${biasColor}`}>
                        {bindingIcon(direction)}
                        {direction === 'LONG' ? t('signal.bullish_bias') : direction === 'SHORT' ? t('signal.bearish_bias') : t('signal.neutral')}
                    </h2>

                    {/* v5.0 Action Grade Badge */}
                    {analysis.actionGrade && (
                        <div className={`
                            flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)]
                            ${analysis.actionGrade === 'S' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse' :
                                analysis.actionGrade === 'A' ? 'bg-green-500/20 border-green-500 text-green-400' :
                                    analysis.actionGrade === 'B' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                                        'bg-zinc-800 border-zinc-700 text-zinc-500'}
                        `}>
                            <span className="text-xs font-bold font-mono">GRADE</span>
                            <span className="text-lg font-black italic">{analysis.actionGrade}</span>
                        </div>
                    )}
                </div>

                {/* Survival Score (v3.0) - Inserted here */}
                <SurvivalGauge analysis={analysis} />

                {/* Probability Gauge Bar */}
                <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex mt-2">
                    <div
                        className="h-full bg-green-500 transition-all duration-1000 ease-out"
                        style={{ width: `${bullishProb}%` }}
                    />
                    <div
                        className="h-full bg-red-500 transition-all duration-1000 ease-out"
                        style={{ width: `${bearishProb}%` }}
                    />
                    {/* Center Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-zinc-950 z-10"></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                    <span className="text-green-500/80">{t('signal.bullish')} {bullishProb}%</span>
                    <span className="text-red-500/80">{t('signal.bearish')} {bearishProb}%</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {/* Risk Level */}
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{t('signal.vol_risk')}</span>
                        <div className={`flex items-center gap-1 font-bold ${riskLevel === 'HIGH' ? 'text-red-500' : riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>
                            <ShieldAlert className="h-3 w-3" />
                            {t(riskLabelKey)}
                        </div>
                    </div>

                    {/* Entry Size (With Safety Cap) */}
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{t('signal.rec_size')}</span>
                        <span className="text-lg font-mono font-bold text-white relative z-10">{recommendedSize}%</span>

                        {/* Safety Cap Indicator */}
                        {isCapped && (
                            <div className="absolute top-0 right-0 p-1">
                                <Lock className="h-3 w-3 text-amber-500" />
                            </div>
                        )}
                        {isCapped && (
                            <div className="absolute bottom-0 w-full h-0.5 bg-amber-500/50"></div>
                        )}
                    </div>

                    {/* Max Lev */}
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">{t('signal.max_lev')}</span>
                        <span className="text-lg font-mono font-bold text-indigo-400">
                            {recommendedLeverage}x
                        </span>
                    </div>
                </div>

                {isCapped && (
                    <p className="text-[10px] text-amber-500/80 text-center flex items-center justify-center gap-1 bg-amber-500/5 py-1 rounded">
                        <Lock className="h-3 w-3" /> {t('signal.safety_cap')}
                    </p>
                )}


                {/* 3. Why? Accordion Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-zinc-500 hover:text-white h-8 text-xs flex items-center justify-between border-t border-zinc-800/50 mt-2"
                    onClick={() => setShowWhy(!showWhy)}
                >
                    <span className="flex items-center gap-1"><Info className="h-3 w-3" /> {t('signal.why')}</span>
                    {showWhy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>

                {/* 4. Detailed Analysis (Accordion Content) */}
                {showWhy && (
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-xs space-y-3 animate-in fade-in slide-in-from-top-1 shadow-inner">
                        <div className="prose prose-invert prose-xs max-w-none">
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                                {explanation || "Analysis data unavailable."}
                            </p>
                        </div>

                        {/* Technical Footer */}
                        <div className="pt-3 border-t border-zinc-900 grid grid-cols-2 gap-4 text-[10px]">
                            <div>
                                <span className="text-zinc-600 uppercase block">RSI (14)</span>
                                <span className={`font-mono font-bold text-sm ${analysis.details?.['1h'] && analysis.details['1h'].rsi < 30 ? 'text-green-500' : analysis.details?.['1h'] && analysis.details['1h'].rsi > 70 ? 'text-red-500' : 'text-zinc-400'}`}>
                                    {analysis.details?.['1h']?.rsi.toFixed(1) || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-zinc-600 uppercase block">ATR (Vol)</span>
                                <span className="font-mono font-bold text-sm text-zinc-400">
                                    {analysis.atr.toFixed(1)} USDT
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

function bindingIcon(direction: string) {
    if (direction === 'LONG') return <TrendingUp className="h-5 w-5" />;
    if (direction === 'SHORT') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
}
