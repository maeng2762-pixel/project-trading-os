'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Crosshair, AlertTriangle, Calculator, DollarSign, Percent, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthButton } from '@/components/auth/AuthButton';

export const ShieldCalculator = () => {
    const { user } = useAuthStore();

    const [seed, setSeed] = useState<number>(10000);
    const [entry, setEntry] = useState<string>('');
    const [stopLoss, setStopLoss] = useState<string>('');
    const [target, setTarget] = useState<string>('');
    const [riskInput, setRiskInput] = useState<number>(1); // Default 1% risk

    const [results, setResults] = useState({
        size: 0,
        margin: 0,
        sysLeverage: 1,
        expectedLossAmount: 0,
        rr: 0,
        ror: 0,
        isOverMaxCap: false,
        adjustedRiskPct: 0,
    });

    const isBlocked = !entry || !stopLoss;

    useEffect(() => {
        const entryVal = parseFloat(entry);
        const slVal = parseFloat(stopLoss);
        const targetVal = parseFloat(target);
        const riskPct = Number(riskInput) || 1;

        if (isNaN(entryVal) || isNaN(slVal) || !seed || entryVal === slVal) {
            setResults({ size: 0, margin: 0, sysLeverage: 1, expectedLossAmount: 0, rr: 0, ror: 0, isOverMaxCap: false, adjustedRiskPct: riskPct });
            return;
        }

        const riskPerUnit = Math.abs(entryVal - slVal);
        const stopLossPct = (riskPerUnit / entryVal) * 100;
        const targetPerUnit = isNaN(targetVal) ? 0 : Math.abs(targetVal - entryVal);
        let rr = targetPerUnit > 0 ? targetPerUnit / riskPerUnit : 0;

        // Auto Leverage = Risk % / Stop Loss %
        let sysLeverage = riskPct / stopLossPct;
        let isOverMaxCap = false;
        let finalRiskPct = riskPct;

        // Blue Potion Constraint: Max 3x Leverage
        if (sysLeverage > 3) {
            sysLeverage = 3;
            isOverMaxCap = true;
            finalRiskPct = 3 * stopLossPct; // Adjusted risk based on capped leverage
        }

        const lossAllowance = seed * (finalRiskPct / 100);
        const qty = lossAllowance / riskPerUnit;
        const positionValue = qty * entryVal;
        const marginReq = positionValue / sysLeverage;

        // ROR Simulation (Assuming 40% win rate for manual calculator if no edge is proven)
        let ruins = 0;
        const winRate = 0.4;
        const SIMULATIONS = 1000;
        const TRADES = 100;
        for (let i = 0; i < SIMULATIONS; i++) {
            let simBalance = 1.0;
            let ruined = false;
            for (let j = 0; j < TRADES; j++) {
                if (simBalance <= 0.1) { ruined = true; break; }
                const isWin = Math.random() < winRate;
                if (isWin) simBalance += (finalRiskPct / 100) * (rr > 0 ? rr : 2);
                else simBalance -= (finalRiskPct / 100);
            }
            if (ruined) ruins++;
        }
        const ror = (ruins / SIMULATIONS) * 100;

        setResults({
            size: qty,
            margin: marginReq,
            sysLeverage: Number(sysLeverage.toFixed(2)),
            expectedLossAmount: lossAllowance,
            rr: rr,
            ror: ror,
            isOverMaxCap: isOverMaxCap,
            adjustedRiskPct: finalRiskPct,
        });

    }, [seed, entry, stopLoss, target, riskInput]);

    const isDanger = riskInput > 2;

    return (
        <Card className={`w-full shadow-xl overflow-hidden transition-colors duration-500 border ${isDanger ? 'border-rose-500/50 bg-rose-950/20' : 'border-zinc-800 bg-zinc-900'} relative`}>
            {isDanger && <div className="absolute inset-0 bg-rose-500/5 pointer-events-none animate-pulse"></div>}

            <CardHeader className={`pb-4 border-b ${isDanger ? 'border-rose-500/30 bg-rose-500/10' : 'border-zinc-800/50 bg-zinc-950/50'}`}>
                <CardTitle className="flex justify-between items-center text-lg z-10 relative">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${isDanger ? 'text-rose-400' : 'text-indigo-400'}`} />
                        <span className={isDanger ? 'text-rose-100' : 'text-white'}>강제 통제 계산기 (The Shield)</span>
                    </span>
                </CardTitle>
                <p className={`text-xs mt-1 z-10 relative ${isDanger ? 'text-rose-300' : 'text-zinc-500'}`}>
                    감정이 개입할 틈을 주지 마십시오. 리스크를 숫자로 확인하고 진입하십시오.
                </p>
            </CardHeader>

            {!user ? (
                <CardContent className="p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                    <div className="absolute inset-0 grid grid-cols-2 divide-x divide-zinc-800 opacity-20 blur-md pointer-events-none select-none px-6 py-8">
                        <div className="space-y-4 pr-6"><div className="h-10 bg-zinc-800 rounded"></div><div className="h-10 bg-zinc-800 rounded"></div></div>
                        <div className="space-y-4 pl-6"><div className="h-24 bg-zinc-800 rounded"></div></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <span className="text-2xl block">🔒</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">무료 계정 생성 후 통제 시스템 접근</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                            계좌 생존을 위한 손절폭 계산 및 리스크 시뮬레이터를 사용하려면 로그인이 필요합니다.
                        </p>
                        <AuthButton />
                    </div>
                </CardContent>
            ) : (
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">

                    {/* INPUT SECTION */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Crosshair className="w-3 h-3" /> 작전 파라미터 입력
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1 block">현재 계좌 시드 (USDT)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <Input
                                        type="number"
                                        value={seed}
                                        onChange={(e) => setSeed(Number(e.target.value))}
                                        className="bg-zinc-950 border-zinc-800 pl-9 text-white focus-visible:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">진입가 (Entry)</label>
                                    <Input
                                        type="number"
                                        placeholder="ex) 67800"
                                        value={entry}
                                        onChange={(e) => setEntry(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-rose-400 mb-1 block font-bold">손절가 (Stop Loss) <span className="text-rose-500">*</span></label>
                                    <Input
                                        type="number"
                                        placeholder="필수 입력"
                                        value={stopLoss}
                                        onChange={(e) => setStopLoss(e.target.value)}
                                        className={`bg-zinc-950 border-rose-900/50 text-white focus-visible:ring-rose-500 ${!stopLoss && 'animate-pulse'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOCKED SECTION */}
                    <div className="space-y-4 relative">
                        {isBlocked && (
                            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-zinc-950/80 flex flex-col items-center justify-center border border-rose-500/20 rounded-xl p-4">
                                <span className="text-3xl mb-2">🔒</span>
                                <p className="text-sm text-rose-400 font-bold text-center leading-relaxed">
                                    통제 절차 위반 <br />
                                    <span className="text-zinc-400 text-xs font-normal">손절가(SL)를 먼저 확정해야 투입 수량을 계산할 수 있습니다.</span>
                                </p>
                            </div>
                        )}

                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Calculator className="w-3 h-3" /> 수량 통제 및 목표
                        </h4>

                        <div className={`p-4 rounded-xl border ${isDanger && !isBlocked ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-950/50 border-zinc-800/80'} space-y-4`}>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="text-[10px] text-zinc-500 mb-1 block">허용 리스크 (기본 1%)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={riskInput}
                                            onChange={(e) => setRiskInput(Number(e.target.value))}
                                            className={`h-8 text-xs bg-zinc-900 border-zinc-800 text-white pr-6 ${isDanger ? 'border-rose-500 text-rose-400 font-bold' : ''}`}
                                            disabled={isBlocked}
                                        />
                                        <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-emerald-500 mb-1 block">목표가 (Target)</label>
                                    <Input
                                        type="number"
                                        placeholder="선택"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="h-8 text-xs bg-zinc-900 border-emerald-900/50 text-white focus-visible:ring-emerald-500"
                                        disabled={isBlocked}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
                                <span className="text-sm text-zinc-400">시드 대비 예상 피해액</span>
                                <div className="text-right">
                                    <span className={`text-lg font-black flex items-center justify-end gap-1 ${isDanger ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        -${results.expectedLossAmount.toFixed(2)}
                                        {isDanger && <AlertTriangle className="w-4 h-4 ml-1" />}
                                    </span>
                                    {results.isOverMaxCap && (
                                        <div className="text-[10px] text-amber-500 font-bold mt-1">
                                            Max 3x 초과로 리스크 강제 삭감 (목표 {riskInput}% 👉 실제 {results.adjustedRiskPct.toFixed(1)}%)
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pb-1">
                                <span className="text-xs text-zinc-400 font-bold bg-zinc-900 px-2 py-1 rounded border border-zinc-700">⚙️ 시스템 계산 레버리지</span>
                                <span className={`text-sm font-mono font-black ${results.isOverMaxCap ? 'text-amber-400' : 'text-blue-400'}`}>
                                    {results.sysLeverage}x
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-1">
                                <span className="text-xs text-zinc-500">기대 손익비 (RR)</span>
                                <span className={`text-sm font-mono ${results.rr >= 2 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    1 : {results.rr.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-1">
                                <span className="text-xs text-zinc-500">파산 확률 (ROR)</span>
                                <span className={`text-sm font-mono font-bold ${results.ror > 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                                    {results.ror.toFixed(1)}%
                                </span>
                            </div>

                            <div className="pt-3 border-t border-zinc-800/60 mt-2">
                                <div className="text-[10px] text-zinc-500 uppercase mb-1">HP1 통제 안전 진입 수량 (Size)</div>
                                <div className="text-2xl font-black text-white">
                                    {results.size > 0 ? results.size.toFixed(4) : '0.0000'} <span className="text-sm font-normal text-zinc-500">단위</span>
                                </div>
                            </div>

                            {/* ROR Execution Lock Mockup (Since this is a calculator) */}
                            {results.ror > 5 && (
                                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg text-center animate-in slide-in-from-bottom-2">
                                    <span className="text-rose-500 font-bold text-sm tracking-widest flex justify-center items-center gap-2">
                                        <Lock className="w-4 h-4" /> 진입 버튼 자동 비활성화 (ROR 5% 초과)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}

            {isDanger && !isBlocked && user && (
                <CardFooter className="bg-rose-600 border-t border-rose-500 p-3 flex items-center justify-center text-white font-bold text-sm tracking-wide animate-in slide-in-from-bottom-2 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    ⚠️ HP1 경고: 생존 범위를 초과했습니다. 리스크(%)를 낮추세요!
                </CardFooter>
            )}
        </Card>
    );
};
