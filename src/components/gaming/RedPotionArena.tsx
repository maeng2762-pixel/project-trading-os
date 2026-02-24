'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Flame, Target, Crosshair, Skull, Lock, Zap, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradingStore } from '@/store/useTradingStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Simple Dot Plot Component for the last 20 simulated trades
const DotPlotGraph = ({ winRate }: { winRate: number }) => {
    // Generate 20 dots based on win rate probability
    const dots = Array.from({ length: 20 }).map((_, i) => {
        // Pseudo-random distribution based on win rate
        const isWin = Math.random() * 100 <= winRate;
        return isWin ? 'WIN' : 'LOSS';
    });

    return (
        <div className="mt-4 p-3 bg-black/40 border border-zinc-800/60 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3" /> 엣지 증명 (최근 20회 시뮬레이션)
                </span>
            </div>
            <div className="flex flex-wrap gap-1">
                {dots.map((res, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${res === 'WIN' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]' : 'bg-rose-900/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export const RedPotionArena = () => {
    const { balance, liveBalance, apiConnected, setPotionMode } = useTradingStore();
    const currentSeed = apiConnected ? liveBalance : balance;

    // Limits
    const MAX_AMMO = 3;
    const MAX_SEED_PERCENT = 10;

    // State
    const [ammo, setAmmo] = useState(MAX_AMMO);
    const [losses, setLosses] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [allocationPercent, setAllocationPercent] = useState(5); // Default 5%

    // EV Call State
    const [aiCall, setAiCall] = useState<{
        entry: number;
        target: number;
        sl: number;
        prob: number;
        rr: number;
        ev: number;
        grade: 'S' | 'A' | 'B' | 'NONE';
        active: boolean;
        breakdown: {
            winRate: number;
            avgRr: number;
            sampleSize: number;
            atrWeight: number;
            confidence: number;
        };
    } | null>(null);

    // Pre-Trade Check State
    const [showPreTrade, setShowPreTrade] = useState(false);
    const [mentalScore, setMentalScore] = useState(50); // Default middle

    // EV Breakdown Modal State
    const [showEvBreakdown, setShowEvBreakdown] = useState(false);

    // Monte Carlo Data
    const [monteCarloData, setMonteCarloData] = useState<{ month: string, balance: number }[]>([]);
    const [rorResult, setRorResult] = useState<number>(0);
    const [expectedReturn, setExpectedReturn] = useState<number>(0);
    const [calculatedLeverage, setCalculatedLeverage] = useState<number>(1);

    useEffect(() => {
        // Real-time Monte Carlo ROR Engine
        const winRate = aiCall ? aiCall.breakdown.winRate / 100 : 0.4;
        const rr = aiCall ? aiCall.rr : 2.0;
        const riskAmount = allocationPercent / 100;

        // Auto Leverage Calculation
        let sysLeverage = 1;

        if (aiCall) {
            const stopDistance = Math.abs(aiCall.entry - aiCall.sl);
            const stopLossPct = (stopDistance / aiCall.entry) * 100;
            sysLeverage = stopLossPct > 0 ? allocationPercent / stopLossPct : 1;

            // EV-based Lockdown (0.3R constraint overrides all)
            if (aiCall.ev < 0.3) {
                sysLeverage = 1;
            } else {
                // Hard Cap 15x
                if (sysLeverage > 15) sysLeverage = 15;
                // Loss Penalty (-50% allowance on 2 losses)
                if (losses >= 2) sysLeverage = sysLeverage * 0.5;
            }
        }
        setCalculatedLeverage(Number(sysLeverage.toFixed(1)));

        // Fear Trigger: Amplify variance artificially in Monte Carlo to scare the user if leverage is high
        const varianceAmplifier = sysLeverage > 10 ? 2.5 : (sysLeverage > 5 ? 1.5 : 1);

        // Simulate 1000 accounts for 100 trades (approx 3 months of active trading)
        const SIMULATIONS = 1000;
        const TRADES_PER_SIM = 100;
        let ruins = 0;
        let totalReturnPercent = 0;

        for (let i = 0; i < SIMULATIONS; i++) {
            let simBalance = 1.0; // Starting at 100% capacity
            let ruined = false;
            for (let j = 0; j < TRADES_PER_SIM; j++) {
                const isWin = Math.random() < winRate;
                const tradeRisk = simBalance * riskAmount * varianceAmplifier; // Amplified risk to show pain of leverage
                if (isWin) {
                    simBalance += tradeRisk * rr;
                } else {
                    simBalance -= tradeRisk;
                }

                if (simBalance <= 0.1) { // 90% drawdown considered ruin
                    ruined = true;
                    break;
                }
            }
            if (ruined) ruins++;
            totalReturnPercent += (simBalance - 1.0);
        }

        setRorResult((ruins / SIMULATIONS) * 100);
        setExpectedReturn((totalReturnPercent / SIMULATIONS) * 100);

        // Generate 6 months growth curve data for chart
        const baseEv = aiCall ? aiCall.ev : 0.1;
        const startBalance = currentSeed;
        let currentBalance = startBalance;

        const newData = [];
        for (let i = 0; i <= 6; i++) {
            if (i === 0) {
                newData.push({ month: 'Now', balance: currentBalance });
                continue;
            }
            // Compound growth simulation: assume 10 trades a month at allocation limit
            const monthlyRiskAmount = (currentBalance * allocationPercent) / 100;
            const monthlyProfit = monthlyRiskAmount * baseEv * 10;
            currentBalance += monthlyProfit;
            newData.push({ month: `M+${i}`, balance: Math.round(currentBalance) });
        }
        setMonteCarloData(newData);
    }, [aiCall, allocationPercent, currentSeed]);

    // No Edge Warning State
    const [noEdgeWarning, setNoEdgeWarning] = useState(false);

    useEffect(() => {
        // Mock checking local storage for lock status
        const lockTime = localStorage.getItem('redPotionLockTime');
        if (lockTime) {
            const timeDiff = Date.now() - Number(lockTime);
            if (timeDiff < 24 * 60 * 60 * 1000) {
                setIsLocked(true);
            } else {
                localStorage.removeItem('redPotionLockTime');
            }
        }
    }, []);

    const generateCall = () => {
        if (ammo <= 0 || isLocked) return;
        setNoEdgeWarning(false);

        // Simulate AI call generation with random values to demonstrate EV Engine
        const basePrice = 65000 + (Math.random() * 1000 - 500);
        const isLong = Math.random() > 0.5;

        // Random R:R between 1.0 and 4.0
        const randomRR = 1.0 + Math.random() * 3.0; // Expected R:R
        const stopDistance = basePrice * 0.01; // 1% stop distance
        const targetDistance = stopDistance * randomRR;

        const entry = Math.round(basePrice);
        const sl = Math.round(isLong ? entry - stopDistance : entry + stopDistance);
        const target = Math.round(isLong ? entry + targetDistance : entry - targetDistance);

        // Win probability inversely proportional to R:R somewhat, but with an edge
        // A 1:2 RR might have a 45% win rate, 1:3 might have 35% win rate
        const prob = Math.round(50 - (randomRR * 5) + (Math.random() * 10 - 5));
        const winProb = Math.max(10, Math.min(90, prob)) / 100;
        const lossProb = 1 - winProb;

        // EV = (WinRate * ExpectedProfitR) - (LossRate * 1R)
        // Adjust EV slightly based on mock ATR weight
        const atrWeight = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const rawExpectedValue = (winProb * randomRR) - (lossProb * 1.0);
        const expectedValue = rawExpectedValue * (atrWeight > 1.0 ? 0.9 : 1.1); // Penalize high volatility

        const sampleSize = Math.floor(20 + Math.random() * 150); // 20 to 170

        // Grade assignment based on new transparent rules
        let grade: 'S' | 'A' | 'B' | 'NONE' = 'NONE';

        if (expectedValue >= 0.6 && sampleSize >= 100 && randomRR >= 2.0) {
            grade = 'S';
        } else if (expectedValue >= 0.3 && sampleSize >= 50 && randomRR >= 1.8) {
            grade = 'A';
        } else if (expectedValue >= 0 && sampleSize >= 20 && randomRR >= 1.5) {
            grade = 'B';
        } else {
            setNoEdgeWarning(true);
            setAiCall(null);
            return;
        }

        const confidence = Math.min(99, Math.max(10, Math.round(winProb * 100 * (sampleSize / 100) * (3 / randomRR))));

        setAiCall({
            entry,
            target,
            sl,
            prob: Math.round(winProb * 100),
            rr: Number(randomRR.toFixed(1)),
            ev: Number(expectedValue.toFixed(2)),
            grade,
            active: true,
            breakdown: {
                winRate: Math.round(winProb * 100),
                avgRr: Number(randomRR.toFixed(1)),
                sampleSize,
                atrWeight: Number(atrWeight.toFixed(2)),
                confidence
            }
        });
    };

    const handlePreTradeExecute = () => {
        if (!aiCall) return;
        setShowPreTrade(true);
    };

    const confirmExecuteTrade = () => {
        if (mentalScore < 40) {
            alert("⚠️ 리스크 과열 상태: 오늘 컨디션 점수가 낮아 진입이 강제 차단됩니다.");
            setShowPreTrade(false);
            setAiCall(null);
            return;
        }
        setShowPreTrade(false);
        // ... proceeding to trade result mockup
        const isWin = Math.random() < (aiCall!.breakdown.winRate / 100);
        executeTrade(isWin ? 'WIN' : 'LOSS');
    };

    const executeTrade = (result: 'WIN' | 'LOSS') => {
        if (!aiCall) return;

        // Ammo Penalty for B Grade or below
        const ammoCost = (aiCall.grade === 'B' || aiCall.grade === 'NONE') ? 2 : 1;
        setAmmo(prev => Math.max(0, prev - ammoCost));

        setAiCall(null);

        if (result === 'LOSS') {
            const newLosses = losses + 1;
            setLosses(newLosses);
            if (newLosses >= 3) {
                // 3 losses = Ammo 0, Glitch, kick to blue
                setAmmo(0);
                setIsLocked(true);
                localStorage.setItem('redPotionLockTime', Date.now().toString());

                // Force Blue Mode transition
                setTimeout(() => {
                    setPotionMode('BLUE');
                }, 4000); // Give 4 seconds to read the lock screen before kicking out
            } else if (newLosses === 2) {
                // Keep playing but leverage allowance is hit (-50%)
                // No immediate lock, the UI will warn them.
            }
        } else {
            setLosses(0);
        }
    };

    if (isLocked) {
        return (
            <div className={`w-full relative min-h-[400px] flex items-center justify-center border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden mt-8 grayscale ${losses >= 3 && 'animate-[pulse_0.1s_ease-in-out_infinite]'}`}>
                <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-10 transition-colors">
                    <Skull className={`w-16 h-16 text-zinc-500 mb-4 mix-blend-screen ${losses >= 3 && 'text-rose-600 animate-spin'}`} />
                    <h2 className="text-3xl font-black text-rose-500 tracking-widest uppercase mb-2">💀 생존 한계선 이탈 (FATAL)</h2>
                    <p className="text-zinc-300 font-bold max-w-md mx-auto leading-relaxed">
                        최대 허용 연패 초과로 자본이 파괴되었습니다. <br />
                        <span className="text-rose-400">시스템이 개입하여 레드포션 모드를 24시간 강제 봉인합니다.</span>
                        {losses >= 3 && (
                            <>
                                <br />
                                <span className="text-xs text-rose-500 animate-pulse mt-2 block font-mono">=== 강제 성채(Blue) 귀환 절차 시작 ===</span>
                            </>
                        )}
                    </p>
                    <div className="mt-8 px-6 py-2 border border-rose-900 bg-black rounded-full text-rose-500 font-mono text-xs">
                        SYS.LOCK.TIMER_ACTIVE: 24h
                    </div>
                </div>
            </div>
        );
    }

    const permittedSeed = currentSeed * (MAX_SEED_PERCENT / 100);

    return (
        <div className="w-full flex justify-center mt-6">
            <Card className="w-full max-w-4xl shadow-2xl overflow-hidden border-rose-900/50 bg-zinc-950 relative">
                {/* Neon Red Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

                {/* Visual indicator for S-Class grade fire effect backdrop */}
                {aiCall?.grade === 'S' && (
                    <div className="absolute inset-0 bg-orange-600/5 blur-[120px] rounded-full mix-blend-color-dodge pointer-events-none transition-opacity duration-1000"></div>
                )}

                <CardHeader className="border-b border-rose-900/30 pb-4 relative z-10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-rose-500 text-2xl font-black italic tracking-wider flex items-center gap-2 uppercase md:text-3xl">
                            <Flame className="w-6 h-6 sm:w-8 sm:h-8" />
                            EV Training Engine
                        </CardTitle>
                        <p className="text-zinc-500 text-[10px] mt-1 tracking-widest uppercase ml-1 sm:ml-10">
                            Asymmetric Betting Arena
                        </p>
                    </div>

                    {/* Ammo System */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">탄창 (Daily Ammo)</span>
                        <div className="flex gap-1.5">
                            {[...Array(MAX_AMMO)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2.5 h-6 sm:w-3 sm:h-8 rounded-sm transition-all duration-300 ${i < ammo ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-zinc-800 border border-zinc-700'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                {/* Pre-Trade Mental Check Modal */}
                {showPreTrade && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
                        <div className="bg-zinc-900 border border-rose-900/50 p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                            <h3 className="text-rose-500 font-bold mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5" /> 사전 멘탈 체크 (Pre-Trade)
                            </h3>
                            <p className="text-xs text-zinc-400 mb-6">참전 전 현재의 컨디션 점수를 솔직하게 기입하세요. 점수가 낮으면 시스템이 참전을 강제 차단합니다.</p>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-300 text-sm">현재 컨디션 / 심리 점수</span>
                                    <span className={`font-mono font-bold ${mentalScore < 40 ? 'text-rose-500' : 'text-emerald-500'}`}>{mentalScore}점</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={mentalScore}
                                    onChange={(e) => setMentalScore(Number(e.target.value))}
                                    className="w-full accent-rose-500"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                                    <span>위험 (뇌동 가능성)</span>
                                    <span>최상 (이성적)</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-400 hover:text-white" onClick={() => setShowPreTrade(false)}>
                                    취소 (관망)
                                </Button>
                                <Button className={`flex-1 font-bold ${mentalScore < 40 ? 'bg-rose-900/50 text-rose-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'}`} onClick={confirmExecuteTrade}>
                                    확인 및 승인
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <CardContent className="p-4 sm:p-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Constraints Panel */}
                        <div className="space-y-6">
                            <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> Guardian Constraints
                                </h3>

                                <div className="space-y-4">
                                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-zinc-400">자본 통제 (Max 10%)</span>
                                            <span className="font-mono text-emerald-400 text-sm font-bold flex items-center gap-1">
                                                ${((currentSeed * allocationPercent) / 100).toFixed(2)} ({allocationPercent}%)
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            step="1"
                                            value={allocationPercent}
                                            onChange={(e) => setAllocationPercent(Number(e.target.value))}
                                            className="w-full accent-rose-500"
                                        />
                                        <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                                            <span>1%</span>
                                            <span>10% Limit</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Risk of Ruin & Monte Carlo Stats */}
                                    <div className="bg-black/40 p-4 rounded-lg border border-rose-900/40 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full"></div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5" /> ☠️ 파산(HP 0) 확률
                                            </span>
                                            <span className={`font-mono text-lg font-black tracking-tighter ${calculatedLeverage >= 10 || rorResult >= 20 ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : (rorResult >= 10 ? 'text-amber-500' : 'text-emerald-400')}`}>
                                                {rorResult.toFixed(1)}%
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                                                <div className="text-[9px] text-zinc-500 mb-1">3개월 기대수익 (MC)</div>
                                                <div className={`text-sm font-mono font-bold ${expectedReturn >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                    {expectedReturn > 0 ? '+' : ''}{expectedReturn.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                                                <div className="text-[9px] text-zinc-500 mb-1">30일 내 -20% 도달</div>
                                                <div className="text-sm font-mono text-rose-400">
                                                    {(allocationPercent * 1.8).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compounding Growth Curve Graphic */}
                                        <div className="h-20 w-full mt-2 border-t border-zinc-800/50 pt-2">
                                            <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">6개월 복리 성장 곡선 (예측)</div>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={monteCarloData}>
                                                    <YAxis domain={['auto', 'auto']} hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }}
                                                        itemStyle={{ color: '#34d399' }}
                                                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                                                        labelStyle={{ color: '#a1a1aa' }}
                                                    />
                                                    <Line type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={1.5} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                        <span className="text-xs text-zinc-400 font-bold bg-zinc-900 px-2 py-1 rounded border border-zinc-700">⚙️ 시스템 계산 레버리지</span>
                                        <span className={`text-sm font-mono font-black ${calculatedLeverage >= 10 ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : (calculatedLeverage > 5 ? 'text-amber-500' : 'text-blue-500')}`}>
                                            {aiCall ? `${calculatedLeverage}x` : '대기중'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                        <span className="text-xs text-zinc-400">독 중독/연패 제어</span>
                                        <span className={`font-mono text-sm font-bold flex items-center gap-1 ${losses >= 2 ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`}>
                                            {losses >= 2 ? '승인 레버리지 -50% 삭감 중' : '3연패 시 24h 잠금'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Output Panel */}
                        <div className="flex flex-col justify-center">
                            {!aiCall ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-rose-900/30 rounded-xl bg-black/20">
                                    <Zap className="w-12 h-12 text-zinc-700 mb-4" />
                                    <h3 className="text-lg font-bold text-zinc-400 mb-2">훈련장 스탠바이</h3>
                                    <p className="text-xs text-zinc-600 mb-6">수학적 엣지(Edge)가 확인된 셋업만 스캔합니다.</p>

                                    {noEdgeWarning && (
                                        <div className="w-full bg-amber-950/30 border border-amber-900/50 text-amber-500 text-xs py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 animate-pulse">
                                            <ShieldAlert className="w-4 h-4" /> ⚠️ 관망이 최적의 전술입니다. (No Edge Detected)
                                        </div>
                                    )}

                                    <Button
                                        onClick={generateCall}
                                        disabled={ammo <= 0}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold tracking-widest uppercase transform transition hover:scale-105 w-full max-w-xs"
                                    >
                                        타겟 스캔 (Scan Edge)
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                    {/* HUD Header */}
                                    <div className={`p-4 rounded-xl border ${aiCall.grade === 'S' ? 'bg-orange-950/40 border-orange-600/50 shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-black/50 border-zinc-800'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {aiCall.grade === 'S' && <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
                                                <span className={`font-black tracking-widest uppercase text-sm ${aiCall.grade === 'S' ? 'text-orange-500' : 'text-amber-500'}`}>
                                                    [전술 등급: {aiCall.grade}급]
                                                </span>
                                                {aiCall.rr >= 6 && (
                                                    <span className="bg-amber-500/20 border border-amber-400 text-amber-500 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                                        💎 소액 자본가용 특수 엣지
                                                    </span>
                                                )}
                                            </div>
                                            {aiCall.grade === 'S' && (
                                                <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                                    S-Class Tactic
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">수학적 기대값 (EV)</span>
                                                <span className="font-mono text-emerald-400 text-lg font-bold">+{aiCall.ev}R</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">평균 수익폭 (Avg Profit)</span>
                                                <span className="font-mono text-white text-lg font-bold">{aiCall.rr}R</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Targets */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/30 border border-zinc-800/80 p-3 rounded-lg text-center">
                                            <span className="text-[10px] text-zinc-500 uppercase block mb-1">진입가 (Entry)</span>
                                            <span className="text-lg font-mono text-white font-bold">{aiCall.entry}</span>
                                        </div>
                                        <div className="bg-black/30 border border-zinc-800/80 p-3 rounded-lg text-center">
                                            <span className="text-[10px] text-zinc-500 uppercase block mb-1">목표가 (Target)</span>
                                            <span className="text-lg font-mono text-emerald-400 font-bold">{aiCall.target}</span>
                                        </div>
                                        <div className="col-span-2 bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg text-center">
                                            <span className="text-[10px] text-rose-400 uppercase block mb-1 font-bold tracking-widest">
                                                손절 = 무효화 조건 충족 (Invalidation)
                                            </span>
                                            <span className="text-lg font-mono text-rose-500 font-bold">{aiCall.sl}</span>
                                        </div>
                                    </div>

                                    {/* Dot Plot Edge Visualizer */}
                                    <DotPlotGraph winRate={aiCall.prob} />

                                    <div className="flex flex-col gap-2 pt-4">
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => executeTrade('LOSS')}
                                                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 h-12 font-bold transition-all"
                                            >
                                                무효화 (기각)
                                            </Button>
                                            <Button
                                                onClick={handlePreTradeExecute}
                                                disabled={aiCall.ev <= 0.3}
                                                className={`flex-[2] h-12 font-black text-lg tracking-widest transition-all ${aiCall.ev <= 0.3 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'}`}
                                            >
                                                {aiCall.ev <= 0.3 ? 'EV 미달 (차단)' : '참전 승인 (EXECUTE)'}
                                            </Button>
                                        </div>
                                        {aiCall.ev > 0.3 && (
                                            <div className="text-center mt-1 animate-pulse">
                                                <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                                                    이 전략을 무시할 경우 장기 기대손실: <span className="text-rose-500">-{aiCall.ev.toFixed(2)}R</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
