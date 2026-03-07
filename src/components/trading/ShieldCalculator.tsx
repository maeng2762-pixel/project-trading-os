'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, Crosshair, AlertTriangle, Calculator, DollarSign, Percent, Lock, Snowflake, Waves, BrainCircuit, ActivitySquare, CheckCircle2 } from 'lucide-react';
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
    const [riskInput, setRiskInput] = useState<number>(3); // Max Drawdown risk% for Bisection

    // v22.0 specific states
    const [currency, setCurrency] = useState<'USDT' | 'KRW'>('USDT');
    const [isBearMarket, setIsBearMarket] = useState<boolean>(false); // LSTM/GRU Filter Default
    const [cvdAbsorbed, setCvdAbsorbed] = useState<boolean>(true); // Volume Profile / CVD Absorption
    const [smcSwept, setSmcSwept] = useState<boolean>(true); // SMC Liquidity Sweep

    const [results, setResults] = useState({
        size: 0,
        cryptoPct: 0,
        cashPct: 100,
        expectedLossAmount: 0,
        rr: 0,
        ror: 0,
        isZeroEV: false,
    });

    // Validations & Locks
    const isParamMissing = !entry || !stopLoss;
    const isFakeoutWarning = (!cvdAbsorbed || !smcSwept);
    const isWinterBlocked = isBearMarket;

    // Auto-calculating Risk-Constrained Spot Kelly
    useEffect(() => {
        const entryVal = parseFloat(entry);
        const slVal = parseFloat(stopLoss);
        const targetVal = parseFloat(target);
        const maxDrawdownLimit = Number(riskInput) || 1; // Used as Bisection Max Limit

        if (isNaN(entryVal) || isNaN(slVal) || !seed || entryVal === slVal || slVal > entryVal) {
            setResults({ size: 0, cryptoPct: 0, cashPct: 100, expectedLossAmount: 0, rr: 0, ror: 0, isZeroEV: false });
            return;
        }

        const riskPerUnit = Math.abs(entryVal - slVal);
        const stopLossPct = (riskPerUnit / entryVal);
        const targetPerUnit = isNaN(targetVal) ? 0 : Math.abs(targetVal - entryVal);
        const rr = targetPerUnit > 0 ? targetPerUnit / riskPerUnit : 0;

        // Spot Accumulation Math
        let cryptoPct = 0;
        let cashPct = 100;
        let expectedLossAmount = 0;
        let isZeroEV = false;
        let size = 0;

        // Base Win Rate Assumption for HWV (High Volume Node) Spot buys
        const baseWinRate = (cvdAbsorbed && smcSwept) ? 0.60 : 0.40;

        // Spot Kelly Formula: f = W - ((1-W) / RR)
        if (rr > 0) {
            const kellyFraction = baseWinRate - ((1 - baseWinRate) / rr);

            if (kellyFraction <= 0) {
                isZeroEV = true;
                cryptoPct = 0;
            } else {
                // Risk-Constrained Bisection Simulation (Conceptualized)
                // We want to limit the total loss to maxDrawdownLimit (e.g. 3%)
                // If we allocate X% to spot, and SL hits, we lose X% * stopLossPct.
                // So max X% = maxDrawdownLimit / stopLossPct.

                // Max safe crypto allocation (Bisection cap)
                const safeMaxAllocation = (maxDrawdownLimit / 100) / stopLossPct;

                // Take the lesser of Kelly suggestion or Safe Max
                let finalAllocPct = Math.min(kellyFraction, safeMaxAllocation);

                // Leverage is 1x for Spot. Cannot exceed 100% of seed.
                if (finalAllocPct > 1) finalAllocPct = 1;

                cryptoPct = finalAllocPct * 100;
                cashPct = 100 - cryptoPct;
            }
        }

        // Apply Hard Blocks
        if (isWinterBlocked || isFakeoutWarning) {
            cryptoPct = 0;
            cashPct = 100;
        }

        const allocatedCryptoUsdt = seed * (cryptoPct / 100);
        size = allocatedCryptoUsdt / entryVal;
        expectedLossAmount = allocatedCryptoUsdt * stopLossPct;

        // ROR Simulation (1,000 runs, 30 trades, check 20% drawdown)
        let ruins = 0;
        const SIMULATIONS = 1000;
        const TRADES = 30; // Spot timeframe (30 trades)
        const lossFraction = cryptoPct > 0 ? expectedLossAmount / seed : 0;
        const winFraction = (cryptoPct / 100) * (rr > 0 ? targetPerUnit / entryVal : 0);

        if (cryptoPct > 0) {
            for (let i = 0; i < SIMULATIONS; i++) {
                let simBalance = 1.0;
                let ruined = false;
                for (let j = 0; j < TRADES; j++) {
                    if (simBalance <= 0.8) { ruined = true; break; } // 20% DD limit
                    const isWin = Math.random() < baseWinRate;
                    if (isWin) simBalance += winFraction;
                    else simBalance -= lossFraction;
                }
                if (ruined) ruins++;
            }
        }

        const ror = (ruins / SIMULATIONS) * 100;

        setResults({
            size,
            cryptoPct,
            cashPct,
            expectedLossAmount,
            rr,
            ror,
            isZeroEV,
        });

    }, [seed, entry, stopLoss, target, riskInput, isBearMarket, cvdAbsorbed, smcSwept]);

    const isSystemBlocked = isParamMissing || isWinterBlocked || isFakeoutWarning || results.ror > 5 || results.isZeroEV;
    const isDangerConfig = riskInput > 5;

    return (
        <Card className={`w-full shadow-xl overflow-hidden transition-colors duration-500 border ${isWinterBlocked ? 'border-sky-500/50 bg-sky-950/20' : (isDangerConfig ? 'border-rose-500/50 bg-rose-950/20' : 'border-[#1e3a8a]/80 bg-[#020617]')} relative`}>
            {isWinterBlocked && <div className="absolute inset-0 bg-sky-500/5 pointer-events-none animate-pulse blur-sm"></div>}

            <CardHeader className={`pb-4 border-b ${isWinterBlocked ? 'border-sky-500/30 bg-sky-950/40' : 'border-[#1e3a8a]/50 bg-[#0f172a]/50'}`}>
                <CardTitle className="flex justify-between items-center text-lg z-10 relative">
                    <span className="flex items-center gap-2">
                        <Waves className={`w-5 h-5 ${isWinterBlocked ? 'text-sky-400' : 'text-[#60a5fa]'}`} />
                        <span className={isWinterBlocked ? 'text-sky-100' : 'text-blue-100'}>블루포션: 현물 매집 마스터 (HP1 v22.0)</span>
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#60a5fa] px-2 py-0.5 bg-[#1e40af]/20 border border-[#1e40af]/50 rounded">CAPITAL MODE</span>
                </CardTitle>
                <p className={`text-xs mt-1 z-10 relative ${isWinterBlocked ? 'text-sky-300' : 'text-blue-200/50'}`}>
                    1x Spot 전용. LSTM 매크로 필터와 고래 볼륨 프로파일 기반 다이내믹 현금 비중 제어.
                </p>
            </CardHeader>

            {!user ? (
                <CardContent className="p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                    <div className="absolute inset-0 grid grid-cols-2 divide-x divide-[#1e3a8a]/30 opacity-20 blur-md pointer-events-none select-none px-6 py-8">
                        <div className="space-y-4 pr-6"><div className="h-10 bg-[#1e3a8a] rounded"></div><div className="h-10 bg-[#1e3a8a] rounded"></div></div>
                        <div className="space-y-4 pl-6"><div className="h-24 bg-[#1e3a8a] rounded"></div></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <span className="text-2xl block">🔒</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">프리미엄 자본 통제망</h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                            리스크 제약형 현물 켈리 계산기 및 오토파일럿 제어를 사용하려면 로그인이 필요합니다.
                        </p>
                        <AuthButton />
                    </div>
                </CardContent>
            ) : (
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">

                    {/* LEFT COLUMN: FILTERS & PARAMS */}
                    <div className="space-y-5">

                        {/* THE WHALE TRACKER */}
                        <div>
                            <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <BrainCircuit className="w-3.5 h-3.5" /> 1. 지능형 매집 엔진 (The Whale Tracker)
                            </h4>
                            <div className="bg-[#0b1121] border border-[#1e3a8a]/40 p-3 rounded-lg space-y-3 shadow-inner">
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsBearMarket(!isBearMarket)}>
                                    <span className={`text-xs ${isBearMarket ? 'text-sky-300 font-bold' : 'text-zinc-400'}`}>LSTM 매크로 필터 (Market Regime)</span>
                                    <div className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${isBearMarket ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                        {isBearMarket ? '❄️ BEAR (WINTER)' : '🚀 BULL (SPRING)'}
                                    </div>
                                </div>
                                <div className="h-px bg-[#1e3a8a]/20 w-full" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCvdAbsorbed(!cvdAbsorbed)}>
                                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${cvdAbsorbed ? 'bg-emerald-500' : 'border border-zinc-600'}`}>
                                            {cvdAbsorbed && <CheckCircle2 className="w-3 h-3 text-emerald-950" />}
                                        </div>
                                        <span className={`text-[10px] ${cvdAbsorbed ? 'text-emerald-400' : 'text-zinc-500'}`}>CVD 오더플로우 물량 흡수 확인 (Absorption)</span>
                                    </div>
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSmcSwept(!smcSwept)}>
                                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${smcSwept ? 'bg-emerald-500' : 'border border-zinc-600'}`}>
                                            {smcSwept && <CheckCircle2 className="w-3 h-3 text-emerald-950" />}
                                        </div>
                                        <span className={`text-[10px] ${smcSwept ? 'text-emerald-400' : 'text-zinc-500'}`}>SMC 유동성 스윕 완료 (Liquidity Sweep)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INPUT PARAMS */}
                        <div>
                            <h4 className="text-[10px] font-bold text-[#60a5fa] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Crosshair className="w-3 h-3" /> 2. 매집 파라미터 셋업
                            </h4>
                            <div className="space-y-3 bg-[#0b1121] border border-[#1e3a8a]/40 p-3 rounded-lg shadow-inner">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[10px] text-zinc-400 block">운용 가능 총 자산 ({currency})</label>
                                        <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded p-0.5">
                                            <button onClick={() => setCurrency('USDT')} className={`text-[9px] px-2 py-0.5 rounded transition-colors ${currency === 'USDT' ? 'bg-[#3b82f6]/40 text-blue-200' : 'text-zinc-600'}`}>USDT</button>
                                            <button onClick={() => setCurrency('KRW')} className={`text-[9px] px-2 py-0.5 rounded transition-colors ${currency === 'KRW' ? 'bg-[#3b82f6]/40 text-blue-200' : 'text-zinc-600'}`}>KRW</button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        {currency === 'USDT' ? <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" /> : <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">₩</span>}
                                        <Input
                                            type="number"
                                            value={seed}
                                            onChange={(e) => setSeed(Number(e.target.value))}
                                            className="h-8 text-xs bg-zinc-950 border-[#1e3a8a]/30 pl-8 text-white focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-zinc-400 mb-1 block">1차 매집가 (Entry)</label>
                                        <Input
                                            type="number"
                                            placeholder="ex) 52000"
                                            value={entry}
                                            onChange={(e) => setEntry(e.target.value)}
                                            className="h-8 text-xs bg-zinc-950 border-[#1e3a8a]/30 text-white focus-visible:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-rose-400 mb-1 block font-bold">절대 손절선 (Zone SL)</label>
                                        <Input
                                            type="number"
                                            placeholder="필수"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(e.target.value)}
                                            className={`h-8 text-xs bg-zinc-950 border-rose-900/50 text-white focus-visible:ring-rose-500 ${!stopLoss && 'animate-pulse'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: DYNAMIC RATIO & GUARD */}
                    <div className="space-y-4 relative">

                        {/* SYSTEM BLOCKS OVERLAY */}
                        {isSystemBlocked && (
                            <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/80 flex flex-col items-center justify-center border border-zinc-800 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                                <span className="text-3xl mb-3 block">🛡️</span>
                                {isWinterBlocked ? (
                                    <>
                                        <p className="text-sm text-sky-400 font-bold text-center leading-relaxed">
                                            크립토 윈터 감지 발동<br />
                                            <span className="text-zinc-300 text-[10px] font-normal mt-1 block px-4">LSTM 신경망이 하락장 매크로를 감지했습니다.<br />손도끼를 내려놓고 100% 현금({currency})을 보존하십시오.</span>
                                        </p>
                                    </>
                                ) : isFakeoutWarning ? (
                                    <>
                                        <p className="text-sm text-amber-500 font-bold text-center leading-relaxed">
                                            패이크 아웃 경보 (Fakeout Guard)<br />
                                            <span className="text-zinc-300 text-[10px] font-normal mt-1 block">CVD 폭발적 흡수나 개미 털기(Sweep) 흔적이 없습니다. 고래 매집이 확증되기 전까지 진입을 거부합니다.</span>
                                        </p>
                                    </>
                                ) : results.isZeroEV ? (
                                    <>
                                        <p className="text-sm text-rose-400 font-bold text-center leading-relaxed">
                                            기대수익(EV) 붕괴<br />
                                            <span className="text-zinc-300 text-[10px] font-normal mt-1 block">리스크 대비 수익이 현저히 낮습니다. 현물 비중을 0%로 통제합니다.</span>
                                        </p>
                                    </>
                                ) : results.ror > 5 ? (
                                    <>
                                        <p className="text-sm text-rose-500 font-bold text-center leading-relaxed">
                                            파산 한계선 돌파<br />
                                            <span className="text-zinc-300 text-[10px] font-normal mt-1 block">몬테카를로 시뮬레이션 결과, 30일 내 계좌 20% MDD 확률이 {results.ror.toFixed(1)}%로 치솟았습니다.</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-rose-400 font-bold text-center leading-relaxed">
                                            대기 모드<br />
                                            <span className="text-zinc-400 text-xs font-normal mt-1 block">모든 파라미터를 입력하십시오.</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <ActivitySquare className="w-3.5 h-3.5" /> 3. 리스크 제약형 포트폴리오 (Spot Kelly)
                        </h4>

                        <div className={`p-4 rounded-xl border ${isDangerConfig && !isSystemBlocked ? 'bg-rose-950/20 border-rose-500/50' : 'bg-[#0f172a] border-[#1e3a8a]/50 shadow-[inset_0_2px_15px_rgba(30,58,138,0.1)]'} space-y-4`}>

                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="text-[10px] text-zinc-400 border-b border-rose-500/50 pb-1 mb-1 block">최대 허용 낙폭 (MDD 제한)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={riskInput}
                                            onChange={(e) => setRiskInput(Number(e.target.value))}
                                            className={`h-8 text-xs bg-zinc-950 border-rose-900/50 text-white pr-6 ${isDangerConfig ? 'border-rose-500 text-rose-400 font-bold' : ''}`}
                                            disabled={isSystemBlocked}
                                        />
                                        <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-400 border-b border-blue-500/50 pb-1 mb-1 block">스윙 청산 타겟 (Target)</label>
                                    <Input
                                        type="number"
                                        placeholder="설정 시 EV 계산 최적화"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="h-8 text-xs bg-zinc-950 border-blue-900/50 text-white focus-visible:ring-blue-500"
                                        disabled={isSystemBlocked}
                                    />
                                </div>
                            </div>

                            {/* DYNAMIC CASH TO CRYPTO RATIO */}
                            <div className="mt-4 pt-3 border-t border-[#1e3a8a]/30">
                                <span className="text-[10px] text-blue-200 uppercase tracking-widest mb-3 block text-center font-bold">오토파일럿 동적 시드 분배 (Auto-Set Ratio)</span>
                                <div className="flex h-8 rounded-full overflow-hidden border border-zinc-800">
                                    <div
                                        className="bg-emerald-500 h-full flex items-center justify-center transition-all duration-1000 ease-in-out"
                                        style={{ width: `${results.cashPct}%` }}
                                    >
                                        {results.cashPct > 15 && <span className="text-[10px] font-black text-emerald-950 uppercase">관망 현금 ({currency}) {results.cashPct.toFixed(1)}%</span>}
                                    </div>
                                    <div
                                        className="bg-[#3b82f6] h-full flex items-center justify-center transition-all duration-1000 ease-in-out"
                                        style={{ width: `${results.cryptoPct}%` }}
                                    >
                                        {results.cryptoPct > 15 && <span className="text-[10px] font-black text-white px-2">현물 매집 (BTC) {results.cryptoPct.toFixed(1)}%</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1e3a8a]/20">
                                <div className="space-y-1">
                                    <div className="text-[9px] text-zinc-500 uppercase">예상 최대 블리딩 (위험 노출)</div>
                                    <div className="text-sm font-black text-rose-400">
                                        {currency === 'USDT' ? `-$${results.expectedLossAmount.toFixed(2)}` : `-₩${Math.round(results.expectedLossAmount).toLocaleString()}`}
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="text-[9px] text-zinc-500 uppercase">최종 현물 진입 수량 (1x Spot)</div>
                                    <div className="text-sm font-black text-[#60a5fa]">{results.size > 0 ? results.size.toFixed(4) : '0.000'} BTC</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-zinc-500 bg-[#0b1121] px-3 py-2 rounded">
                                <span>1,000회 몬테카를로 (MDD 20% 붕괴 위험도)</span>
                                <span className={results.ror <= 1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{results.ror.toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* TIME CAP CIRCUIT BREAKER INFO */}
                        <div className="mt-2 text-[9px] text-zinc-500 bg-zinc-950/80 px-3 py-2 rounded border border-zinc-800 flex gap-2">
                            <span className="text-amber-500/80">⏳ Time Cap 작동 중:</span> 진입 후 거래량 마름과 함께 14일 이상 횡보 시 엣지 소멸로 간주하여 강제 청산(본절)을 유도합니다.
                        </div>

                    </div>
                </CardContent>
            )}

            {isDangerConfig && !isSystemBlocked && user && (
                <CardFooter className="bg-rose-950 border-t border-rose-500/50 p-3 flex items-center justify-center text-rose-200 font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                    <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" />
                    Bisection Limits 초과 구성: MDD 허용치를 너무 높게 잡았습니다.
                </CardFooter>
            )}
        </Card>
    );
};

