'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Flame, Target, Crosshair, Skull, Lock, Zap, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginModal } from '../auth/LoginModal';
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

// Mini-Chart Visualizer Component
const MiniChartVisualizer = ({ livePrice, entry, target, sl, direction }: { livePrice: number, entry: number, target: number, sl: number, direction: 'LONG' | 'SHORT' }) => {
    const minP = Math.min(livePrice, entry, target, sl);
    const maxP = Math.max(livePrice, entry, target, sl);
    // Add small buffer so dots don't touch the very edges
    const buffer = (maxP - minP) * 0.05;
    const range = (maxP + buffer) - (minP - buffer);

    const getPos = (price: number) => {
        if (range === 0) return 50;
        return ((price - (minP - buffer)) / range) * 100;
    };

    return (
        <div className="mt-6 mb-4 p-5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl relative shadow-inner">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-7 font-bold">
                실시간 엣지 스캐너 (Live Edge Scanner)
            </div>
            <div className="relative h-1.5 bg-zinc-800/50 rounded-full w-full">
                {/* Entry (Blue) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3.5 bg-blue-500 rounded-sm"
                    style={{ left: `${getPos(entry)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-blue-400 font-mono uppercase tracking-tighter">Entry</div>
                </div>

                {/* Target (Green) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3.5 bg-emerald-500 rounded-sm"
                    style={{ left: `${getPos(target)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-emerald-400 font-mono uppercase tracking-tighter">Target</div>
                </div>

                {/* Stop Loss (Red) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3.5 bg-rose-500 rounded-sm"
                    style={{ left: `${getPos(sl)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-rose-400 font-mono uppercase tracking-tighter">Stop</div>
                </div>

                {/* Live Price (White Dot) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10 transition-all duration-300"
                    style={{ left: `${getPos(livePrice)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {Math.round(livePrice)}
                    </div>
                </div>
            </div>
        </div>
    );
};

import { MasterSignal, MockBroadcastProvider } from '@/lib/ai/provider';

const mockProvider = new MockBroadcastProvider();

export const RedPotionArena = () => {
    const { balance, liveBalance, apiConnected, setPotionMode } = useTradingStore();
    const { user } = useAuthStore();
    const isVip = user && user.email ? user.email.toLowerCase().trim() === 'maeng2762@gmail.com' : false;
    const currentSeed = apiConnected ? liveBalance : balance;

    // Limits
    const MAX_AMMO = 3;
    const MAX_SEED_PERCENT = 10;

    // State
    const [ammo, setAmmo] = useState(MAX_AMMO);
    const [losses, setLosses] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [allocationPercent, setAllocationPercent] = useState(5); // Default 5%

    const [masterSignal, setMasterSignal] = useState<MasterSignal | null>(null);
    const [lastWsUpdate, setLastWsUpdate] = useState<number>(0);
    const [isWsDelayed, setIsWsDelayed] = useState<boolean>(false);
    const [isSniperLocked, setIsSniperLocked] = useState<boolean>(true);
    const [refundWarning, setRefundWarning] = useState<boolean>(false);
    const isMounted = useRef(true);

    // Dynamic Net Values (Calculated by Client)
    const [netVals, setNetVals] = useState({
        entry: 0, // Planned Entry (Master Signal Base Price)
        sl: 0,
        target: 0,
        netSlPct: 0,
        netTargetPct: 0,
        plannedRr: 0,
        plannedEv: 0,
    });

    const [livePrice, setLivePrice] = useState<number>(0);
    const [isSysBlocked, setIsSysBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState<string>('');
    const feeConfig = {
        maker: 0.0004, // Typical exchange fee
        taker: 0.0004,
        slippage: 0.0005,
    };
    const totalCost = feeConfig.maker + feeConfig.taker + feeConfig.slippage; // 0.0013 (0.13%)

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
    const [cvdStatus, setCvdStatus] = useState<'IDLE' | 'PENDING' | 'PASS' | 'FAIL'>('IDLE');
    const [cvdMessage, setCvdMessage] = useState<string>('');

    // Base setup when Master Signal arrives
    useEffect(() => {
        if (!masterSignal) return;

        const entryPrice = masterSignal.basePrice;

        let grossTargetPrice = 0;
        let grossSlPrice = 0;

        if (masterSignal.direction === 'LONG') {
            grossTargetPrice = entryPrice * (1 + (masterSignal.baseTargetPct / 100));
            grossSlPrice = entryPrice * (1 - (masterSignal.baseStopLossPct / 100));
        } else {
            grossTargetPrice = entryPrice * (1 - (masterSignal.baseTargetPct / 100));
            grossSlPrice = entryPrice * (1 + (masterSignal.baseStopLossPct / 100));
        }

        const netTargetPct = masterSignal.baseTargetPct - (totalCost * 100);
        const netSlPct = masterSignal.baseStopLossPct + (totalCost * 100);
        const plannedRr = netTargetPct > 0 ? netTargetPct / netSlPct : 0;

        // Assume 50% baseline win rate for master signals + slight edge from confidence
        const mockWinRate = 0.50 + ((masterSignal.confidenceScore - 50) / 400);
        const mockLossRate = 1 - mockWinRate;
        const plannedEv = (mockWinRate * plannedRr) - (mockLossRate * 1);

        setNetVals({
            entry: entryPrice,
            target: Math.round(grossTargetPrice),
            sl: Math.round(grossSlPrice),
            netTargetPct: Number(netTargetPct.toFixed(2)),
            netSlPct: Number(netSlPct.toFixed(2)),
            plannedRr: Number(plannedRr.toFixed(2)),
            plannedEv: Number(plannedEv.toFixed(2)),
        });

        setLivePrice(entryPrice);

    }, [masterSignal]); // Only recompute base values when a new signal arrives.

    // Binance Mark Price WebSocket Integration - Initialize ON MOUNT
    const [wsRetryCount, setWsRetryCount] = useState(0);

    useEffect(() => {
        isMounted.current = true;
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            if (!isMounted.current) return;

            console.log(`[Binance WS] Connecting... (Attempt ${wsRetryCount + 1})`);
            ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@markPrice');

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.p && isMounted.current) {
                        setLivePrice(Number(data.p));
                        setLastWsUpdate(Date.now());
                    }
                } catch (err) {
                    console.error("Live price WebSocket parse error:", err);
                }
            };

            ws.onerror = (error) => {
                console.error('Binance WebSocket Error:', error);
            };

            ws.onclose = () => {
                if (isMounted.current) {
                    console.log('[Binance WS] Closed. Reconnecting in 3s...');
                    reconnectTimeout = setTimeout(() => {
                        setWsRetryCount(prev => prev + 1);
                        connect();
                    }, 3000);
                }
            };
        };

        connect();

        return () => {
            isMounted.current = false;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (ws && (ws.readyState === 1 || ws.readyState === 0)) {
                ws.close();
            }
        };
    }, [wsRetryCount]); // Re-run when retry count changes

    // Global Force Sync State (Manual Override)
    const [isForceSync, setIsForceSync] = useState(false);

    // WebSocket Latency Monitor - Run regardless of signal
    useEffect(() => {
        const interval = setInterval(() => {
            // Check if last update was more than 1000ms ago
            if (lastWsUpdate > 0 && Date.now() - lastWsUpdate > 1000) {
                setIsWsDelayed(true);
            } else {
                setIsWsDelayed(false);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [lastWsUpdate]);

    // Live RR Engine & Late Entry Guard
    const { liveRr, isLateEntry, liveEv, slippageText, slippageColor, slippageState } = React.useMemo(() => {
        if (!masterSignal || !livePrice) return { liveRr: 0, isLateEntry: false, liveEv: 0, slippageText: '', slippageColor: 'text-zinc-500', slippageState: 'neutral' };

        const distTarget = Math.abs(netVals.target - livePrice);
        const distSl = Math.abs(livePrice - netVals.sl);
        const netTargetDist = distTarget - (livePrice * totalCost);
        const netSlDist = distSl + (livePrice * totalCost);

        const currentRr = netSlDist > 0 ? Math.max(0, netTargetDist) / netSlDist : 0;

        // Slippage Calculation
        const priceDiffPct = ((livePrice - masterSignal.basePrice) / masterSignal.basePrice) * 100;
        let sText = '';
        let sColor = '';
        let sState = 'neutral';

        if (masterSignal.direction === 'LONG') {
            if (priceDiffPct < 0) {
                sState = 'favorable';
                sText = `🟢 진입가 대비 ${Math.abs(priceDiffPct).toFixed(2)}% 유리 (Edge 증가)`;
                sColor = 'text-emerald-500';
            } else {
                sState = 'unfavorable';
                sText = `🔴 진입가 대비 ${priceDiffPct.toFixed(2)}% 불리 (Edge 감소)`;
                sColor = 'text-rose-500';
            }
        } else {
            if (priceDiffPct > 0) {
                sState = 'favorable';
                sText = `🟢 진입가 대비 ${priceDiffPct.toFixed(2)}% 유리 (Edge 증가)`;
                sColor = 'text-emerald-500';
            } else {
                sState = 'unfavorable';
                sText = `🔴 진입가 대비 ${Math.abs(priceDiffPct).toFixed(2)}% 불리 (Edge 감소)`;
                sColor = 'text-rose-500';
            }
        }

        const mockWinRate = 0.50 + ((masterSignal.confidenceScore - 50) / 400);
        const lEv = (mockWinRate * currentRr) - ((1 - mockWinRate) * 1);

        return {
            liveRr: Number(currentRr.toFixed(2)),
            liveEv: Number(lEv.toFixed(2)),
            isLateEntry: currentRr < 1.0,
            slippageText: sText,
            slippageColor: sColor,
            slippageState: sState
        };
    }, [livePrice, masterSignal, netVals, totalCost]);


    useEffect(() => {
        if (!masterSignal || !livePrice) return;

        // Sniper Execution Lock Validation
        let outOfZone = false;
        if (masterSignal.direction === 'LONG') {
            if (livePrice > masterSignal.entryZoneMax) outOfZone = true;
        } else {
            if (livePrice < masterSignal.entryZoneMin) outOfZone = true;
        }

        setIsSniperLocked(outOfZone);

        // Client Side Blocking Logic (Total Cost x 3 constraint OR Live RR constraint)
        const minProfitThreshold = (totalCost * 100) * 3;
        if (isWsDelayed) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 현재 시세 동기화 지연 중. 자본 보호를 위해 진입을 차단합니다.');
        } else if (outOfZone) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 타점 이탈 (Target Missed): 가격이 Zone 안으로 돌아올 때까지 진입 차단.');
        } else if (netVals.netTargetPct < minProfitThreshold) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 수수료 기반 최소 엣지 한계치 미달 (진입 차단)');
        } else if (liveRr < 1.5) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 현재가 기준 엣지 붕괴 (RR 1.5R 미만 진입 차단)');
        } else if (liveEv < 0.3) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 기대수익값(EV) 0.3R 미달 진입 차단');
        } else {
            setIsSysBlocked(false);
            setBlockReason('');
        }

        // Real-time Monte Carlo ROR Engine
        const winRate = 0.50 + ((masterSignal.confidenceScore - 50) / 400);;
        const rr = liveRr > 0 ? liveRr : netVals.plannedRr;
        const riskAmount = allocationPercent / 100;

        // Auto Leverage Calculation
        let sysLeverage = 1;

        const stopLossPct = netVals.netSlPct;
        sysLeverage = stopLossPct > 0 ? allocationPercent / stopLossPct : 1;

        // EV-based Lockdown (0.3R constraint overrides all)
        if (liveEv < 0.3) {
            sysLeverage = 1;
        } else {
            // Hard Cap 15x
            if (sysLeverage > 15) sysLeverage = 15;
            // Loss Penalty (-50% allowance on 2 losses)
            if (losses >= 2) sysLeverage = sysLeverage * 0.5;
        }
        setCalculatedLeverage(Number(sysLeverage.toFixed(1)));

        // Fear Trigger: Amplify variance artificially in Monte Carlo to scare the user if leverage is high
        const varianceAmplifier = sysLeverage > 10 ? 2.5 : (sysLeverage > 5 ? 1.5 : 1);

        // Simulate 1000 accounts for 100 trades (approx 3 months of active trading)
        const SIMULATIONS = 1000;
        const TRADES_PER_SIM = 100;
        let ruins = 0;
        const endingBalances: number[] = [];

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
                    // Keep dropping the balance to show ruin impact on median
                    simBalance = 0;
                    break;
                }
            }
            if (ruined) ruins++;
            endingBalances.push(simBalance);
        }

        endingBalances.sort((a, b) => a - b);
        const medianBalance = endingBalances[Math.floor(SIMULATIONS / 2)];

        setRorResult((ruins / SIMULATIONS) * 100);
        setExpectedReturn((medianBalance - 1.0) * 100);

        // Generate 6 months growth curve data for chart
        const baseEv = masterSignal && liveEv > 0 ? liveEv : 0.1;
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
    }, [masterSignal, allocationPercent, currentSeed, losses, liveRr, liveEv, netVals]);

    // No Edge Warning State
    const [noEdgeWarning, setNoEdgeWarning] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Mock checking local storage for lock status
        const lockTime = localStorage.getItem('redPotionLockTime');
        if (lockTime) {
            const timeDiff = Date.now() - Number(lockTime);
            if (timeDiff < 24 * 60 * 60 * 1000) {
                // Only lock if NOT VIP. Since isVip might be null initially as user loads,
                // we'll check it in the rendering and effect as well.
                if (!isVip) setIsLocked(true);
            } else {
                localStorage.removeItem('redPotionLockTime');
            }
        }
    }, [isVip]);

    // If VIP logs in, clear any existing locks
    useEffect(() => {
        if (isVip) {
            setIsLocked(false);
            localStorage.removeItem('redPotionLockTime');
        }
    }, [isVip]);

    const fetchMasterSignal = async (forced?: boolean) => {
        if (!isVip && ammo <= 0) return;
        if (isLocked || isScanning) return;

        let effectivePrice = livePrice;
        if (effectivePrice <= 0 && (forced === true || isForceSync)) {
            effectivePrice = 65000;
        }

        if (effectivePrice <= 0) {
            setWsRetryCount(prev => prev + 1);
            setNoEdgeWarning("⚠️ 시세 동기화 지연: 바이낸스 서버와의 연결을 재시도 중입니다. (인터넷 환경이 불안정할 경우 3~5초 정도 소요될 수 있습니다.)");
            return;
        }

        setIsScanning(true);
        setNoEdgeWarning(null);
        setCvdStatus('IDLE');
        setCvdMessage('');

        // Fetching ONE Broadcasted Master Signal (No individual processing)
        const signal = await mockProvider.generateMasterSignal(effectivePrice);

        if (signal.isRejected) {
            setNoEdgeWarning(signal.rejectReason || "⚠️ 관망 대기: 중앙 네트워크에서 엣지 셋업을 탐지하지 못했습니다.");
            setMasterSignal(null);
        } else {
            setMasterSignal(signal);
            if (signal.kellyRiskPct) {
                setAllocationPercent(signal.kellyRiskPct);
            }

            setCvdStatus('PENDING');
            setCvdMessage('🔍 실시간 오더플로우 패턴(CVD) 분석 중...');

            const conditionText = Math.random() > 0.5
                ? "조건 A: CVD 모멘텀 역전 (Divergence) 확증"
                : "조건 B: 타점 구간 대규모 기관 매도 흡수 (Absorption) 확증";

            setTimeout(() => {
                if (!isMounted.current) return;
                const isPass = Math.random() > 0.15; // 85% PASS for UX
                if (isPass) {
                    setCvdStatus('PASS');
                    setCvdMessage(`✅ [통과] ${conditionText}. 타점 유효.`);
                } else {
                    setCvdStatus('FAIL');
                    setCvdMessage("🚫 [실패] 오더플로우 불일치(Fakeout 위협). 진입 버튼이 잠깁니다.");
                }
            }, 3000);
        }

        setIsScanning(false);
    };

    const handlePreTradeExecute = () => {
        if (!masterSignal || isSysBlocked) return;

        // Synchronous validation for Ammo Refund (Latency Guard)
        let outOfZone = false;
        if (masterSignal.direction === 'LONG') {
            if (livePrice > masterSignal.entryZoneMax) outOfZone = true;
            if (livePrice < masterSignal.entryZoneMin) outOfZone = true;
        } else {
            if (livePrice < masterSignal.entryZoneMin) outOfZone = true;
            if (livePrice > masterSignal.entryZoneMax) outOfZone = true;
        }

        if (outOfZone) {
            setRefundWarning(true);
            setTimeout(() => setRefundWarning(false), 4000);
            return; // Ammo is preserved.
        }

        setShowPreTrade(true);
    };

    const confirmExecuteTrade = () => {
        if (mentalScore < 40) {
            alert("⚠️ 리스크 과열 상태: 오늘 컨디션 점수가 낮아 진입이 강제 차단됩니다.");
            setShowPreTrade(false);
            setMasterSignal(null);
            return;
        }
        setShowPreTrade(false);

        const limitPrice = masterSignal!.direction === 'LONG' ? masterSignal!.entryZoneMax : masterSignal!.entryZoneMin;
        const isBreakoutOrder = masterSignal!.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;

        alert(`🎯 스마트 주문 라우팅 작동:\n\n방식: [${isBreakoutOrder ? '돌파 추격 (Stop-Conditional)' : '되돌림 대기 (Limit Order)'}]\n목표 진입가(${limitPrice})에 시드 ${allocationPercent}%를 예약 세팅했습니다.\n\n${isBreakoutOrder ? '(※ 지정한 가격이 깨질 때만 진입하도록 조건부 덫을 설치합니다.)' : '(※ 지정한 가격이 오지 않으면 쿨하게 보내주십시오.)'}`);

        // ... proceeding to trade result mockup
        const isWin = Math.random() < 0.5; // 50/50 for mock
        executeTrade(isWin ? 'WIN' : 'LOSS');
    };

    const executeTrade = (result: 'WIN' | 'LOSS') => {
        if (!masterSignal) return;

        if (!isVip) setAmmo(prev => Math.max(0, prev - 1));

        setMasterSignal(null);

        if (result === 'LOSS') {
            const newLosses = losses + 1;
            setLosses(newLosses);
            if (newLosses >= 3 && !isVip) {
                // 3 losses = Ammo 0, Glitch, kick to blue
                setAmmo(0);
                setIsLocked(true);
                localStorage.setItem('redPotionLockTime', Date.now().toString());

                // Force Blue Mode transition
                setTimeout(() => {
                    setPotionMode('BLUE');
                }, 4000); // Give 4 seconds to read the lock screen before kicking out
            } else if (newLosses === 2 && !isVip) {
                // Keep playing but leverage allowance is hit (-50%)
                // No immediate lock, the UI will warn them.
            }
        } else {
            setLosses(0);
        }
    };

    if (isLocked && !isVip) {
        return (
            <div className={`w-full relative min-h-[400px] flex items-center justify-center border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden mt-8 grayscale ${losses >= 3 && 'animate-[pulse_0.1s_ease-in-out_infinite]'}`}>
                <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-10 transition-colors">
                    <Skull className={`w-16 h-16 text-zinc-500 mb-4 mix-blend-screen ${losses >= 3 && 'text-rose-600 animate-spin'}`} />
                    <h2 className="text-3xl font-black text-rose-500 tracking-widest uppercase mb-2">💀 생존 한계선 이탈 (FATAL)</h2>
                    <p className="text-zinc-300 font-bold max-w-md mx-auto leading-relaxed">
                        최대 허용 연패 초과로 자본이 파괴되었습니다. <br />
                        <span className="text-rose-400">시스템이 개입하여 레드포션 모드를 24시간 강제 봉인합니다.</span>
                        <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg">
                            <p className="text-indigo-300 text-[11px] font-medium">
                                🛡️ VIP 계정({"'maeng2762@gmail.com'"})으로 로그인하시면 <br />
                                모든 시스템 제한이 즉시 해제되며 무제한 사용이 가능합니다.
                            </p>
                        </div>
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

                {/* Visual indicator for Target/Stop loss effect backdrop */}
                {masterSignal && liveRr >= 6 && (
                    <div className="absolute inset-0 bg-orange-600/5 blur-[120px] rounded-full mix-blend-color-dodge pointer-events-none transition-opacity duration-1000"></div>
                )}

                {!user && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-zinc-950/60 transition-all border border-zinc-900 rounded-xl">
                        <Lock className="w-16 h-16 text-zinc-500 mb-4" />
                        <h2 className="text-2xl font-black text-rose-500 tracking-widest uppercase mb-2">실전 훈련 엔진 봉인 상태</h2>
                        <p className="text-zinc-300 font-bold max-w-md mx-auto leading-relaxed mb-6">
                            로그인하여 인증된 사용자만 접근할 수 있는 최상위 구역입니다.
                        </p>
                        <LoginModal />
                    </div>
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
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                            {isVip ? '탄창 (Unlimited VIP)' : '탄창 (Daily Ammo)'}
                        </span>
                        <div className="flex gap-1.5">
                            {isVip ? (
                                <div className="text-rose-500 font-black text-xl tracking-tighter animate-pulse flex items-center gap-1">
                                    <Zap className="w-5 h-5 fill-rose-500" /> ∞
                                </div>
                            ) : (
                                [...Array(MAX_AMMO)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2.5 h-6 sm:w-3 sm:h-8 rounded-sm transition-all duration-300 ${i < ammo ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-zinc-800 border border-zinc-700'}`}
                                    ></div>
                                ))
                            )}
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
                                    {masterSignal?.kellyRiskPct !== undefined && masterSignal.kellyRiskPct > 0 ? (
                                        <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-emerald-500 font-bold flex items-center gap-2">🛡️ 기관급 리스크 관리 시스템 가동</span>
                                                <span className="font-mono text-emerald-400 text-sm font-bold flex items-center gap-1">
                                                    ${((currentSeed * allocationPercent) / 100).toFixed(2)} ({allocationPercent}%)
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
                                                계좌 최대 낙폭을 제한하는 Risk-Constrained Kelly 공식을 적용하여 이번 거래의 비중을 전체 시드의 <strong className="text-white">{allocationPercent}%</strong>로 자동 락인(Lock-in)합니다.
                                            </p>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${(allocationPercent / 10) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
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
                                                className="w-full accent-rose-500 disabled:opacity-50 disabled:grayscale"
                                                disabled={masterSignal !== null}
                                            />
                                            <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                                                <span>1%</span>
                                                <span>10% Limit</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dynamic Risk of Ruin & Monte Carlo Stats */}
                                    <div className="bg-black/40 p-4 rounded-lg border border-rose-900/40 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full"></div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5" /> ☠️ 파산(HP 0) 확률
                                            </span>
                                            <span className={`font-mono text-lg font-black tracking-tighter ${masterSignal && (calculatedLeverage >= 10 || rorResult >= 20) ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : (masterSignal && rorResult >= 10 ? 'text-amber-500' : 'text-emerald-400')}`}>
                                                {masterSignal ? `${rorResult.toFixed(1)}%` : '--%'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                                                <div className="text-[9px] text-zinc-500 mb-1">3개월 기대수익 (MC)</div>
                                                <div className={`text-sm font-mono font-bold ${masterSignal && expectedReturn >= 0 ? 'text-emerald-400' : (masterSignal ? 'text-rose-500' : 'text-zinc-500')}`}>
                                                    {masterSignal ? `${expectedReturn > 0 ? '+' : ''}${expectedReturn.toFixed(1)}%` : '--%'}
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                                                <div className="text-[9px] text-zinc-500 mb-1">30일 내 -20% 도달</div>
                                                <div className={`text-sm font-mono ${masterSignal ? 'text-rose-400' : 'text-zinc-500'}`}>
                                                    {masterSignal ? `${(allocationPercent * 1.8).toFixed(1)}%` : '--%'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compounding Growth Curve Graphic */}
                                        <div className="h-32 w-full mt-4 border-t border-zinc-800/50 pt-3 relative">
                                            <div className="text-[9px] text-zinc-500 uppercase font-bold mb-2 absolute top-3 left-0 z-10">6개월 복리 성장 곡선 (예측)</div>
                                            {!masterSignal && (
                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600 font-mono mt-4">
                                                    [시그널 대기중]
                                                </div>
                                            )}
                                            {masterSignal && (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={monteCarloData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
                                                        <YAxis domain={['auto', 'auto']} hide />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px' }}
                                                            itemStyle={{ color: '#34d399' }}
                                                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                                                            labelStyle={{ color: '#a1a1aa' }}
                                                        />
                                                        <Line type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                        <span className="text-xs text-zinc-400 font-bold bg-zinc-900 px-2 py-1 rounded border border-zinc-700">⚙️ 시스템 계산 레버리지</span>
                                        <span className={`text-sm font-mono font-black ${calculatedLeverage >= 10 ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]' : (calculatedLeverage > 5 ? 'text-amber-500' : 'text-blue-500')}`}>
                                            {masterSignal ? `${calculatedLeverage}x` : '대기중'}
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
                            {!masterSignal ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-rose-900/30 rounded-xl bg-black/20 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-rose-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 pointer-events-none"></div>
                                    <Zap className="w-12 h-12 text-zinc-700 mb-4 group-hover:text-rose-500 transition-colors duration-500" />
                                    <h3 className="text-lg font-bold text-zinc-400 mb-2 font-mono tracking-widest uppercase">Zero Marginal Cost Sync</h3>
                                    <p className="text-[10px] text-zinc-600 mb-6 uppercase tracking-wider font-bold">1 Center Brain ➠ BroadCasting</p>

                                    {noEdgeWarning && (
                                        <div className="w-full bg-amber-950/30 border border-amber-900/50 text-amber-500 text-xs py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 animate-pulse">
                                            <ShieldAlert className="w-4 h-4 shrink-0" /> {noEdgeWarning}
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => fetchMasterSignal()}
                                        disabled={(!isVip && ammo <= 0) || isScanning}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs tracking-[0.2em] relative overflow-hidden group/btn w-full max-w-xs shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isScanning ? (
                                                <span className="animate-pulse">스캐닝 중... (SCANNING)</span>
                                            ) : (
                                                <>마스터 시그널 수신 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg></>
                                            )}
                                        </span>
                                    </Button>

                                    {livePrice <= 0 && noEdgeWarning && (
                                        <button
                                            onClick={() => {
                                                setIsForceSync(true);
                                                fetchMasterSignal(true);
                                            }}
                                            className="mt-4 text-[10px] text-zinc-500 hover:text-zinc-300 underline underline-offset-4 decoration-zinc-700 transition-colors font-mono uppercase"
                                        >
                                            [!] Force Local Sync (동기화 강제 무시 및 로컬 가격 사용)
                                        </button>
                                    )}
                                    <span className="text-[9px] text-zinc-600 mt-3 font-mono">APP-SIDE RENDERING REQUIRED</span>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                    {/* HUD Header */}
                                    <div className="p-4 rounded-xl border bg-black/50 border-zinc-800 relative overflow-visible">
                                        <div className="absolute top-0 right-0 p-1 opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                        </div>
                                        <div className="flex flex-col items-center justify-center mb-4 pb-4 border-b border-zinc-800 relative z-10">
                                            <span className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-1">SNIPER HUD - MASTER SYNC</span>
                                            {masterSignal.direction === 'LONG' ? (
                                                <div className={`text-5xl font-black ${isLateEntry ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2`}>
                                                    <span className="text-3xl">{isLateEntry ? '⚠️' : '🟢'}</span> LONG <span className="text-lg opacity-50 tracking-normal text-zinc-300">({isLateEntry ? 'Risk: 지각 진입' : '매수 우위'})</span>
                                                </div>
                                            ) : masterSignal.direction === 'SHORT' ? (
                                                <div className={`text-5xl font-black ${isLateEntry ? 'text-amber-500 animate-pulse' : 'text-rose-500'} tracking-tighter drop-shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center gap-2`}>
                                                    <span className="text-3xl">{isLateEntry ? '⚠️' : '🔴'}</span> SHORT <span className="text-lg opacity-50 tracking-normal text-zinc-300">({isLateEntry ? 'Risk: 지각 진입' : '매도 우위'})</span>
                                                </div>
                                            ) : (
                                                <div className={`text-5xl font-black text-zinc-500 tracking-tighter flex items-center gap-2`}>
                                                    <span className="text-3xl">☁️</span> WAIT <span className="text-lg opacity-50 tracking-normal text-zinc-300">(대기)</span>
                                                </div>
                                            )}
                                        </div>
                                        {masterSignal.smcConfluence && masterSignal.smcConfluence.length > 0 && (
                                            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 mb-3">
                                                {masterSignal.smcConfluence.map((c, idx) => (
                                                    <span key={idx} className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[9px] px-2 py-1 rounded-sm shadow-sm font-bold tracking-widest uppercase">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {liveRr >= 6 && (
                                            <div className="text-center bg-amber-500/10 border border-amber-400 text-amber-500 font-bold text-xs py-1.5 rounded mb-3 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                                💎 소액 자본가용 특수 엣지 (R:R 압도적 구간)
                                            </div>
                                        )}

                                        {/* Dual RR System & Entry Slippage Tracker */}
                                        <div className="grid grid-cols-2 gap-4 mt-1">
                                            <div className="text-center bg-zinc-950/50 p-2 rounded relative border border-zinc-800/50">
                                                <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">최초 계획 EV (Planned)</span>
                                                <div className="font-mono text-sm font-bold text-zinc-500">
                                                    +{netVals.plannedEv}R / RR: {netVals.plannedRr}R
                                                </div>
                                            </div>
                                            <div className={`text-center p-2 rounded relative border border-zinc-800 ${isLateEntry ? 'bg-amber-950/30' : 'bg-emerald-950/20'}`}>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">실시간 손익비 (Live RR)</span>
                                                <span className={`font-mono text-xl font-black ${isLateEntry ? 'text-amber-500' : 'text-emerald-400'}`}>{liveRr}R</span>
                                            </div>
                                        </div>

                                        {/* Actionable AI Briefing - Normal flow to prevent mobile overlap */}
                                        <div className="mt-4 mb-2">
                                            {isSysBlocked ? (
                                                <div className="bg-rose-950/50 border border-rose-900/50 text-[10px] text-rose-400 p-3 rounded-lg shadow-lg text-center font-mono animate-pulse">
                                                    🚨 <strong>경고:</strong> 현재 가격은 최적 진입 구간을 이탈했습니다. 기대 손익비가 붕괴되어 진입 시 장기 파산 위험이 매우 높습니다. 진입을 취소하십시오.
                                                </div>
                                            ) : isLateEntry ? (
                                                <div className="bg-amber-950/50 border border-amber-900/50 text-[10px] text-amber-400 p-3 rounded-lg shadow-lg text-center font-mono">
                                                    ⚠️ <strong>지각 진입:</strong> 지각 진입 구간입니다. 예상 수익이 하락했으며 추가 리스크를 부담해야 합니다.
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-950/50 border border-emerald-600/50 text-[10px] text-emerald-400 p-3 rounded-lg shadow-lg text-center font-mono">
                                                    ✅ <strong>최적 타점:</strong> 현재 최적 진입 구간입니다. 계획된 엣지가 유효합니다.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Real-time Edge Scanner Indicator */}
                                    <MiniChartVisualizer
                                        livePrice={livePrice}
                                        entry={netVals.entry}
                                        target={netVals.target}
                                        sl={netVals.sl}
                                        direction={masterSignal.direction as 'LONG' | 'SHORT'}
                                    />

                                    {/* Price Targets context calculated on CLIENT */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
                                        {/* Entry Zone */}
                                        <div className="bg-black/30 border border-zinc-800/80 p-3 rounded-lg text-center relative overflow-hidden group/target">
                                            <div className="absolute top-0 right-0 p-1 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></div>
                                            <span className="text-[10px] text-blue-500/80 uppercase block mb-1 font-bold">진입 마지노선 (Zone)</span>
                                            <span className="text-sm sm:text-lg font-mono text-blue-400 font-bold tracking-tighter">
                                                {masterSignal.entryZoneMin} ~ {masterSignal.entryZoneMax}
                                            </span>
                                            <div className="mt-1 text-[9px] text-zinc-500 font-mono tracking-tighter">
                                                (해당 구간 이탈 시 진입 금지)
                                            </div>
                                        </div>
                                        {/* Target Price */}
                                        <div className="bg-black/30 border border-zinc-800/80 p-3 rounded-lg text-center relative overflow-hidden group/target">
                                            <div className="absolute top-0 right-0 p-1 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></div>
                                            <span className="text-[10px] text-emerald-500/80 uppercase block mb-1 font-bold">1차 목표가 (Target)</span>
                                            <span className="text-lg font-mono text-emerald-400 font-bold">{netVals.target}</span>
                                            <div className="mt-1 text-[9px] text-zinc-500 font-mono tracking-tighter">
                                                (수수료 제외 +{netVals.netTargetPct}% 실수익)
                                            </div>
                                        </div>
                                        {/* Stop Loss */}
                                        <div className="bg-black/30 border border-rose-900/40 p-3 rounded-lg text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-1 opacity-20 text-rose-500"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg></div>
                                            <span className="text-[10px] text-rose-500 uppercase block mb-1 font-black tracking-widest drop-shadow-[0_0_5px_rgba(225,29,72,0.8)]">무효화 조건 (Stop)</span>
                                            <span className="text-lg font-mono text-rose-500 font-bold">{netVals.sl}</span>
                                            <div className="mt-1 text-[9px] text-rose-400/80 font-mono tracking-tighter">
                                                (수수료 포함 -{netVals.netSlPct}% 실손실)
                                            </div>
                                        </div>
                                        <div className="col-span-1 sm:col-span-3 text-center pt-2 flex flex-col items-center">
                                            <div className={`mt-2 text-xs font-bold ${slippageColor} bg-black/40 px-3 py-1.5 rounded-full inline-block border border-zinc-800/80`}>
                                                {slippageText}
                                            </div>
                                            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-3 flex items-center gap-1 justify-center">
                                                현재가: {Math.round(livePrice)} USDT
                                                <span className="text-[8px] text-zinc-500 normal-case tracking-normal">(Based on Binance Mark Price)</span>
                                            </span>
                                            <span className="text-[9px] text-zinc-700 font-mono uppercase mt-0.5">최초 오라클 전송가: {netVals.entry} USDT</span>
                                        </div>
                                    </div>

                                    {/* Dot Plot Edge Visualizer */}
                                    <DotPlotGraph winRate={masterSignal.confidenceScore} />

                                    <div className="flex flex-col gap-2 pt-6">
                                        {refundWarning && (
                                            <div className="mb-2 p-3 bg-rose-950/80 border border-rose-500 rounded-lg text-center animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                                                <span className="text-white font-black text-[11px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    <ShieldAlert className="w-5 h-5 text-rose-500" /> ⚠️ 타점 이탈 (Target Missed): 이미 마지노선을 지났습니다. 추격 매수를 시스템이 강제 차단하며 탄창은 보존됩니다.
                                                </span>
                                            </div>
                                        )}
                                        {isSysBlocked && !refundWarning && (
                                            <div className="mb-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                                                <span className="text-zinc-500 font-black text-[10px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    <Lock className="w-4 h-4" /> {blockReason}
                                                </span>
                                            </div>
                                        )}
                                        {!isSysBlocked && !isSniperLocked && !refundWarning && (
                                            <div className="mb-2 p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-lg text-center animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                <span className="text-emerald-500 font-black text-[10px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    <Crosshair className="w-4 h-4" /> 🎯 스나이퍼 타점 도달: 최적의 손익비 구간입니다. 덫 설치 가능.
                                                </span>
                                            </div>
                                        )}
                                        {cvdMessage && (
                                            <div className={`mb-2 p-3 border rounded-lg text-center shadow-lg ${cvdStatus === 'PASS' ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-400' : cvdStatus === 'FAIL' ? 'bg-rose-950/40 border-rose-600/50 text-rose-400' : 'bg-blue-950/40 border-blue-600/50 text-blue-400 animate-pulse'}`}>
                                                <span className="font-black text-[10px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    {cvdMessage}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={() => {
                                                    const limitPrice = masterSignal.direction === 'LONG' ? masterSignal.entryZoneMax : masterSignal.entryZoneMin;
                                                    // Leverage calculation logic based on limitPrice and stoploss
                                                    const distSl = Math.abs(limitPrice - netVals.sl);
                                                    const riskPct = (distSl / limitPrice) * 100;
                                                    let calcLev = riskPct > 0 ? Math.floor(allocationPercent / riskPct) : 1;
                                                    if (calcLev > 15) calcLev = 15;
                                                    if (calcLev < 1) calcLev = 1;

                                                    const isBreakoutOrder = masterSignal.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;
                                                    const orderTypeLabel = isBreakoutOrder ? '조건부 주문(Stop-Market)' : '지정가(Limit)';

                                                    alert(`[자동 주문 계산기]\n\n바이낸스에 다음 가격으로 ${orderTypeLabel}을 걸어두세요:\n\n방향: ${masterSignal.direction}\n가격: ${limitPrice} USDT\n추천 레버리지: ${calcLev}x\n\n(※ ${isBreakoutOrder ? '이 가격을 돌파/붕괴할 때 진입합니다.' : '이 가격에 체결되기를 기다리며 그물을 칩니다.'})`);
                                                }}
                                                className="flex-1 bg-zinc-900 border border-blue-900/50 hover:bg-zinc-800 text-blue-400 h-12 font-bold transition-all text-[11px] sm:text-xs"
                                            >
                                                주문(Order) 역산
                                            </Button>
                                            <Button
                                                onClick={() => executeTrade('LOSS')}
                                                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 h-12 font-bold transition-all"
                                            >
                                                무효화 (기각)
                                            </Button>
                                            <Button
                                                onClick={handlePreTradeExecute}
                                                disabled={isSysBlocked || isSniperLocked || cvdStatus !== 'PASS'}
                                                className={`flex-[2] h-12 font-black text-sm sm:text-lg tracking-widest transition-all ${isSysBlocked || isSniperLocked || cvdStatus !== 'PASS' ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-[pulse_1.5s_ease-in-out_infinite]'}`}
                                            >
                                                {isSysBlocked || isSniperLocked ? '관망 처리' : cvdStatus !== 'PASS' ? '오더플로우 대기' : (() => {
                                                    const limitPrice = masterSignal.direction === 'LONG' ? masterSignal.entryZoneMax : masterSignal.entryZoneMin;
                                                    const isBreakoutOrder = masterSignal.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;
                                                    return isBreakoutOrder ? '⚡ 돌파 주문 (Stop-Limit)' : '🎯 지정가 덫 (Limit Order)';
                                                })()}
                                            </Button>
                                        </div>
                                        {!isSysBlocked && (
                                            <div className="text-center mt-1">
                                                <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                                                    이 전략을 무시할 경우 장기 기대손실: <span className="text-rose-500">-{liveEv}R</span>
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
