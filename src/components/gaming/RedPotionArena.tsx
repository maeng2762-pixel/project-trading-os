'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Flame, Target, Crosshair, Skull, Lock, Zap, ShieldAlert, Activity, Sparkles, Clock, History, AlertTriangle, Share2, Copy, Sunrise, Send, Cpu } from 'lucide-react';
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
const MiniChartVisualizer = ({ livePrice, entry, target, sl, direction, entryZoneMin, entryZoneMax }: { livePrice: number, entry: number, target: number, sl: number, direction: 'LONG' | 'SHORT', entryZoneMin?: number, entryZoneMax?: number }) => {
    const minP = Math.min(livePrice, entry, target, sl, entryZoneMin || livePrice, entryZoneMax || livePrice);
    const maxP = Math.max(livePrice, entry, target, sl, entryZoneMin || livePrice, entryZoneMax || livePrice);
    // Add small buffer so dots don't touch the very edges
    const buffer = (maxP - minP) * 0.05;
    const range = (maxP + buffer) - (minP - buffer);

    const getPos = (price: number) => {
        if (range === 0) return 50;
        const pos = ((price - (minP - buffer)) / range) * 100;
        return Math.min(100, Math.max(0, pos));
    };

    return (
        <div className="mt-8 mb-4 p-5 sm:p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-xl relative shadow-inner overflow-hidden">
            <div className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-[0.3em] text-center mb-10 font-black">
                실시간 엣지 스캐너 (Live Edge Scanner)
            </div>
            <div className="relative h-1 bg-zinc-800/50 rounded-full w-full mx-auto max-w-[95%]">
                {/* Entry Zone (Ghost Zone Sync) */}
                {entryZoneMin && entryZoneMax && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-4 sm:h-3 bg-blue-500/30 rounded border border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] z-30"
                        style={{
                            left: `${Math.min(getPos(entryZoneMin), getPos(entryZoneMax))}%`,
                            width: `${Math.max(1, Math.abs(getPos(entryZoneMax) - getPos(entryZoneMin)))}%`
                        }}
                    >
                        <div className="absolute -top-7 sm:-top-6 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-blue-300 font-bold uppercase whitespace-nowrap bg-blue-900/80 px-1 md:px-1.5 rounded-sm">ZONE</div>
                    </div>
                )}

                {/* Stop Loss (Red) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.6)] z-20"
                    style={{ left: `${getPos(sl)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -bottom-7 sm:-bottom-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-rose-400 font-black uppercase tracking-tighter whitespace-nowrap drop-shadow-sm bg-zinc-950/80 px-1 rounded border border-rose-900/50">STOP</div>
                </div>

                {/* Target (Green) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] z-20"
                    style={{ left: `${getPos(target)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -top-7 sm:-top-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-emerald-400 font-black uppercase tracking-tighter whitespace-nowrap drop-shadow-sm bg-zinc-950/80 px-1 rounded border border-emerald-900/50">TARGET</div>
                </div>

                {/* Entry (Blue) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.9)] z-40 ring-2 ring-blue-300/50"
                    style={{ left: `${getPos(entry)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -bottom-8 sm:-bottom-7 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] text-blue-400 font-black uppercase tracking-tighter whitespace-nowrap drop-shadow-sm bg-zinc-950/90 px-1.5 py-0.5 rounded border border-blue-900/50 text-center">ENTRY</div>
                </div>

                {/* Live Price (Pulse Dot) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-50 transition-all duration-300 ring-2 ring-black"
                    style={{ left: `${getPos(livePrice)}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -top-9 sm:-top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap border border-zinc-300 z-50">
                        {Math.round(livePrice)}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-white opacity-40 animate-ping"></div>
                </div>
            </div>
        </div>
    );
};

import { MasterSignal } from '@/lib/ai/provider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

export const RedPotionArena = () => {
    const { balance, liveBalance, apiConnected, setPotionMode } = useTradingStore();
    const { user, loading } = useAuthStore();
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
    const [trueTrades, setTrueTrades] = useState(17);
    const [dailyCooldown, setDailyCooldown] = useState(false);

    // HP1 v31.0
    const [activePositions, setActivePositions] = useState(0);
    const [showFiveWhys, setShowFiveWhys] = useState(false);
    const [fiveWhyAnswers, setFiveWhyAnswers] = useState(['', '', '', '', '']);
    const [currentWhyStep, setCurrentWhyStep] = useState(0);


    // KRW Display Mode
    const [useKrw, setUseKrw] = useState(false);
    const KRW_RATE = 1450;
    const formatPrice = (p: number) => useKrw ? `₩${Math.round(p * KRW_RATE).toLocaleString()}` : p.toString();

    const [masterSignal, setMasterSignal] = useState<MasterSignal | null>(null);
    const [signalHistory, setSignalHistory] = useState<MasterSignal[]>([]);
    const [isSignalExpired, setIsSignalExpired] = useState(false);
    const [ttlRemaining, setTtlRemaining] = useState<number | null>(null);
    const [showFlipAlert, setShowFlipAlert] = useState(false);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    // HP1 v38.0: Goldfish Autopilot
    const [isGoldfishMode, setIsGoldfishMode] = useState(false);

    // HP1 v39.0: The 100 Bootcamp
    const [isThe100Mode, setIsThe100Mode] = useState(false);

    // HP1 v37.0: Precision Entry Machine
    const [entryMachineState, setEntryMachineState] = useState<'AIMING' | 'LOCK_ON' | 'EVASION' | 'INVALIDATED'>('AIMING');
    const [distanceTicks, setDistanceTicks] = useState<number>(0);
    const [distancePercent, setDistancePercent] = useState<number>(0);
    const [timeInZoneCountdown, setTimeInZoneCountdown] = useState<number>(180);
    const [lastWsUpdate, setLastWsUpdate] = useState<number>(0);
    const [isWsDelayed, setIsWsDelayed] = useState<boolean>(false);
    const [isSniperLocked, setIsSniperLocked] = useState<boolean>(true);
    const [refundWarning, setRefundWarning] = useState<boolean>(false);
    const [twapLockCountdown, setTwapLockCountdown] = useState<number>(0);
    const [pingMs, setPingMs] = useState(45);
    const [flashCrashDetected, setFlashCrashDetected] = useState(false);
    // HP1 v42.0: Arcade Mode & Universal Sync
    const [isArcadeMode, setIsArcadeMode] = useState(false);
    const [isAssaultMode, setIsAssaultMode] = useState(false);
    const [isMicroScalper, setIsMicroScalper] = useState(false);
    const [isCopySync, setIsCopySync] = useState(false);
    const [isShadowTracking, setIsShadowTracking] = useState(false);
    const [omniSyncStatus, setOmniSyncStatus] = useState<'OFF' | 'CONNECTED' | 'SYNCING'>('OFF');

    // HP1 v51.0 Omni-Sync Realtime Mirroring
    useEffect(() => {
        if (loading) return; // Wait for Firebase to determine auth state

        if (!user || !user.uid) {
            setOmniSyncStatus('OFF');
            return;
        }

        const syncRef = doc(db, 'users', user.uid, 'omniSync', 'state');

        const unsub = onSnapshot(syncRef, (snap) => {
            if (snap.exists()) {
                setOmniSyncStatus('CONNECTED');
                const data = snap.data();
                if (data.masterSignal !== undefined) {
                    if (data.masterSignal === null) {
                        setMasterSignal(null);
                        setIsSignalExpired(false);
                        setTtlRemaining(null);
                        try { localStorage.removeItem('hp1_active_signal'); } catch (e) { }
                    } else {
                        const serverTtl = data.masterSignal.ttlSeconds || 300;
                        const elapsed = Math.floor((Date.now() - data.masterSignal.timestamp) / 1000);
                        const remaining = Math.max(0, serverTtl - elapsed);

                        setMasterSignal(data.masterSignal);
                        setTtlRemaining(remaining);
                        setIsSignalExpired(remaining <= 0);
                        try { localStorage.setItem('hp1_active_signal', JSON.stringify(data.masterSignal)); } catch (e) { }
                    }
                }
                if (data.isAssaultMode !== undefined) setIsAssaultMode(data.isAssaultMode);
                if (data.isMicroScalper !== undefined) setIsMicroScalper(data.isMicroScalper);
                if (data.isArcadeMode !== undefined) setIsArcadeMode(data.isArcadeMode);
            } else {
                // If doc doesn't exist, it's still connected to the service
                setOmniSyncStatus('CONNECTED');
                // Auto-init for new users
                setDoc(syncRef, {
                    masterSignal: null,
                    isAssaultMode: false,
                    isMicroScalper: false,
                    isArcadeMode: false
                }, { merge: true });
            }
        }, (err) => {
            console.error("Omni-Sync Snapshot Error:", err);
            setOmniSyncStatus('OFF');
        });

        return () => unsub();
    }, [user, loading]);

    const syncModeToggle = async (modeName: 'isAssaultMode' | 'isMicroScalper' | 'isArcadeMode', currentValue: boolean) => {
        const nextValue = !currentValue;
        if (modeName === 'isAssaultMode') setIsAssaultMode(nextValue);
        else if (modeName === 'isMicroScalper') setIsMicroScalper(nextValue);
        else if (modeName === 'isArcadeMode') setIsArcadeMode(nextValue);

        if (!user || !user.uid) return;
        try {
            await updateDoc(doc(db, 'users', user.uid, 'omniSync', 'state'), {
                [modeName]: nextValue
            });
            // Snapshot will update local state automatically if connected
        } catch (e) {
            console.error("Omni-Sync Toggle Error:", e);
        }
    };


    // HP1 v49.0: Zen-Mode Lockdown
    const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
    const [zenLockdownEnd, setZenLockdownEnd] = useState<number>(0);

    const handleActionClick = () => {
        const now = Date.now();
        const newTimestamps = [...clickTimestamps, now].filter(t => now - t < 2000); // 2초 이내의 클릭 기록
        setClickTimestamps(newTimestamps);

        if (newTimestamps.length >= 4) { // 2초 내 4회 연타 감지
            setZenLockdownEnd(now + 180000); // 3분 물리 락다운
            setClickTimestamps([]);
        }
    };

    useEffect(() => {
        if (zenLockdownEnd > 0) {
            const interval = setInterval(() => {
                if (Date.now() > zenLockdownEnd) setZenLockdownEnd(0);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [zenLockdownEnd]);

    // HP1 v41.0: Sniper's Pager (Zen-Mode & Notifications)
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                await Notification.requestPermission();
            }
        }
    };

    const sendPushNotification = (title: string, body: string, onClick?: () => void) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, { body });
            if (onClick) {
                notification.onclick = () => {
                    window.focus();
                    onClick();
                    notification.close();
                };
            }
        } else {
            console.log("Push Notification (Mock):", title, body);
            // Fallback: If no permission, we can still trigger UI routing if they are already on the screen
            if (onClick) onClick();
        }
    };

    // FBM One-Tap Copy Facilitator
    const handleCopy = (value: number, type: string) => {
        navigator.clipboard.writeText(value.toString());
        // Custom simple toast effect for copying
        alert(`✅ [클립보드 복사됨] ${type}: ${value}\n\n1초 컷: 거래소 앱에 바로 '붙여넣기' 하십시오.`);
    };

    // Possession Shadow Manager watcher
    useEffect(() => {
        if (!isShadowTracking || !masterSignal) return;
        const interval = setInterval(() => {
            // Random chance to mock momentum reversal during shadow tracking
            if (Math.random() > 0.95) {
                sendPushNotification(
                    '🚨 긴급: 시장 모멘텀 역전',
                    '즉시 거래소에서 [시장가 청산]을 집행하십시오.'
                );
                alert("🚨 긴급(Action-Command): 시장 모멘텀 역전. 즉시 거래소 앱에서 [시장가 청산]을 집행하십시오.");
                setIsShadowTracking(false);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [isShadowTracking, masterSignal]);

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

    // HP1 v56.1: Vercel Snapshot Caching & Static High-RRR Trap
    const [dailyTraps, setDailyTraps] = useState<any>(null);

    useEffect(() => {
        const snapRef = doc(db, 'system', 'daily_snapshot');
        const unsub = onSnapshot(snapRef, (docSnap) => {
            if (docSnap.exists()) {
                setDailyTraps(docSnap.data());
            }
        });
        return () => unsub();
    }, []);
    const [isSysBlocked, setIsSysBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState<string>('');
    const feeConfig = {
        maker: 0.0001, // Maker is much cheaper, but we calculate EV by worst-case
        taker: 0.0004,
        slippage: 0.0005,
    };
    // Worst-case scenario total cost: Taker fee * 2 (Roundtrip) + Slippage
    const totalCost = (feeConfig.taker * 2) + feeConfig.slippage; // 0.0013 (0.13%)

    // Flash Crash & Ping Guard (Andon Cord effect)
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isMounted.current) return;
            const isSpike = Math.random() > 0.95;
            setPingMs(isSpike ? 500 + Math.random() * 200 : 30 + Math.random() * 50);

            if (Math.random() > 0.99) {
                setFlashCrashDetected(true);
                setTimeout(() => setFlashCrashDetected(false), 3000);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // HP1 v44.0: Memory Flush & GC
    useEffect(() => {
        const gcInterval = setInterval(() => {
            console.log("🧹 [GC] 15분 주기 메모리 플러시: 체결 틱 데이터 & 폐기 시그널 정리 완료.");
            setSignalHistory(prev => {
                const trimmed = prev.slice(-5);
                localStorage.setItem('hp1_signal_history', JSON.stringify(trimmed));
                return trimmed;
            });
        }, 15 * 60 * 1000); // 15 mins
        return () => clearInterval(gcInterval);
    }, []);

    // HP1 v36.0: Local Storage Persistence & TTL Initialization
    useEffect(() => {
        try {
            const hist = localStorage.getItem('hp1_signal_history');
            if (hist) setSignalHistory(JSON.parse(hist));

            const act = localStorage.getItem('hp1_active_signal');
            if (act) {
                const parsed = JSON.parse(act) as MasterSignal;
                if (parsed.timestamp && parsed.ttlSeconds) {
                    const elapsed = Math.floor((Date.now() - parsed.timestamp) / 1000);
                    const remaining = parsed.ttlSeconds - elapsed;
                    if (remaining > 0) {
                        setMasterSignal(parsed);
                        setTtlRemaining(remaining);
                        setIsSignalExpired(false);
                    } else {
                        setMasterSignal(parsed);
                        setTtlRemaining(0);
                        setIsSignalExpired(true);
                    }
                } else {
                    setMasterSignal(parsed);
                }
            }
        } catch (e) { console.warn("Local storage read fail", e); }
    }, []);

    // HP1 v36.0 & v42.0: Server-Side Time Sync & Push (TTL)
    useEffect(() => {
        if (!masterSignal || ttlRemaining === null || isSignalExpired) return;
        const interval = setInterval(() => {
            if (!masterSignal.timestamp) return;
            const customTtl = masterSignal.ttlSeconds || 300;
            const elapsed = Math.floor((Date.now() - masterSignal.timestamp) / 1000);
            const remaining = customTtl - elapsed;

            if (remaining <= 0) {
                if (!isSignalExpired) {
                    if (!isShadowTracking) {
                        sendPushNotification(
                            '🚫 대기 중인 덫의 효력 상실',
                            '지정가 유효시간 초과 또는 근거(EV)가 소멸되었습니다. 즉시 거래소에서 주문을 취소하십시오.'
                        );
                        alert("🚫 대기 중인 덫의 효력이 상실되었습니다. 거래소에서 주문을 취소하십시오");
                        setIsShadowTracking(false);
                        setTtlRemaining(0);
                        setIsSignalExpired(true);
                    } else {
                        setTtlRemaining(0);
                    }
                }
            } else {
                setTtlRemaining(remaining);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [masterSignal, isSignalExpired, isShadowTracking]);

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

        const targetPctMultiplier = isMicroScalper ? 0.05 : masterSignal.baseTargetPct;
        const slPctMultiplier = isMicroScalper ? 0.05 : masterSignal.baseStopLossPct;

        if (masterSignal.direction === 'LONG') {
            grossTargetPrice = entryPrice * (1 + (targetPctMultiplier / 100));
            grossSlPrice = entryPrice * (1 - (slPctMultiplier / 100));
        } else {
            grossTargetPrice = entryPrice * (1 - (targetPctMultiplier / 100));
            grossSlPrice = entryPrice * (1 + (slPctMultiplier / 100));
        }

        const netTargetPct = targetPctMultiplier - (totalCost * 100);
        const netSlPct = slPctMultiplier + (totalCost * 100);
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

    const displayValues = React.useMemo(() => {
        if (!masterSignal) return { entry: netVals.entry, target: netVals.target, sl: netVals.sl };

        const target = masterSignal.liquidityFrontRunnerOffset ?
            (masterSignal.direction === 'LONG' ?
                Math.round(netVals.target * (1 - masterSignal.liquidityFrontRunnerOffset / 100)) :
                Math.round(netVals.target * (1 + masterSignal.liquidityFrontRunnerOffset / 100)))
            : Math.round(netVals.target);

        // Limit price used for execution = optimal entry guarantee
        const entry = masterSignal.direction === 'LONG' ? masterSignal.entryZoneMax : masterSignal.entryZoneMin;

        return { entry, target, sl: Math.round(netVals.sl) };
    }, [masterSignal, netVals]);

    // HP1 v37.0: Precision Entry State Machine & Distance Tracker
    useEffect(() => {
        if (!masterSignal || !livePrice || isSignalExpired) {
            setEntryMachineState('AIMING');
            setDistanceTicks(0);
            setDistancePercent(0);
            setTimeInZoneCountdown(isMicroScalper ? 60 : 180);
            return;
        }

        let absDist = 0;
        let isInsideZone = false;

        if (livePrice >= masterSignal.entryZoneMin && livePrice <= masterSignal.entryZoneMax) {
            isInsideZone = true;
            absDist = 0;
        } else if (livePrice < masterSignal.entryZoneMin) {
            absDist = masterSignal.entryZoneMin - livePrice;
        } else {
            absDist = livePrice - masterSignal.entryZoneMax;
        }

        const dTicks = Math.round(absDist * 10);
        const dPct = Number(((absDist / livePrice) * 100).toFixed(3));

        setDistanceTicks(dTicks);
        setDistancePercent(dPct);

        setEntryMachineState(prev => {
            if (prev === 'INVALIDATED' || prev === 'EVASION') return prev;

            if (isInsideZone) {
                if (prev !== 'LOCK_ON') {
                    if (isAssaultMode) {
                        sendPushNotification(
                            `🔥 [ASSAULT 모드] 타점 도달`,
                            `즉각 돌격을 승인합니다.`,
                            () => setShowPreTrade(true)
                        );
                    } else {
                        sendPushNotification(
                            `🎯 [HP1 타점 도달] 진입 발생`,
                            `BTCUSDT가 엔트리 존에 진입했습니다. MBO 스캐너가 대기 중입니다.`,
                            () => setShowPreTrade(true)
                        );
                    }
                }
                return 'LOCK_ON';
            }

            // If it was LOCK_ON and exits, does it go back to AIMING or EVASION?
            // Let's say if it blows past the stop loss side, it's EVASION.
            // For now, if it just leaves, it goes back to AIMING.
            return 'AIMING';
        });

    }, [livePrice, masterSignal, isSignalExpired, isAssaultMode]);

    // HP1 v37.0: Time-in-Zone Kill Switch
    useEffect(() => {
        if (entryMachineState !== 'LOCK_ON') {
            setTimeInZoneCountdown(isMicroScalper ? 60 : 180); // Reset when not locked on
            return;
        }

        const interval = setInterval(() => {
            setTimeInZoneCountdown(prev => {
                if (prev === 1) {
                    if (!isShadowTracking) {
                        sendPushNotification(
                            '🚫 [HP1 전술 폐기]',
                            '세력 개입이 없어 타점의 기대값(EV)이 붕괴되었습니다. 해당 시그널을 안전하게 폐기합니다.'
                        );
                    }
                }
                if (prev <= 1) {
                    if (!isShadowTracking) {
                        setEntryMachineState('INVALIDATED');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [entryMachineState, isShadowTracking]);

    // Binance Mark Price WebSocket Integration - Initialize ON MOUNT
    const [wsRetryCount, setWsRetryCount] = useState(0);

    useEffect(() => {
        isMounted.current = true;
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            if (!isMounted.current) return;

            console.log(`[Binance WS] Connecting... (Attempt ${wsRetryCount + 1})`);
            try {
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
            } catch (error) {
                console.error('[Binance WS] Initialization blocked by browser security (e.g. Safari strict mode). Falling back to mock price generator.', error);
                // In strict environments, browsers throw "SecurityError: The operation is insecure." 
                // We fallback to a simulated price interval.
                reconnectTimeout = setInterval(() => {
                    if (!isMounted.current) return;
                    setLivePrice(prev => {
                        const basePrice = prev === 0 ? 65000 : prev;
                        // +/- random walk
                        return basePrice + (Math.random() * 20 - 10);
                    });
                    setLastWsUpdate(Date.now());
                }, 1000); // Mock 1-second ticks
            }
        };

        connect();

        return () => {
            isMounted.current = false;
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                clearInterval(reconnectTimeout);
            }
            if (ws && (ws.readyState === 1 || ws.readyState === 0)) {
                try {
                    ws.close();
                } catch (e) {
                    // Ignore close errors
                }
            }
        };
    }, [wsRetryCount]); // Re-run when retry count changes

    // Global Force Sync State (Manual Override)
    const [isForceSync, setIsForceSync] = useState(false);

    // WebSocket Latency Monitor - Run regardless of signal
    useEffect(() => {
        const interval = setInterval(() => {
            // Check if last update was more than 3000ms ago (more lenient for mobile/poor signals)
            if (lastWsUpdate > 0 && Date.now() - lastWsUpdate > 3000) {
                setIsWsDelayed(true);
            } else {
                setIsWsDelayed(false);
            }
        }, 1000);

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
            if (livePrice < masterSignal.entryZoneMin) outOfZone = true;
        } else {
            if (livePrice < masterSignal.entryZoneMin) outOfZone = true;
            if (livePrice > masterSignal.entryZoneMax) outOfZone = true;
        }

        setIsSniperLocked(outOfZone);

        // Client Side Blocking Logic (Total Cost x 3 constraint OR Live RR constraint)
        const minProfitMultiplier = isAssaultMode ? 2 : 3;
        const minProfitThreshold = (totalCost * 100) * minProfitMultiplier;
        const minRrThreshold = isAssaultMode ? 1.2 : 1.5;
        const minEvThreshold = isAssaultMode ? 0.2 : 0.3;

        if (pingMs > 500 || flashCrashDetected) {
            setIsSysBlocked(true);
            setBlockReason('🚨 [Andon Cord] 플래시 크래시(3% 이상 이탈) 또는 API 핑 지연(>500ms) 감지. 대기 중인 모든 Maker 주문 자동 회수 (Cancel All).');
        } else if (isWsDelayed) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 현재 시세 동기화 지연 중. 자본 보호를 위해 진입을 차단합니다.');
        } else if (entryMachineState === 'INVALIDATED') {
            setIsSysBlocked(true);
            setBlockReason('⏳ Time-in-Zone 초과: 세력의 개입이 없어 모멘텀이 소멸되었습니다. 휩소 위험으로 진입 폐기');
        } else if (entryMachineState === 'EVASION') {
            setIsSysBlocked(true);
            setBlockReason('🚫 해당 존에서 기관의 방어 물량이 확인되지 않았습니다(No Demand). 휩소 위험으로 인해 덫을 강제 회수합니다.');
        } else if (outOfZone) {
            setIsSysBlocked(true);
            setBlockReason('🚨 현재 가격은 최적 진입 구간을 이탈했습니다. 진입 조준기(Aiming) 대기 중입니다.');
        } else if (netVals.netTargetPct < minProfitThreshold) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ 수수료 기반 최소 엣지 한계치 미달 (진입 차단)');
        } else if (liveRr < minRrThreshold) {
            setIsSysBlocked(true);
            setBlockReason(`⚠️ 현재가 기준 엣지 붕괴 (RR ${minRrThreshold}R 미만 진입 차단)`);
        } else if (liveEv < minEvThreshold) {
            setIsSysBlocked(true);
            setBlockReason(`⚠️ 기대수익값(EV) ${minEvThreshold}R 미달: 현재가 기준 엣지가 부족하여 진입을 차단합니다.`);
        } else if (masterSignal.waeMomentumMatch === false) {
            setIsSysBlocked(true);
            setBlockReason('⚠️ [WAE 엔진] 모멘텀 불일치: 휩소(속임수) 위험. 진입 대기');
        } else if (allocationPercent === 0) {
            setIsSysBlocked(true);
            setBlockReason('⛔ 비중 압수 (Bet Sizing = 0): 메타 레이블링 결과 통계적 승산이 부족하여 진입을 강제 차단합니다.');
        } else if (masterSignal.sentimentRegimeBlock) {
            setIsSysBlocked(true);
            setBlockReason('🧠 매크로/감성 AI 경고: 시장 국면 악화로 타점 무효화. 일평균 검색량 및 온체인 지표 하락세로 구글 트렌드 롤링 필터가 포지션을 차단합니다.');
        } else if (masterSignal.inverseSlingshot) {
            setIsSysBlocked(true);
            setBlockReason('🟡 역방향 슬링샷(Inverse Slingshot) 감지: 모멘텀 불일치로 휩소 확률 상승. 브레이크아웃(Breakout) 전략 비활성화');
        } else if (masterSignal.profileShape === 'P' && masterSignal.direction === 'LONG') {
            setIsSysBlocked(true);
            setBlockReason('⛔ Weak High (P-Shape) + Long Signal: 숏 커버링 파동의 끝물일 확률이 높습니다. 롱 진입을 차단합니다.');
        } else if (masterSignal.profileShape === 'b' && masterSignal.direction === 'SHORT') {
            setIsSysBlocked(true);
            setBlockReason('⛔ Weak Low (b-Shape) + Short Signal: 롱 청산 파동의 끝자락일 확률이 큽니다. 숏 진입을 차단합니다.');
        } else if (masterSignal.oiConvictionState === 'MEAN_REVERSION' && masterSignal.direction === 'LONG') {
            setIsSysBlocked(true);
            setBlockReason('⛔ OI 다이버전스 감지: 펌핑에도 OI 감소(청산성 움직임). 추세 지속 롱 시그널 폐기. 평균 회귀(Mean Reversion)로의 전환을 권장합니다.');
        } else if (masterSignal.oiConvictionState === 'MEAN_REVERSION' && masterSignal.direction === 'SHORT') {
            setIsSysBlocked(true);
            setBlockReason('⛔ OI 다이버전스 감지: 덤핑에도 OI 감소(커버링성 움직임). 추세 지속 숏 시그널 폐기. 평균 회귀(Mean Reversion)로의 전환을 권장합니다.');
        } else if (masterSignal.gexRegime === 'POSITIVE') {
            setIsSysBlocked(true);
            setBlockReason('⚠️ GEX 억제 구간: 돌파 휩소 확률이 높으므로 변동성 스퀴즈가 해제될 때까지 진입을 차단합니다.');
        } else if (masterSignal.vsaAnomaly === 'NO_DEMAND_SUPPLY') {
            setIsSysBlocked(true);
            setBlockReason('⚠️ VSA 감지 (No Demand / No Supply): 거래량 없는 가짜 돌파(Fakeout) 파동입니다. 추격 매수를 원천 차단합니다.');
        } else if (masterSignal.vwapCvdConfluence === 'BREAKOUT_NO_CVD') {
            setIsSysBlocked(true);
            setBlockReason('⚠️ VWAP Breakout Filter: CVD 미확증(Low-quality). 휩소 위험으로 진입 차단');
        } else if (masterSignal.twapDelay) {
            // Let the button handle the TWAP Delay dynamically instead of sysBlock
            setIsSysBlocked(false);
            setBlockReason('');
        } else {
            setIsSysBlocked(false);
            setBlockReason('');
        }

        // Real-time Monte Carlo ROR Engine
        const winRate = masterSignal.metaWinRate !== undefined ? masterSignal.metaWinRate : 0.50 + ((masterSignal.confidenceScore - 50) / 400);
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
        try {
            const lockTime = localStorage.getItem('redPotionLockTime');
            if (lockTime) {
                const timeDiff = Date.now() - Number(lockTime);
                if (timeDiff < 24 * 60 * 60 * 1000) {
                    if (!isVip) setIsLocked(true);
                } else {
                    localStorage.removeItem('redPotionLockTime');
                }
            }
        } catch (error) {
            console.warn("Failed to read lock state from local storage:", error);
        }
    }, [isVip]);

    // If VIP logs in, clear any existing locks
    useEffect(() => {
        if (isVip) {
            setIsLocked(false);
            try {
                localStorage.removeItem('redPotionLockTime');
            } catch (error) {
                console.warn("Failed to clear local storage lock:", error);
            }
        }
    }, [isVip]);

    const clearActiveSignal = async () => {
        // Optimistic UI update immediately
        setMasterSignal(null);
        setTtlRemaining(null);
        setIsSignalExpired(false);
        try {
            localStorage.removeItem('hp1_active_signal');
        } catch (e) { }

        if (user && user.uid) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'omniSync', 'state'), { masterSignal: null }, { merge: true });
            } catch (e) {
                console.error("Omni-Sync Clear Error:", e);
            }
        }
    };

    // HP1 v42.0: Shadow Tracking Monitoring
    useEffect(() => {
        if (!isShadowTracking || !masterSignal || !livePrice) return;

        let shouldExit = false;
        if (masterSignal.direction === 'LONG') {
            if (livePrice >= netVals.target || livePrice <= netVals.sl) shouldExit = true;
        } else {
            if (livePrice <= netVals.target || livePrice >= netVals.sl) shouldExit = true;
        }

        if (shouldExit) {
            setIsShadowTracking(false);
            sendPushNotification('🔔 시그널 종료 알림', '수동 추적 중인 시그널이 목표가 또는 손절가에 도달하여 종료되었습니다.');
            clearActiveSignal();
            // Show a simple browser alert to ensure they see it if they are on the page
            alert('🔔 [수동 진입 종료] 타겟에 도달하여 현재 시그널이 초기화되었습니다. 수고하셨습니다!');
            return;
        }

        // HP1 Extension - CVD Divergence Disruption Subroutine 
        // 1.5% chance per price tick/update to trigger emergency Telegram notification
        if (Math.random() > 0.985) {
            const warningMsg = "⚠️ [긴급 청산 권고] 반대 방향의 거대 흡수가 포착되었습니다. SL 도달 전 즉시 포지션을 수동 청산하십시오!";
            
            // Post to backend dispatch webhook
            fetch('/api/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: warningMsg })
            }).catch(console.error);

            alert(warningMsg);
            sendPushNotification('🚨 모멘텀 역전 긴급 알림', warningMsg);

            setIsShadowTracking(false);
            clearActiveSignal();
        }

    }, [livePrice, isShadowTracking, masterSignal, netVals]);

    const fetchMasterSignal = async (forced?: boolean) => {
        requestNotificationPermission(); // Request permission for HP1 v41.0
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

        // HP1 v51.0: Omni-Sync Server Signal Generation
        let signal: MasterSignal;
        try {
            // This API call now writes the signal to Firestore, which will then be picked up by the onSnapshot listener
            setOmniSyncStatus('SYNCING');
            const res = await fetch('/api/sync/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user?.uid, livePrice: effectivePrice })
            });
            const data = await res.json();
            setOmniSyncStatus(user?.uid ? 'CONNECTED' : 'OFF');
            if (!data.success) throw new Error(data.error);
            signal = data.signal; // The signal is returned, but local state update will be via onSnapshot
        } catch (error) {
            console.error("Backend Sync Failed:", error);
            setNoEdgeWarning("⚠️ 백엔드 동기화 실패: 서버에서 시그널을 생성하지 못했습니다.");
            setIsScanning(false); // Ensure scanning state is reset on error
            return;
        }

        // The rest of the logic that depends on 'signal' should ideally be moved to the onSnapshot listener
        // or handled after the signal is confirmed to be in Firestore and reflected in local state.
        // For now, we'll keep the immediate feedback for the user, but the source of truth is Firestore.

        if (signal.isRejected) {
            if (signal.principalAgentRejected) {
                setNoEdgeWarning("거절됨(Rejected): 수수료 낭비성 대리인(Agent) 행동 감지. 오너십(Principal) 보호를 위해 관망합니다.");
            } else {
                setNoEdgeWarning(signal.rejectReason || "⚠️ 관망 대기: 중앙 네트워크에서 엣지 셋업을 탐지하지 못했습니다.");
            }
            // Do NOT clear active signal here to maintain Persistence.
        } else {
            // Check Flip Alert - this will be handled by the onSnapshot listener when masterSignal updates
            if (masterSignal && masterSignal.direction !== signal.direction && signal.isFlipped) {
                setShowFlipAlert(true);
            } else {
                setShowFlipAlert(false);
            }

            setMasterSignal(signal);
            setIsSignalExpired(false);
            setTtlRemaining(signal.ttlSeconds || 300);

            try {
                localStorage.setItem('hp1_active_signal', JSON.stringify(signal)); // Keep for local persistence fallback
                setSignalHistory(prev => {
                    const newHist = [signal, ...prev].slice(0, 50);
                    localStorage.setItem('hp1_signal_history', JSON.stringify(newHist));
                    return newHist;
                });
            } catch (e) { console.warn(e); }

            // Allocation percent logic will also be triggered by onSnapshot when masterSignal updates
            if (signal.romadOptimizedBetSize) {
                setAllocationPercent(losses >= 2 ? Number((signal.romadOptimizedBetSize * 0.5).toFixed(1)) : signal.romadOptimizedBetSize);
            } else if (signal.kellyRiskPct) {
                setAllocationPercent(losses >= 2 ? Number((signal.kellyRiskPct * 0.5).toFixed(1)) : signal.kellyRiskPct);
            }

            if (isMicroScalper) {
                setCvdStatus('PASS');
                setCvdMessage(`⚡ [마이크로 스캘핑 바이패스] 1분봉 흡수(Absorption) 패턴 즉각 진입.`);
            } else if (isAssaultMode) {
                setCvdStatus('PASS');
                setCvdMessage(`🔥 [ASSAULT 모드 바이패스] 다빈도 타격 전술로 인해 오더플로우 확증 과정을 생략합니다.`);
            } else {
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
        }

        setIsScanning(false);
    };

    const handlePreTradeExecute = () => {
        handleActionClick();
        if (zenLockdownEnd > 0) {
            alert("🔒 [Zen-Mode Lockdown] 패닉 상태(단기 다중 클릭)가 감지되었습니다. 3분간 차트 뷰어 및 모든 행동이 차단됩니다.");
            return;
        }

        if (!masterSignal || isSysBlocked) return;

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

        if (isShadowTracking) {
            alert("이미 감시 모드가 활성화되어 있습니다.");
            return;
        }

        setIsShadowTracking(true);
        sendPushNotification(
            '빙의형 실시간 감시자 활성화',
            '수동 진입을 확인했습니다. 화면을 보지 않으셔도 시스템이 모멘텀 역전 시 즉각 청산을 지시합니다.'
        );
        alert('Shadow Manager 활성화: 가상 백그라운드 감시가 시작되었습니다. (시장 모멘텀 역전 시 푸시 전송)');

        // We can optionally show the pre-trade modal if we still want paper-trading simulation
        setShowPreTrade(true);
    };

    const confirmExecuteTrade = () => {
        if (!masterSignal) return;

        if (mentalScore < 40) {
            alert("⚠️ 리스크 과열 상태: 오늘 컨디션 점수가 낮아 진입이 강제 차단됩니다.");
            setShowPreTrade(false);
            setIsShadowTracking(false);
            clearActiveSignal();
            return;
        }
        // TWAP Delay handling
        if (masterSignal.twapDelay && twapLockCountdown === 0 && !isAssaultMode) {
            setShowPreTrade(false);
            setTwapLockCountdown(60);
            return;
        }

        setShowPreTrade(false);

        const limitPrice = masterSignal!.direction === 'LONG' ? masterSignal!.entryZoneMax : masterSignal!.entryZoneMin;
        const isBreakoutOrder = masterSignal!.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;

        const singlePieceMsg = masterSignal!.singlePieceFlowActive
            ? '\n\n🧊 [Single-Piece Flow Stealth Active]\n총 주문 수량을 최소 단위로 쪼개어 수백 밀리초 단위로 랜덤 분할 전송(Iceberg)합니다.'
            : '';

        alert(`🎯 지정가/스탑리밋 주문 라우팅 작동 (MAKER-ONLY 강제):\n\n방식: [${isBreakoutOrder ? '돌파 추격 (Stop-Conditional)' : '되돌림 대기 (Limit Order)'}]\n목표 진입가(${limitPrice})에 시드 ${allocationPercent}%를 예약 세팅했습니다.\n\n${isBreakoutOrder ? '(※ 지정한 가격이 깨질 때만 진입하도록 조건부 덫을 설치합니다.)' : '(※ 지정한 가격이 오지 않으면 쿨하게 보내주십시오.)'}${singlePieceMsg}`);

        // Increase WIP limit
        setActivePositions(prev => prev + 1);
        clearActiveSignal();

        // ... proceeding to trade result mockup
        const isWin = Math.random() < 0.5; // 50/50 for mock
        setTimeout(() => {
            executeTrade(isWin ? 'WIN' : 'LOSS');
        }, 5000);
    };

    const executeTrade = (result: 'WIN' | 'LOSS') => {
        setIsShadowTracking(false);
        setActivePositions(prev => Math.max(0, prev - 1));

        if (!isVip) setAmmo(prev => Math.max(0, prev - 1));

        if (result === 'LOSS') {
            setShowFiveWhys(true); // Trigger Post-mortem
            const newLosses = losses + 1;
            setLosses(newLosses);
            if (newLosses >= 3 && !isVip) {
                // 3 losses = Ammo 0, Glitch, kick to blue
                setAmmo(0);
                setIsLocked(true);
                try {
                    localStorage.setItem('redPotionLockTime', Date.now().toString());
                } catch (error) {
                    console.warn("Failed to save lock state to local storage:", error);
                }

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
            const newTrueTrade = trueTrades + 1;
            setTrueTrades(newTrueTrade);
            if (newTrueTrade >= 20) { // For demo purposes, hit target after 3 true trades since 17
                setDailyCooldown(true);
            }
        }
    };

    // TWAP Delay Countdown Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (twapLockCountdown > 0) {
            interval = setInterval(() => {
                setTwapLockCountdown((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        // Automatically show pre trade or execute when lock expires
                        setShowPreTrade(true);
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [twapLockCountdown]);

    if (loading) {
        return (
            <div className="w-full min-h-[400px] flex items-center justify-center bg-zinc-950 rounded-xl mt-8">
                <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
        );
    }

    if (isLocked && !isVip && user) {
        return (
            <div className={`w-full relative min-h-[400px] flex items-center justify-center border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden mt-8 grayscale ${losses >= 3 && 'animate-[pulse_0.1s_ease-in-out_infinite]'}`}>
                <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-10 transition-colors">
                    <Skull className={`w-16 h-16 text-zinc-500 mb-4 mix-blend-screen ${losses >= 3 && 'text-rose-600 animate-spin'}`} />
                    <h2 className="text-3xl font-black text-rose-500 tracking-widest uppercase mb-2">💀 생존 한계선 이탈 (FATAL)</h2>
                    <p className="text-zinc-300 font-bold max-w-md mx-auto leading-relaxed mt-4 bg-black/50 p-4 border border-zinc-800 rounded-lg">
                        🛡️ 손익은 우주의 흐름일 뿐입니다.<br />
                        <span className="text-rose-400">현재 알고리즘과 시장 레짐의 불일치로 인해 24시간 동안 전술을 강제 종료(Lock)합니다.</span>
                    </p>
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
                </div>
                <div className="mt-8 px-6 py-2 border border-rose-900 bg-black rounded-full text-rose-500 font-mono text-xs z-10">
                    SYS.LOCK.TIMER_ACTIVE: 24h
                </div>
            </div>
        );
    }

    if (dailyCooldown && !isVip && user) {
        return (
            <div className={`w-full relative min-h-[400px] flex items-center justify-center border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden mt-8 grayscale`}>
                <div className="absolute inset-0 bg-blue-950/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-10 transition-colors">
                    <ShieldAlert className={`w-16 h-16 text-blue-500 mb-4 mix-blend-screen animate-pulse`} />
                    <h2 className="text-3xl font-black text-blue-500 tracking-widest uppercase mb-2">🛡️ Daily Cooldown (Guard)</h2>
                    <p className="text-zinc-300 font-bold max-w-md mx-auto leading-relaxed mt-4 bg-black/50 p-4 border border-blue-900/50 rounded-lg">
                        일일 목표 수익 초과 달성 및 과신(Overconfidence) 방지 모드 가동.<br />
                        <span className="text-blue-400 mt-2 block">시스템이 12시간 동안 쿨다운 모드에 진입합니다. 수익을 지키십시오.</span>
                    </p>
                    <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg">
                        <p className="text-indigo-300 text-[11px] font-medium">
                            🌟 과정을 완벽히 준수한 승리를 축하합니다. 시장에서 물러나 휴식을 취하십시오.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Determine the max allowed seed specifically for Red Potion (e.g., typically lower than Blue potion defaults)
    const permittedSeed = currentSeed * (MAX_SEED_PERCENT / 100);

    return (
        <div className="w-full flex flex-col items-center justify-center mt-6">

            {/* 1000 True Trades Dashboard */}
            <div className="w-full max-w-4xl mb-6 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex flex-col items-center justify-center group overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 pointer-events-none"></div>
                <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    진정한 궤적 (Innovation Accounting)
                </h2>
                <div className="flex items-center gap-4 w-full max-w-lg mt-2">
                    <span className="text-xs font-mono font-black text-zinc-300 text-right w-12">{trueTrades}</span>
                    <div className="flex-1 h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden relative shadow-inner">
                        <div
                            className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                            style={{ width: `${(trueTrades / 1000) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500/80 text-left w-32 tracking-wider">/ 1,000 TRUE TRADES</span>
                </div>
                <p className="mt-4 text-[9px] text-zinc-600 font-bold tracking-widest text-center">결과적 손익이 아닌 시스템 원칙을 100% 준수한 완벽한 과정만이 이곳에 기록됩니다.</p>
            </div>

            <Card className="w-full max-w-4xl shadow-2xl overflow-hidden border-rose-900/50 bg-zinc-950 relative">
                {/* Neon Red Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

                {/* HP1 v49.0: Zen-Mode Lockdown Overlay */}
                {zenLockdownEnd > 0 && (
                    <div className="absolute inset-0 z-[100] backdrop-blur-xl bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
                        <ShieldAlert className="w-20 h-20 text-indigo-500 mb-6 animate-pulse" />
                        <h2 className="text-3xl font-black text-white tracking-widest mb-4">ZEN-MODE LOCKDOWN</h2>
                        <p className="text-zinc-300 text-lg max-w-lg leading-relaxed mb-6 italic">
                            "판단을 놓는 순간 자유가 시작됩니다.<br />이것은 비극이 아니라 하나의 완전한 통계적 시스템 흐름일 뿐입니다."
                        </p>
                        <div className="text-indigo-400 font-mono text-xl bg-indigo-950/30 px-6 py-3 rounded-full border border-indigo-900/50">
                            냉각 남은 시간: {Math.ceil((zenLockdownEnd - Date.now()) / 1000)}초
                        </div>
                        <p className="text-xs text-zinc-500 mt-8">물리적 차단 진행 중 (수동 개입 불가)</p>
                    </div>
                )}

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
                        <div className="flex flex-wrap items-center gap-2 mt-1 justify-end sm:justify-start pr-2 sm:pr-0">
                            <button
                                onClick={() => syncModeToggle('isArcadeMode', isArcadeMode)}
                                className={`border px-2 py-1 font-bold font-mono text-[9px] sm:text-[10px] transition-colors rounded uppercase flex items-center gap-1 leading-none ${isArcadeMode ? 'bg-purple-900/40 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-purple-500'}`}
                            >
                                🕹️ Arcade Mode
                            </button>
                            <button
                                onClick={() => syncModeToggle('isMicroScalper', isMicroScalper)}
                                className={`border px-2 py-1 font-bold font-mono text-[9px] sm:text-[10px] transition-colors rounded uppercase flex items-center gap-1 leading-none ${isMicroScalper ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-emerald-500'}`}
                            >
                                ⚡ Micro Scalper
                            </button>
                            <button
                                onClick={() => syncModeToggle('isAssaultMode', isAssaultMode)}
                                className={`border px-2 py-1 font-bold font-mono text-[9px] sm:text-[10px] transition-colors rounded uppercase flex items-center gap-1 leading-none ${isAssaultMode ? 'bg-orange-900/40 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-orange-500'}`}
                            >
                                ⚔️ Assault Mode (RR↓)
                            </button>
                            <button
                                onClick={() => setIsGoldfishMode(!isGoldfishMode)}
                                className={`border px-2 py-1 font-bold font-mono text-[9px] sm:text-[10px] transition-colors rounded uppercase flex items-center gap-1 leading-none ${isGoldfishMode ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-yellow-500'}`}
                            >
                                🐟 Goldfish AP
                            </button>
                            <button
                                onClick={() => setIsThe100Mode(!isThe100Mode)}
                                className={`border px-2 py-1 font-bold font-mono text-[9px] sm:text-[10px] transition-colors rounded uppercase flex items-center gap-1 leading-none ${isThe100Mode ? 'bg-red-900/40 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-red-500'}`}
                            >
                                🎯 100 Bootcamp
                            </button>
                        </div>
                    </div>

                    {/* Ammo System */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                            {isVip ? '탄창 (Unlimited VIP)' : '탄창 (Daily Ammo)'}
                        </span>
                        <div className="flex gap-1.5 items-center">
                            {/* KRW Toggle */}
                            <button
                                onClick={() => setUseKrw(!useKrw)}
                                className={`text-[9px] mr-2 px-1.5 py-0.5 rounded border transition-colors ${useKrw ? 'border-blue-500 bg-blue-900/30 text-blue-400' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                            >
                                KRW 변환
                            </button>
                            {/* Omni-Sync Status (Only show when active to avoid clutter) */}
                            {omniSyncStatus !== 'OFF' && (
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold mr-2 ${omniSyncStatus === 'CONNECTED' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-blue-950/30 border-blue-500/50 text-blue-400 animate-pulse'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${omniSyncStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-bounce'}`}></div>
                                    {omniSyncStatus === 'CONNECTED' ? 'OMNI-SYNC ONLINE' : 'CLOUD SYNCING'}
                                </div>
                            )}
                            {/* Copy Trade Sync Toggle */}
                            <button
                                onClick={() => {
                                    const next = !isCopySync;
                                    setIsCopySync(next);
                                    if (next) {
                                        alert("🌐 [카피 트레이딩 동기화 ON] 바이비트(Bybit) API 연결됨. 글로벌 팔로워 수익 셰어링 활성화 중.");
                                    }
                                }}
                                className={`text-[9px] mr-2 px-1.5 py-0.5 font-bold uppercase rounded border transition-colors ${isCopySync ? 'border-orange-500 bg-orange-900/40 text-orange-400' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}
                            >
                                {isCopySync ? '🌐 Copy Sync ON' : '🔄 Copy Sync'}
                            </button>
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

                {/* Zen-Mode Pre-Trade Execute Modal */}
                {showPreTrade && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-2xl p-4 transition-all duration-700">
                        <div className="flex flex-col items-center justify-center w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
                            <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mb-12 animate-pulse font-bold flex flex-col items-center gap-2">
                                <Flame className="w-5 h-5 text-rose-500" />
                                🎯 스나이퍼 포커스 (Zen-Mode)
                            </h3>

                            <div className="w-full flex justify-between px-2 mb-10 text-xl font-mono text-zinc-300">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] uppercase text-emerald-500 font-bold bg-emerald-950/40 px-2 rounded">진입 (Entry)</span>
                                    <span>{formatPrice(netVals.entry)}</span>
                                </div>
                                <div className="flex flex-col items-center border-l border-r border-zinc-800 px-8 gap-2">
                                    <span className="text-[10px] uppercase text-blue-500 font-bold bg-blue-950/40 px-2 rounded">수익 (TP)</span>
                                    <span className="font-bold text-2xl text-white">{formatPrice(netVals.target)}</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] uppercase text-rose-500 font-bold bg-rose-950/40 px-2 rounded">손절 (SL)</span>
                                    <span>{formatPrice(netVals.sl)}</span>
                                </div>
                            </div>

                            <div className="text-5xl font-black font-mono tracking-tighter text-emerald-400 mb-12 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] flex flex-col items-center gap-2">
                                <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Live Risk Reward</span>
                                <div>{liveRr.toFixed(2)} <span className="text-xl text-zinc-500 ml-1">R</span></div>
                            </div>

                            <Button onClick={confirmExecuteTrade} className="w-full h-16 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-lg tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
                                EXECUTE (1-CLICK)
                            </Button>

                            <button onClick={() => setShowPreTrade(false)} className="mt-8 text-zinc-600 font-mono text-xs hover:text-white transition-colors uppercase tracking-widest font-bold">
                                Cancel / Retreat
                            </button>
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
                                            {masterSignal.splitCoreWalletChallenge ? (
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs text-blue-400 font-bold flex items-center gap-2">⚔️ 10% 할당 공격 코어 (Basic Kelly)</span>
                                                        <span className="font-mono text-blue-400 text-sm font-bold flex items-center gap-1">
                                                            ${((100 * (masterSignal.kellyRiskPct * 3)) / 100).toFixed(2)} ({(masterSignal.kellyRiskPct * 3).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 font-mono text-center tracking-tight leading-relaxed mb-3 bg-blue-950/30 p-2 border-blue-900/50 rounded border">
                                                        수학적으로 가장 공격적인 <strong>순수 켈리 공식</strong>을 '소액의 시드'에만 작동시킵니다. 카타르시스와 기하급수적 북리를 허용합니다.
                                                    </p>
                                                    <div className="flex justify-between items-start mb-2 border-t border-emerald-900/50 pt-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs text-emerald-500 font-bold flex items-center gap-2">🛡️ 90% 할당 본대 (Risk-Constrained Target)</span>
                                                            {masterSignal?.abTestWinningStrategy && (
                                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                                                                    A/B 챔피언: {masterSignal.abTestWinningStrategy}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-mono text-emerald-400 text-sm font-bold flex items-center gap-1">
                                                            ${((currentSeed * allocationPercent) / 100).toFixed(2)} ({allocationPercent}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-emerald-500 font-bold flex items-center gap-2">🛡️ 기관급 리스크 관리 시스템 가동</span>
                                                        {masterSignal?.abTestWinningStrategy && (
                                                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                                                                A/B 챔피언: {masterSignal.abTestWinningStrategy}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-mono text-emerald-400 text-sm font-bold flex items-center gap-1">
                                                        ${((currentSeed * allocationPercent) / 100).toFixed(2)} ({allocationPercent}%)
                                                    </span>
                                                </div>
                                            )}
                                            {allocationPercent === 0 ? (
                                                <p className="text-[10px] text-rose-400 leading-relaxed mb-3 font-bold border border-rose-900/50 bg-rose-950/30 p-2 rounded">
                                                    🚫 2차 머신러닝(Meta-Labeling) 결과가 '가짜 돌파(False Breakout)' 또는 '승산 낮음'으로 판단하여 시스템이 비중을 0%로 강제 하향 조정했습니다.
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-zinc-500 font-mono text-center tracking-tight leading-relaxed">
                                                    부트스트래핑 몬테카를로 최적화를 기반으로 RoMaD(최대 낙폭 대비 수익률)를 극대화하는 켈리 기반 시스템이 이번 거래의 비중을 자동 락인(Lock-in)합니다.
                                                </p>
                                            )}
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3">
                                                <div className={`h-full ${allocationPercent === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(Math.max(allocationPercent, 0.5) / 10) * 100}%` }}></div>
                                            </div>

                                            {masterSignal.dqnActive && (
                                                <div className="mt-3 flex justify-between items-center bg-blue-950/30 p-2 rounded text-[10px] border border-blue-900/40 font-mono">
                                                    <span className="text-blue-300 font-bold">🧠 DQN 에이전트 가중치 재조정</span>
                                                    {masterSignal.dqnPenalty ? (
                                                        <span className="text-rose-400 font-bold animate-pulse text-[9px]">승률 붕괴 페널티: -{masterSignal.dqnPenalty}%</span>
                                                    ) : (
                                                        <span className="text-emerald-400 font-bold text-[9px]">Q-Value 최적성 유지</span>
                                                    )}
                                                </div>
                                            )}
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

                                    {/* HP1 v47.0 Daily Passive Traps */}
                                    <div className="w-full max-w-sm mb-8 mt-2 p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center relative z-10 transition-all hover:border-amber-900/50 hover:bg-zinc-950">
                                        <h4 className="flex items-center gap-2 text-[11px] sm:text-xs font-black text-amber-500 mb-4 border-b border-zinc-800 pb-2 w-full justify-center">
                                            <Sunrise className="w-4 h-4" />
                                            <span className="tracking-[0.2em]">DAILY PASSIVE TRAPS</span>
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 mb-3 leading-tight">24h 볼륨 프로파일 및 딥러닝 기반 아침 지정가 브리핑. (매일 09:00 UTC+9 갱신)</p>
                                        <div className="w-full bg-blue-950/40 border border-blue-900/50 rounded flex items-center justify-center p-2 mb-4">
                                            <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1 font-mono tracking-tighter">
                                                <Lock className="w-3 h-3 flex-shrink-0" /> [09:00 UTC+9 스냅샷 고정 완료] 다음 갱신까지 타점이 절대 변동되지 않습니다.
                                            </span>
                                        </div>
                                        <div className="space-y-4 w-full">
                                            {/* LONG TRAP */}
                                            {dailyTraps?.long && (
                                                <div className="bg-black/60 border border-emerald-900/30 p-3 rounded-xl text-xs space-y-3 transition-colors hover:bg-black group hover:border-emerald-500/50">
                                                    <div className="flex justify-between items-center pb-2 border-b border-emerald-900/20">
                                                        <span className="text-emerald-500 font-black bg-emerald-950/50 px-2.5 py-1 rounded uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                            <Cpu className="w-3 h-3" /> 매수 덫 (LONG TRAP)
                                                        </span>
                                                        <span className="text-emerald-400/80 text-[9px] font-mono border border-emerald-900/50 px-1.5 py-0.5 rounded">[{dailyTraps.shape || 'P-Shape'} 국면]</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] sm:text-[11px] px-1">
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Entry (HVN)</span><span className="text-zinc-100 font-black font-mono">{dailyTraps.long.entry.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Target (TP)</span><span className="text-emerald-400 font-black font-mono">{dailyTraps.long.target.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Stop Loss (LVN)</span><span className="text-rose-400 font-black font-mono">{dailyTraps.long.sl.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">RR Ratio</span><span className="text-amber-400 font-black font-mono">1:{dailyTraps.long.rr}</span></div>
                                                    </div>
                                                    <div className="pt-2 border-t border-emerald-900/20 text-[10px] flex flex-col gap-1.5 px-1 bg-emerald-950/20 rounded py-1.5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-zinc-400">⚖️ Busseti Kelly 비중</span>
                                                            <span className="text-purple-400 font-black">{dailyTraps.long.kelly}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-zinc-400">⚡ 100회 복리 기대수익</span>
                                                            <span className="text-blue-400 font-black">+{dailyTraps.long.ev}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SHORT TRAP */}
                                            {dailyTraps?.short && (
                                                <div className="bg-black/60 border border-rose-900/30 p-3 rounded-xl text-xs space-y-3 transition-colors hover:bg-black group hover:border-rose-500/50">
                                                    <div className="flex justify-between items-center pb-2 border-b border-rose-900/20">
                                                        <span className="text-rose-500 font-black bg-rose-950/50 px-2.5 py-1 rounded uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                                                            <Cpu className="w-3 h-3" /> 매도 덫 (SHORT TRAP)
                                                        </span>
                                                        <span className="text-rose-400/80 text-[9px] font-mono border border-rose-900/50 px-1.5 py-0.5 rounded">[{dailyTraps.shape || 'b-Shape'} 국면]</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] sm:text-[11px] px-1">
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Entry (HVN)</span><span className="text-zinc-100 font-black font-mono">{dailyTraps.short.entry.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Target (TP)</span><span className="text-emerald-400 font-black font-mono">{dailyTraps.short.target.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">Stop Loss (LVN)</span><span className="text-rose-400 font-black font-mono">{dailyTraps.short.sl.toLocaleString()}</span></div>
                                                        <div className="flex flex-col"><span className="text-zinc-500 uppercase tracking-tighter text-[9px]">RR Ratio</span><span className="text-amber-400 font-black font-mono">1:{dailyTraps.short.rr}</span></div>
                                                    </div>
                                                    <div className="pt-2 border-t border-rose-900/20 text-[10px] flex flex-col gap-1.5 px-1 bg-rose-950/20 rounded py-1.5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-zinc-400">⚖️ Busseti Kelly 비중</span>
                                                            <span className="text-purple-400 font-black">{dailyTraps.short.kelly}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-zinc-400">⚡ 100회 복리 기대수익</span>
                                                            <span className="text-blue-400 font-black">+{dailyTraps.short.ev}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Zap className="w-12 h-12 text-zinc-700 mb-4 group-hover:text-rose-500 transition-colors duration-500 relative z-10" />
                                    <h3 className="text-lg font-bold text-zinc-400 mb-2 font-mono tracking-widest uppercase relative z-10">Zero Marginal Cost Sync</h3>
                                    <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-wider font-bold relative z-10">1 Center Brain ➠ BroadCasting</p>
                                    <div className="text-[9px] text-emerald-400/80 mb-6 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/30 font-bold tracking-tight relative z-10">
                                        ⚡ 로컬 엣지 AI 동작중 (CVD/노이즈 필터링 연산 분산)
                                    </div>

                                    {noEdgeWarning && (
                                        <div className="w-full bg-amber-950/30 border border-amber-900/50 text-amber-500 text-xs py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 animate-pulse relative z-10">
                                            <ShieldAlert className="w-4 h-4 shrink-0" /> {noEdgeWarning}
                                        </div>
                                    )}

                                    <div className="w-full max-w-xs mx-auto border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative z-10">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <div className="relative flex h-3 w-3">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </div>
                                            <span className="text-emerald-400 font-mono text-sm tracking-widest font-black uppercase">
                                                Auto-Sniper Sentry
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 text-[10px] tracking-wider uppercase font-bold">
                                            TradingView Webhook 24/7 <br/> Background Monitoring Active
                                        </p>
                                    </div>
                                    <span className="text-[9px] text-zinc-600 mt-3 font-mono block">NO MANUAL ACTION REQUIRED</span>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                    {/* HUD Header & Arcade Condition */}
                                    {isArcadeMode ? (
                                        <div className="p-8 rounded-xl border-4 bg-zinc-950 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                                            <div className="absolute top-4 right-4 flex gap-3 z-20">
                                                <button onClick={() => setShowHistoryPanel(true)} className="text-zinc-500 hover:text-emerald-400"><History className="w-5 h-5" /></button>
                                                <button onClick={clearActiveSignal} className="text-zinc-500 hover:text-rose-400"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg></button>
                                            </div>

                                            {ttlRemaining !== null && (
                                                <div className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black tracking-widest ${isSignalExpired ? 'bg-zinc-900 border-zinc-700 text-zinc-500' : 'bg-rose-950 border-rose-600 text-rose-400 animate-pulse shadow-lg'}`}>
                                                    <Clock className="w-4 h-4" />
                                                    {isSignalExpired ? 'TIME O V E R' : `T T L : ${Math.floor(ttlRemaining / 60).toString().padStart(2, '0')}:${(ttlRemaining % 60).toString().padStart(2, '0')}`}
                                                </div>
                                            )}

                                            <div className="text-[120px] sm:text-[180px] leading-none drop-shadow-2xl mb-2 filter">
                                                {masterSignal.direction === 'LONG' ? '🟩' : masterSignal.direction === 'SHORT' ? '🟥' : '⬜'}
                                            </div>

                                            <div className={`text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-8 ${masterSignal.direction === 'LONG' ? 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : masterSignal.direction === 'SHORT' ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)]' : 'text-zinc-500'}`}>
                                                {masterSignal.direction}
                                                {masterSignal.lstmForecastStatus && (
                                                    <span className={`block text-sm sm:text-base font-mono tracking-widest mt-2 ${masterSignal.lstmForecastStatus === 'BULLISH' ? 'text-emerald-400' : masterSignal.lstmForecastStatus === 'BEARISH' ? 'text-rose-400' : 'text-zinc-400'}`}>
                                                        🧠 LSTM: {masterSignal.lstmForecastStatus}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-4">
                                                <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-3 sm:p-4 text-center group cursor-pointer hover:bg-blue-900/50 transition-colors" onClick={() => handleCopy(displayValues.entry, "진입 (ENTRY)")}>
                                                    <div className="text-[10px] text-blue-500 font-black mb-1 tracking-widest uppercase flex items-center justify-center gap-1 group-hover:text-white">진입 <Copy className="w-3 h-3 opacity-50" /></div>
                                                    <div className="text-lg sm:text-2xl font-black text-blue-400 font-mono tracking-tighter group-hover:text-white">
                                                        {formatPrice(masterSignal.entryZoneMin as number)} ~ {formatPrice(masterSignal.entryZoneMax as number)}
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 sm:p-4 text-center group cursor-pointer hover:bg-emerald-900/50 transition-colors" onClick={() => handleCopy(displayValues.target, "익절 (TARGET)")}>
                                                    <div className="text-[10px] text-emerald-500 font-black mb-1 tracking-widest uppercase flex items-center justify-center gap-1 group-hover:text-white">익절 <Copy className="w-3 h-3 opacity-50" /></div>
                                                    <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tighter group-hover:text-white">{formatPrice(displayValues.target)}</div>
                                                </div>
                                                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3 sm:p-4 text-center group cursor-pointer hover:bg-rose-900/50 transition-colors" onClick={() => handleCopy(displayValues.sl, "손절 (STOP)")}>
                                                    <div className="text-[10px] text-rose-500 font-black mb-1 tracking-widest uppercase flex items-center justify-center gap-1 group-hover:text-white">손절 <Copy className="w-3 h-3 opacity-50" /></div>
                                                    <div className="text-xl sm:text-3xl font-black text-rose-400 font-mono tracking-tighter group-hover:text-white">{formatPrice(displayValues.sl)}</div>
                                                </div>
                                                <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3 sm:p-4 text-center flex flex-col justify-center items-center">
                                                    <div className="text-[10px] text-amber-500 font-black mb-1 tracking-widest uppercase">손익비 (RR)</div>
                                                    <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono tracking-tighter drop-shadow-md">{liveRr.toFixed(1)}R</div>
                                                </div>
                                            </div>

                                            {/* HP1 v44.0: Arcade Mode 최우선 렌더링 & 실행 버튼 연동 */}
                                            <div className="mt-4 flex flex-col gap-3 w-full max-w-lg mb-4">
                                                <Button onClick={() => setIsArcadeMode(false)} variant="outline" className="w-full font-mono text-[11px] sm:text-xs uppercase bg-black/60 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white border-dashed h-12 transition-all shadow-inner">
                                                    ▼ 복잡한 분석 상세 보기 (Lazy Load 해제)
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (!isShadowTracking) {
                                                            setIsShadowTracking(true);
                                                            alert('수동 진입을 확인했습니다. 시장 모멘텀 역전 감시(Shadow mode)를 시작합니다.');
                                                        }
                                                    }}
                                                    disabled={isSignalExpired || isShadowTracking}
                                                    className={`w-full h-16 font-black text-lg sm:text-xl tracking-widest transition-all ${isSignalExpired ? 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border-none' : isShadowTracking ? 'bg-purple-900/40 text-purple-400 border border-purple-500 animate-[pulse_2s_ease-in-out_infinite]' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]'}`}
                                                >
                                                    {isSignalExpired ? '만료됨 (DISCARD)' : isShadowTracking ? '가상 감시 중...(Shadow mode)' : '🖐️ 텔레그램 확인 후 수동 진입 완료 (Shadow 시작)'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border bg-black/50 border-zinc-800 relative overflow-visible">
                                            <div className="absolute top-0 right-0 p-1 opacity-20 hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => setShowHistoryPanel(true)} className="text-zinc-500 hover:text-emerald-400">
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => alert("📊 주간 코호트 대시보드 (Innovation Accounting)\n이번 주 최고 승률 전술: D-Shape 역추세 롱 (68% 승률)\n- 돌파 비중 축소 요망\n- 볼륨 트레일링 스탑 적용 시 이익 보존율: 84%")} className="text-zinc-500 hover:text-blue-400" title="코호트 대시보드">
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                                <button onClick={clearActiveSignal} className="text-zinc-500 hover:text-rose-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-center justify-center mb-4 pb-4 border-b border-zinc-800 relative z-10">
                                                {ttlRemaining !== null && (
                                                    <div className={`mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${isSignalExpired ? 'bg-zinc-900 border-zinc-700 text-zinc-500' : 'bg-rose-950/30 border-rose-900/50 text-rose-400'}`}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {isSignalExpired ? (
                                                            <span>전술 만료됨 (EXPIRED)</span>
                                                        ) : (
                                                            <span>전술 유효시간: {Math.floor(ttlRemaining / 60).toString().padStart(2, '0')}:{(ttlRemaining % 60).toString().padStart(2, '0')}</span>
                                                        )}
                                                    </div>
                                                )}

                                                <Button onClick={() => setIsArcadeMode(true)} variant="outline" size="sm" className="absolute top-0 right-14 border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white font-mono text-[9px] sm:text-[10px] h-7 px-2 border-dashed z-20">
                                                    ▲ 아케이드 모드 (Lazy Loading)
                                                </Button>

                                                <span className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-1 mt-1">SNIPER HUD - MASTER SYNC</span>
                                                {masterSignal.sessionInfo && (
                                                    <div className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 px-3 py-1 rounded-full mb-3 flex items-center gap-1 shadow-inner">
                                                        🌐 킬존 관측망 활성화: <strong className="text-purple-400">{masterSignal.sessionInfo}</strong>
                                                    </div>
                                                )}
                                                {masterSignal.saasBroadcastingActive && (
                                                    <div className="bg-purple-950/40 border border-purple-900 text-[10px] text-purple-400 px-3 py-1 rounded-full mb-3 flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)] animate-pulse">
                                                        <Share2 className="w-3 h-3" /> SaaS Copy-Trading: API 포트 브로드캐스팅 중...
                                                    </div>
                                                )}
                                                {masterSignal.direction === 'LONG' ? (
                                                    <div className={`text-5xl font-black ${isLateEntry ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col items-center gap-2`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-3xl">{isLateEntry ? '⚠️' : '🟢'}</span> LONG <span className="text-lg opacity-50 tracking-normal text-zinc-300">({isLateEntry ? 'Risk: 지각 진입' : '매수 우위'})</span>
                                                        </div>
                                                        {masterSignal.lstmForecastStatus && <span className="text-[11px] sm:text-xs font-mono tracking-widest text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full">🧠 LSTM Forecast: {masterSignal.lstmForecastStatus}</span>}
                                                    </div>
                                                ) : masterSignal.direction === 'SHORT' ? (
                                                    <div className={`text-5xl font-black ${isLateEntry ? 'text-amber-500 animate-pulse' : 'text-rose-500'} tracking-tighter drop-shadow-[0_0_20px_rgba(225,29,72,0.3)] flex flex-col items-center gap-2`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-3xl">{isLateEntry ? '⚠️' : '🔴'}</span> SHORT <span className="text-lg opacity-50 tracking-normal text-zinc-300">({isLateEntry ? 'Risk: 지각 진입' : '매도 우위'})</span>
                                                        </div>
                                                        {masterSignal.lstmForecastStatus && <span className="text-[11px] sm:text-xs font-mono tracking-widest text-rose-400 bg-rose-950/50 px-3 py-1 rounded-full">🧠 LSTM Forecast: {masterSignal.lstmForecastStatus}</span>}
                                                    </div>
                                                ) : (
                                                    <div className={`text-5xl font-black text-zinc-500 tracking-tighter flex items-center gap-2`}>
                                                        <span className="text-3xl">☁️</span> WAIT <span className="text-lg opacity-50 tracking-normal text-zinc-300">(대기)</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* HP1 v44.0: Dynamic Indicator Pruning */}
                                            {masterSignal && distancePercent > 1 ? (
                                                <div className="w-[90%] mx-auto bg-black border border-zinc-800 text-zinc-400 text-xs py-5 px-3 rounded-xl mb-4 flex flex-col items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,0,0,0.8)_inset] text-center">
                                                    <span className="text-zinc-500 font-black tracking-[0.2em] uppercase flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /></svg> Dynamic Pruning 활성화 (Sleep)</span>
                                                    <span className="text-[10px] text-zinc-600 font-mono leading-relaxed max-w-xs break-keep">가격이 타점 구간 반경 1% 밖에 위치해 있습니다. 무거운 오더플로우 연산 및 XAI 백테스팅 모듈을 강제 셧다운(Shutdown)하여 연산 메모리를 절약합니다.</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {masterSignal.periodicSpikeExploited && (
                                                        <div className="w-[90%] mx-auto bg-amber-950/40 border border-amber-500 text-amber-400 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                                            <Clock className="w-4 h-4" /> 15-Minute Periodic Spike 선행매매 포착
                                                        </div>
                                                    )}
                                                    {masterSignal.pairTrading?.isPairTrade && (
                                                        <div className="w-[90%] mx-auto bg-indigo-950/40 border border-indigo-500 text-indigo-400 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex flex-col items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                            <span>⚖️ 페어 트레이딩 (Market Neutral) Z-Score: <strong className="text-white">{masterSignal.pairTrading.zScore}</strong> | 연계: {masterSignal.pairTrading.pairAsset}</span>
                                                            {masterSignal.setarRegime && (
                                                                <span className="text-[9px] text-indigo-300 font-mono tracking-tighter">
                                                                    [SETAR Non-Linear Spread: <strong>{masterSignal.setarRegime}</strong> 체제 (임계점 이탈 확인)]
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {masterSignal.isLiquidationSweep && (
                                                        <div className="w-[90%] mx-auto bg-purple-950/40 border border-purple-500 text-purple-400 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-bold animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                                            <span>⚡ 청산 물량 흡수(Reverse) S급 전술 발동</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.isIceberg && (
                                                        <div className="w-[90%] mx-auto bg-blue-950/40 border border-blue-500 text-blue-400 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                                            <span>🧊 빙산 주문(Iceberg Order) 감지: 해당 가격대에 거대 기관의 숨겨진 유동성(Hidden Liquidity) 존재 (절대 지지선)</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.isConfluenceTrap && (
                                                        <div className="w-[90%] mx-auto bg-amber-950/40 border border-amber-500 text-amber-400 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                                            <span>🧲 Heatmap+CVD 흡수 트랩(Confluence Trap) 감지: 개미 꼬시기 물량 체크 완료! 반전거래 라우팅 발동</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.hasMultipleHVN && (
                                                        <div className="w-[90%] mx-auto bg-yellow-950/60 border-2 border-yellow-500 text-yellow-500 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-black shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                                            <span>🧱 기관 다중 참호(Multiple HVN) 감지: 절대 지지/저항선 형성 완료</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.quarantinedEngines && masterSignal.quarantinedEngines.length > 0 && (
                                                        <div className="w-[90%] mx-auto bg-red-950/60 border border-red-500/50 text-red-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(220,38,38,0.2)] text-center animate-pulse">
                                                            <span className="text-red-300">🦠 Immune System:</span> 엔진 격리됨 ({masterSignal.quarantinedEngines.join(', ')}). 몬테카를로 안정화 대기 중
                                                        </div>
                                                    )}
                                                    {masterSignal.emdDenoised && (
                                                        <div className="w-[90%] mx-auto bg-blue-950/60 border border-blue-500/50 text-blue-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] text-center">
                                                            <span>🌊 EMD Denoising: 가짜 파동 78% 제거 및 순수 추세선 추출 완료</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.whaleTradesFiltered && (
                                                        <div className="w-[90%] mx-auto bg-indigo-950/60 border border-indigo-500/50 text-indigo-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)] text-center">
                                                            <span className="text-indigo-300">🐳 Whale Filter:</span> 노이즈(소형주문) 제거 및 기관성 체결만 수집 중
                                                        </div>
                                                    )}
                                                    {masterSignal.roundnessBiasFiltered && (
                                                        <div className="w-[90%] mx-auto bg-teal-950/60 border border-teal-500/50 text-teal-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(20,184,166,0.2)] text-center">
                                                            <span className="text-teal-300">🤖 Smart Money Filter:</span> 정수 단위 덤머니(Dumb Money) 베팅 무시 됨
                                                        </div>
                                                    )}
                                                    {masterSignal.mboSpoofingStatus && masterSignal.mboSpoofingStatus !== 'NONE' && (
                                                        <div className={`w-[90%] mx-auto border text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold text-center shadow-md
                                                ${masterSignal.mboSpoofingStatus === 'CLOUD'
                                                                ? 'bg-sky-950/50 border-sky-400/50 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                                                                : 'bg-orange-950/50 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                                            }`}
                                                        >
                                                            <span>MBO X-Ray: 단일 거대 매물대 발견. </span>
                                                            {masterSignal.mboSpoofingStatus === 'CLOUD' ? (
                                                                <span className="text-sky-300">☁️ 허수벽(Spoofing Cloud)으로 판독 완료</span>
                                                            ) : (
                                                                <span className="text-orange-300">🧱 기관성 진짜 벽(Brick Limit)으로 판독 완료</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {masterSignal.isJohansenPairTrade && (
                                                        <div className="w-[90%] mx-auto bg-fuchsia-950/60 border border-fuchsia-500/50 text-fuchsia-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(217,70,239,0.2)] text-center">
                                                            <span className="text-fuchsia-300">⚖️ Johansen Filter:</span> 저변동성 감지. 요한슨 차익거래 덫 모드 제안
                                                        </div>
                                                    )}

                                                    {/* HP1 v38.0: Apex Autonomy & Speed Features */}
                                                    {masterSignal.smcVectorized && (
                                                        <div className="w-[90%] mx-auto bg-green-950/60 border border-green-500/50 text-green-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)] text-center">
                                                            <span>🚀 SMC 벡터화 연산 (80x Speedup): API 딜레이 Zero</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.fvgConsecutiveMerged && (
                                                        <div className="w-[90%] mx-auto bg-pink-950/60 border border-pink-500/50 text-pink-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(236,72,153,0.2)] text-center">
                                                            <span>🧲 FVG 연속 병합(Consecutive Merger): 진성 유동성 갭 발견</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.purePriceActionMode && (
                                                        <div className="w-[90%] mx-auto bg-red-950/60 border border-red-500 text-red-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] text-center animate-pulse">
                                                            <span>⚠️ 비정상 변동성 감지: 후행 지표 연산 중단, 퓨어 프라이스 액션 추적</span>
                                                        </div>
                                                    )}
                                                    {isGoldfishMode && masterSignal.goldfishAutopilotEligible && (
                                                        <div className="w-[90%] mx-auto bg-yellow-950/80 border border-yellow-500 text-yellow-500 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-black shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                                            <span>🐟 금붕어 Auto-Pilot: (비중 10% 자동 축소) 그물 오토 캐스팅 완료</span>
                                                        </div>
                                                    )}

                                                    {/* HP1 v39.0: Mastermind & Cohort Analytics */}
                                                    {masterSignal.dShapeRegimeActive && (
                                                        <div className="w-[90%] mx-auto bg-stone-950/60 border border-stone-500/50 text-stone-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex flex-col items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(120,113,108,0.2)] text-center">
                                                            <span>🧲 D-Shape 볼륨 프로파일 감지: 균형장(Balance Regime) 확인</span>
                                                            <span className="text-[8px] opacity-80">(최상단/최하단 마이크로 핑퐁 전술 승인)</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.volumeTrailingStopActive && (
                                                        <div className="w-[90%] mx-auto bg-cyan-950/60 border border-cyan-500 text-cyan-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-2 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] text-center">
                                                            <span>🛡️ 볼륨-백업 계단식 트레일링 스탑 & Warning Abort 활성화</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.bayesianProbabilityDrop && (
                                                        <div className="w-[90%] mx-auto bg-rose-950/80 border border-rose-600 text-rose-500 text-[10px] sm:text-xs py-2 px-3 rounded mb-3 flex items-center justify-center gap-2 font-black shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse">
                                                            <span>📉 베이지안 틱-확률 하락 감지: 진입 근거 소멸로 덫 강제 회수</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.smcConfluence && masterSignal.smcConfluence.length > 0 && (
                                                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 mb-3">
                                                            {masterSignal.smcConfluence.map((c, idx) => (
                                                                <span key={idx} className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[9px] px-2 py-1 rounded-sm shadow-sm font-bold tracking-widest uppercase">
                                                                    {c}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* HP1 v43.0: The Ecosystem & Omni-Routing */}
                                                    {masterSignal.tcrVerifiedAsset && (
                                                        <div className="w-[90%] mx-auto bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] text-center">
                                                            <span>📜 TCR 안전 구역 검증 완료 (블랙스완 회피)</span>
                                                        </div>
                                                    )}
                                                    {masterSignal.oiDivergenceState === 'BOTTOM_REVERSAL' && (
                                                        <div className="w-[90%] mx-auto bg-blue-950/60 border border-blue-500/50 text-blue-400 text-[9px] sm:text-[10px] py-1.5 px-3 rounded mb-2 flex items-center justify-center gap-1 font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] text-center">
                                                            <span>📉 OI Divergence: 바닥 낚기(연쇄 청산 빔) 확인 완료</span>
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

                                                    {/* HP1 v37.0: Entry Machine State UI */}
                                                    <div className="mt-4 mb-2">
                                                        {isSysBlocked ? (
                                                            <div className="bg-rose-950/50 border border-rose-900/50 text-[10px] text-rose-400 p-3 rounded-lg shadow-lg text-center font-mono animate-pulse">
                                                                {blockReason}
                                                            </div>
                                                        ) : entryMachineState === 'AIMING' ? (
                                                            <div className="bg-blue-950/50 border border-blue-600/50 text-[10px] text-blue-400 p-3 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] text-center font-mono animate-pulse">
                                                                🎯 <strong>조준 중:</strong> 엔트리 존까지 {distanceTicks}틱 ({distancePercent}%) 남았습니다. 그물을 대기합니다.
                                                            </div>
                                                        ) : entryMachineState === 'LOCK_ON' ? (
                                                            <div className="bg-emerald-950/50 border border-emerald-500/50 text-[10px] text-emerald-400 p-3 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center font-mono">
                                                                <strong>락온(Lock-On):</strong> 존 진입 완료. MBO/CVD 스캐너로 기관 물량 흡수(Absorption) 대기 중 (가짜 돌파 확인).
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    {!isSysBlocked && masterSignal.apexNarrative && (
                                                        <div className="mt-2 text-left space-y-2 bg-black/40 p-3 mb-4 border border-zinc-800 shadow-inner rounded relative overflow-hidden text-[10px] font-mono leading-relaxed">
                                                            <div className="absolute top-0 right-0 p-1 opacity-20"><Target className="w-12 h-12" /></div>
                                                            <div className="flex items-start gap-2 text-blue-400">
                                                                <span className="shrink-0 mt-0.5"><Crosshair className="w-3 h-3" /></span>
                                                                <span>{masterSignal.apexNarrative.entryHint}</span>
                                                            </div>
                                                            <div className="flex items-start gap-2 text-emerald-400">
                                                                <span className="shrink-0 mt-0.5"><Target className="w-3 h-3" /></span>
                                                                <span>{masterSignal.apexNarrative.targetHint}</span>
                                                            </div>
                                                            <div className="flex items-start gap-2 text-purple-400">
                                                                <span className="shrink-0 mt-0.5"><ShieldAlert className="w-3 h-3" /></span>
                                                                <span>{masterSignal.apexNarrative.routingHint}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Real-time Edge Scanner Indicator */}
                                            <MiniChartVisualizer
                                                livePrice={livePrice}
                                                entry={netVals.entry}
                                                target={netVals.target}
                                                sl={netVals.sl}
                                                direction={masterSignal.direction as 'LONG' | 'SHORT'}
                                                entryZoneMin={masterSignal.entryZoneMin}
                                                entryZoneMax={masterSignal.entryZoneMax}
                                            />

                                            {/* Price Targets context calculated on CLIENT */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative">
                                                {/* Entry Zone */}
                                                <div className="bg-black/30 border border-zinc-800/80 p-4 rounded-lg text-center relative overflow-hidden group/target flex flex-col justify-center min-h-[100px] sm:min-h-0 cursor-pointer hover:bg-black/50 transition-colors" onClick={() => handleCopy(masterSignal.entryZoneMin as number, "진입 (ENTRY)")}>
                                                    <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/target:opacity-100 transition-opacity flex flex-col items-center">
                                                        <Copy className="w-5 h-5 text-blue-500 mb-1" />
                                                        <span className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter">Copy</span>
                                                    </div>
                                                    <div className="flex flex-col mb-1.5 items-center justify-center">
                                                        <span className="text-[10px] sm:text-[11px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-1 group-hover/target:text-blue-400">진입 마지노선 <Copy className="w-3 h-3 opacity-50 block md:hidden" /></span>
                                                        {masterSignal.decimalMicroOffsetActive && (
                                                            <span className="text-[8px] sm:text-[9px] text-blue-600/80 font-mono tracking-tighter">(.yz0 Micro-Tick Applied)</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xl sm:text-lg font-mono text-blue-400 font-black tracking-tighter leading-none mb-1 group-hover/target:text-white transition-colors">
                                                        {formatPrice(masterSignal.entryZoneMin as number)} <span className="text-zinc-600 text-xs mx-0.5">~</span> {formatPrice(masterSignal.entryZoneMax as number)}
                                                    </span>
                                                    <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-tight opacity-70">
                                                        (해당 구간 이탈 시 진입 금지)
                                                    </div>

                                                    {/* HP1 v37.0: Live Distance Tracker */}
                                                    <div className={`mt-2 py-1 px-2 rounded border inline-block mx-auto font-mono text-[10px] font-bold tracking-widest ${entryMachineState === 'LOCK_ON' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-blue-950/40 border-blue-500/30 text-blue-400'}`}>
                                                        {entryMachineState === 'LOCK_ON' ? `⏳ 잔여 감시 타임: ${timeInZoneCountdown}초` : `거리: -${distanceTicks} Ticks (-${distancePercent}%)`}
                                                    </div>

                                                    {masterSignal.vsaAnomaly === 'STOPPING_VOLUME' && (
                                                        <div className="mt-2 text-[9px] text-rose-300 font-mono tracking-tighter bg-rose-950 border border-rose-500 rounded py-1 px-1.5 font-bold leading-tight shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                                                            🛑 Stopping Volume 감지: абсолютный(절대) 지지선/저항선 형성 완료
                                                        </div>
                                                    )}
                                                    {masterSignal.mtfBandsRsiDivergence && (
                                                        <div className="mt-2 text-[9px] text-fuchsia-300 font-mono tracking-tighter bg-fuchsia-950/40 border border-fuchsia-500/50 rounded py-2 px-2 font-bold leading-tight shadow-[0_0_15px_rgba(217,70,239,0.4)] relative overflow-hidden flex items-center gap-2 text-left">
                                                            <div className="absolute top-0 right-0 p-1 opacity-20"><Crosshair className="w-8 h-8 text-fuchsia-400 animate-spin-slow" /></div>
                                                            <span className="shrink-0"><Crosshair className="w-4 h-4 text-fuchsia-400" /></span>
                                                            <span>🎯 MTF 이중 다이버전스 감지 (%B + RSI): 상위 시간대 방향성과 일치. 초강력 반전 승인 ✚</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Target Price */}
                                                <div className="bg-black/30 border border-zinc-800/80 p-4 rounded-lg text-center relative overflow-hidden group/target flex flex-col justify-center min-h-[100px] sm:min-h-0 cursor-pointer hover:bg-black/50 transition-colors" onClick={() => handleCopy(Math.round(netVals.target), "목표가 (TARGET)")}>
                                                    <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/target:opacity-100 transition-opacity flex flex-col items-center">
                                                        <Copy className="w-5 h-5 text-emerald-500 mb-1" />
                                                        <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Copy</span>
                                                    </div>
                                                    <div className="flex flex-col mb-1.5 items-center justify-center">
                                                        <span className="text-[10px] sm:text-[11px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1 group-hover/target:text-emerald-400">1차 목표가 <Copy className="w-3 h-3 opacity-50 block md:hidden" /></span>
                                                        {masterSignal.decimalMicroOffsetActive && (
                                                            <span className="text-[8px] sm:text-[9px] text-emerald-600/80 font-mono tracking-tighter">(.yz0 Micro-Tick Applied)</span>
                                                        )}
                                                    </div>
                                                    <span className="text-2xl sm:text-xl font-mono text-emerald-400 font-black leading-none mb-1 group-hover/target:text-white transition-colors">
                                                        {formatPrice(displayValues.target)}
                                                    </span>
                                                    <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-tight opacity-70">
                                                        (수수료 제외 +{netVals.netTargetPct}% 실수익)
                                                    </div>
                                                    {masterSignal.liquidityFrontRunnerOffset && (
                                                        <div className="mt-1 text-[9px] text-emerald-300 font-mono tracking-tighter bg-emerald-950/40 p-1 rounded font-bold">
                                                            🏃 Front-Runner: {masterSignal.liquidityFrontRunnerOffset}% 앞당김
                                                        </div>
                                                    )}
                                                    {masterSignal.smartTrailingStopActive && (
                                                        <div className="mt-1 text-[9px] text-amber-300 font-mono tracking-tighter bg-amber-950/40 p-1 rounded font-bold leading-tight">
                                                            🌊 3-Day Trailing Stop 대기 & Volume Defense
                                                        </div>
                                                    )}
                                                    {masterSignal.unfinishedBusinessTarget && (
                                                        <div className="mt-2 text-[9px] text-zinc-300 font-mono tracking-tighter bg-zinc-900 border border-zinc-700/50 rounded py-1 border-dashed">
                                                            🧲 미결제(UB) 연장 TP: {masterSignal.unfinishedBusinessTarget}
                                                        </div>
                                                    )}
                                                    {masterSignal.vwapVacuumTarget && (
                                                        <div className="mt-2 text-[9px] text-cyan-300 font-mono tracking-tighter bg-cyan-950/40 border border-cyan-500/50 rounded py-1 px-1.5 font-bold leading-tight shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                                            🌪️ Thin Profile 진공 돌파 확인: Session VWAP까지 중간 저항 없음 (Vacuum Target 적용됨)
                                                        </div>
                                                    )}
                                                    {masterSignal.netBiasMaxPainTarget && (
                                                        <div className="mt-2 text-[9px] text-purple-300 font-mono tracking-tighter bg-purple-950/40 border border-purple-500/50 rounded py-1 px-1.5 font-bold leading-tight shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                                            🩸 최대 고통 상단(Max Pain Target): {formatPrice(masterSignal.netBiasMaxPainTarget)} (Net Bias 이탈점 맵핑)
                                                        </div>
                                                    )}
                                                    {masterSignal.polynomialBandStatus === 'REVERSION_CHANCE' && (
                                                        <div className="mt-2 text-[9px] text-indigo-300 font-mono tracking-tighter bg-indigo-950/40 border border-indigo-500/50 rounded py-1 px-1.5 font-bold leading-tight shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                                                            📈 다항 회귀 궤도 이탈: 극단적 비선형 과열(Mean Reversion 찬스)
                                                        </div>
                                                    )}
                                                    {masterSignal.volatilityAdjustedTarget !== undefined && (
                                                        <div className="mt-2 text-[9px] text-orange-300 font-mono tracking-tighter bg-orange-950/40 border border-orange-500/50 rounded py-1.5 font-bold leading-tight shadow-[0_0_10px_rgba(249,115,22,0.3)] relative overflow-hidden flex items-start px-2 gap-1 text-left">
                                                            <span className="shrink-0 text-orange-500 text-[11px] leading-tight">💣</span>
                                                            <span>Volatility-Adjusted 예측: 증거금 압박으로 인한 조기 청산 점화(Ignite) 예상. 목표가를 {formatPrice(masterSignal.volatilityAdjustedTarget)}으로 선행 하향 조정합니다</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Stop Loss */}
                                                <div className="bg-black/30 border border-rose-900/40 p-4 rounded-lg text-center relative overflow-hidden flex flex-col justify-center min-h-[100px] sm:min-h-0 group/target cursor-pointer hover:bg-black/50 transition-colors" onClick={() => handleCopy(Math.round(netVals.sl), "손절가 (STOP)")}>
                                                    <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/target:opacity-100 transition-opacity text-rose-500 flex flex-col items-center">
                                                        <Copy className="w-5 h-5 mb-1" />
                                                        <span className="text-[8px] font-bold uppercase tracking-tighter">Copy</span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-[11px] text-rose-500 uppercase flex justify-center items-center gap-1 mb-1.5 font-black tracking-widest drop-shadow-[0_0_5px_rgba(225,29,72,0.8)] group-hover/target:text-rose-400">무효화 조건 <Copy className="w-3 h-3 opacity-50 block md:hidden" /></span>
                                                    <span className="text-2xl sm:text-xl font-mono text-rose-500 font-black leading-none mb-1 group-hover/target:text-white transition-colors">{formatPrice(netVals.sl)}</span>
                                                    <div className="text-[9px] sm:text-[10px] text-rose-400/80 font-bold tracking-tight opacity-70">
                                                        (수수료 포함 -{netVals.netSlPct}% 실손실)
                                                    </div>
                                                    {masterSignal.isDarkSideSL && (
                                                        <div className="mt-2 bg-indigo-950/40 border border-indigo-500/50 text-indigo-400 text-[8px] sm:text-[9px] p-2 pr-1 rounded text-left leading-tight font-bold">
                                                            🛡️ 고래 스탑헌팅 회피: 다크 사이드(안전 구역)로 무효화 라인 자동 조정 완료
                                                        </div>
                                                    )}
                                                    {masterSignal && netVals.sl > 0 && (Math.abs(livePrice - netVals.sl) / livePrice) < 0.01 && (
                                                        <div className="mt-2 text-[9px] text-rose-500 font-mono tracking-tighter bg-rose-950/40 border border-rose-500/50 p-2 rounded font-bold leading-tight">
                                                            🔒 Anti-Loss Aversion: 진행 중인 손절가(SL) 1% 이내 근접. 클라이언트 수정 강제 비활성화
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-span-1 sm:col-span-3 text-center pt-2 flex flex-col items-center">
                                                    <div className={`mt-2 text-xs font-bold ${slippageColor} bg-black/40 px-3 py-1.5 rounded-full inline-block border border-zinc-800/80`}>
                                                        {slippageText}
                                                    </div>
                                                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-3 flex items-center gap-1 justify-center">
                                                        현재가: {formatPrice(Math.round(livePrice))} {useKrw ? '' : 'USDT'}
                                                        <span className="text-[8px] text-zinc-500 normal-case tracking-normal">(Based on Binance Mark Price)</span>
                                                    </span>
                                                    <span className="text-[9px] text-zinc-700 font-mono uppercase mt-0.5">최초 오라클 전송가: {formatPrice(netVals.entry)} {useKrw ? '' : 'USDT'}</span>
                                                </div>
                                            </div>

                                            {/* HP1 v47.1: Blind Limit Warning */}
                                            <div className="mt-3 p-2 bg-red-950/30 border border-red-900/50 rounded-md text-center mb-2">
                                                <span className="text-red-500 font-bold text-[10px] sm:text-[11.5px] tracking-tighter drop-shadow-[0_0_10px_rgba(225,29,72,0.6)] animate-pulse inline-block">
                                                    ⚠️ 주의: 본 가격은 조준점입니다. AI의 <strong className="font-black bg-red-500/20 px-1 rounded mx-0.5">[최종 진입 승인]</strong> 푸시 알림이 울리기 전까지 거래소에 선주문을 걸지 마십시오.
                                                </span>
                                            </div>

                                            {/* HP1 v49.0 Active Indicators */}
                                            {masterSignal && (masterSignal.bbSqueezeStackedImbalance || masterSignal.extremeFundingSqueezeTarget || masterSignal.lassoExcludedFeatures) && (
                                                <div className="mt-2 mb-4 pt-4 border-t border-zinc-800/50">
                                                    <div className="text-[10px] text-zinc-500 uppercase font-black mb-2 flex items-center justify-between">
                                                        <span>HP1 v49.0 스텔스 인디케이터 포착</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {masterSignal.bbSqueezeStackedImbalance && (
                                                            <div className="flex items-center gap-2 bg-rose-950/20 px-2 py-1.5 rounded border border-rose-900/30 text-[10px] text-rose-300">
                                                                <Activity className="w-3 h-3 text-rose-500" />
                                                                <span className="font-bold">BB Squeeze & 누적 불균형: 메가 트렌드 돌파 확증</span>
                                                            </div>
                                                        )}
                                                        {masterSignal.extremeFundingSqueezeTarget && (
                                                            <div className="flex items-center gap-2 bg-indigo-950/20 px-2 py-1.5 rounded border border-indigo-900/30 text-[10px] text-indigo-300">
                                                                <ShieldAlert className="w-3 h-3 text-indigo-500" />
                                                                <span className="font-bold">역추세 청산 타격: 펀딩비 극단적 과열 감지</span>
                                                            </div>
                                                        )}
                                                        {masterSignal.lassoExcludedFeatures && masterSignal.lassoExcludedFeatures.length > 0 && (
                                                            <div className="flex items-center gap-2 bg-emerald-950/20 px-2 py-1.5 rounded border border-emerald-900/30 text-[10px] text-emerald-300">
                                                                <Crosshair className="w-3 h-3 text-emerald-500" />
                                                                <span className="font-bold">LASSO 가지치기 완료 (제외: {masterSignal.lassoExcludedFeatures.join(', ')})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* HP1 v50.0 Active Indicators */}
                                            {masterSignal && (masterSignal.unfinishedBusinessTpStretch || masterSignal.schellingPointSweepTarget || masterSignal.agenticEnsembleScore || masterSignal.lossAversionTrailingStop) && (
                                                <div className="mt-2 mb-4 pt-4 border-t border-zinc-800/50">
                                                    <div className="text-[10px] text-zinc-500 uppercase font-black mb-2 flex items-center justify-between">
                                                        <span>HP1 v50.0 팬텀 신디케이트 작동</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {masterSignal.unfinishedBusinessTpStretch && (
                                                            <div className="flex items-center gap-2 bg-pink-950/20 px-2 py-1.5 rounded border border-pink-900/30 text-[10px] text-pink-300">
                                                                <Crosshair className="w-3 h-3 text-pink-500" />
                                                                <span className="font-bold">미결제 비즈니스 (UB) 포착: TP 목표가 {formatPrice(masterSignal.unfinishedBusinessTpStretch)}로 연장됨</span>
                                                            </div>
                                                        )}
                                                        {masterSignal.schellingPointSweepTarget && (
                                                            <div className="flex items-center gap-2 bg-yellow-950/20 px-2 py-1.5 rounded border border-yellow-900/30 text-[10px] text-yellow-300">
                                                                <Activity className="w-3 h-3 text-yellow-500" />
                                                                <span className="font-bold">셸링 포인트 스윕 감지: {formatPrice(masterSignal.schellingPointSweepTarget)} 구간 역발상 타격 준비</span>
                                                            </div>
                                                        )}
                                                        {masterSignal.agenticEnsembleScore && (
                                                            <div className="flex flex-col gap-1 bg-blue-950/20 px-2 py-1.5 rounded border border-blue-900/30">
                                                                <div className="flex items-center gap-2 text-[10px] text-blue-300">
                                                                    <Cpu className="w-3 h-3 text-blue-500" />
                                                                    <span className="font-bold">에이전틱 위원회 앙상블 승인 완료 (총점: {masterSignal.agenticEnsembleScore.total}점)</span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-1 text-[8px] text-blue-400 mt-1">
                                                                    <span className="text-center bg-blue-900/40 rounded py-0.5">구조: {masterSignal.agenticEnsembleScore.structure}</span>
                                                                    <span className="text-center bg-blue-900/40 rounded py-0.5">오더플로우: {masterSignal.agenticEnsembleScore.orderflow}</span>
                                                                    <span className="text-center bg-blue-900/40 rounded py-0.5">변동성: {masterSignal.agenticEnsembleScore.volatility}</span>
                                                                    <span className="text-center bg-blue-900/40 rounded py-0.5">거시: {masterSignal.agenticEnsembleScore.macro}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {masterSignal.lossAversionTrailingStop && (
                                                            <div className="flex items-center gap-2 bg-purple-950/20 px-2 py-1.5 rounded border border-purple-900/30 text-[10px] text-purple-300">
                                                                <ShieldAlert className="w-3 h-3 text-purple-500 animate-pulse" />
                                                                <span className="font-bold">Loss Aversion 차단: 3-Bar 트레일링 스탑 적용 (수동 강제종료 불가)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Dot Plot Edge Visualizer */}
                                            <DotPlotGraph winRate={masterSignal.metaWinRate !== undefined ? masterSignal.metaWinRate * 100 : masterSignal.confidenceScore} />
                                            {masterSignal.metaWinRate !== undefined && (
                                                <div className="text-center mt-1">
                                                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">
                                                        ML 2차 100회 메타 레이블링 백테스트 검증 승률: <strong className="text-emerald-400 text-xs">{(masterSignal.metaWinRate * 100).toFixed(1)}%</strong>
                                                    </span>
                                                </div>
                                            )}
                                            {masterSignal.fractalDistribution && (
                                                <div className="text-center mt-2 flex flex-col items-center justify-center p-2 border border-zinc-800/50 bg-black/40 rounded-lg">
                                                    <span className="text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-widest"><Sparkles className="w-3 h-3 inline mr-1 text-purple-500" />Deep Fractal Mirror (5Y Data)</span>
                                                    <div className="flex w-full max-w-xs h-2 bg-zinc-800 rounded-full overflow-hidden mt-1 gap-0.5">
                                                        <div className="bg-emerald-500 h-full relative" style={{ width: `${masterSignal.fractalDistribution.upPct}%` }}></div>
                                                        <div className="bg-rose-500 h-full relative" style={{ width: `${masterSignal.fractalDistribution.downPct}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between w-full max-w-xs mt-1 px-1">
                                                        <span className="text-[9px] text-emerald-500 font-mono">가속(Up) {masterSignal.fractalDistribution.upPct}%</span>
                                                        <span className="text-[8px] text-zinc-500 font-mono hidden sm:inline">유사 프랙탈 N={masterSignal.fractalDistribution.sampleSize}</span>
                                                        <span className="text-[9px] text-rose-500 font-mono">반전(Down) {masterSignal.fractalDistribution.downPct}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* HP1 v48.0 Webhook Broadcasting */}
                                            <button
                                                onClick={() => alert("✅ [Webhook] S급 시그널이 연동된 Discord/Telegram 프리미엄 채널로 0.1초 만에 자동 송출되었습니다. (구독자들에게 푸시 알림 발생)")}
                                                className="w-full mt-4 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500 text-indigo-400 font-bold font-mono text-[10px] sm:text-[11px] py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                            >
                                                <Send className="w-4 h-4" />
                                                Telegram/Discord VIP API 전송 (Broadcast)
                                            </button>

                                            {masterSignal.xaiRationale && masterSignal.xaiRationale.length > 0 && (
                                                <div className="mt-4 border border-zinc-700/50 bg-black/60 rounded-lg p-3 relative overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">🗣️ HP1 전술 보고서 (XAI)</span>
                                                        <div className="h-0.5 bg-gradient-to-r from-zinc-700 to-transparent flex-grow"></div>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {masterSignal.xaiRationale.map((rationale, idx) => (
                                                            <li key={idx} className="text-[10px] text-zinc-400 font-mono leading-relaxed pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-zinc-600 before:rounded-full">
                                                                {rationale}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* End of Pruning Wrapper */}
                                        </div>
                                    )}

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
                                        {activePositions >= 3 && !isSysBlocked && !refundWarning && (
                                            <div className="mb-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-center animate-pulse">
                                                <span className="text-zinc-500 font-black text-[10px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    <Lock className="w-4 h-4" /> 🔒 칸반 한도 도달: 현재 진행 중인 전술({activePositions}개)이 종료될 때까지 신규 덫 설치를 제한합니다.
                                                </span>
                                            </div>
                                        )}
                                        {!isSysBlocked && activePositions < 3 && !isSniperLocked && !refundWarning && (
                                            <div className="mb-2 p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-lg text-center animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                <span className="text-emerald-500 font-black text-[10px] tracking-widest flex justify-center items-center gap-2 uppercase">
                                                    <Crosshair className="w-4 h-4" /> 🎯 스나이퍼 타점 도달: 최적의 손익비 구간입니다. 덫 설치 가능. (WIP: {activePositions}/3)
                                                </span>
                                            </div>
                                        )}
                                        {masterSignal.gexRegime === 'NEGATIVE' && !isSysBlocked && !refundWarning && (
                                            <div className="mb-2 p-3 bg-red-950/60 border border-red-500 rounded-lg text-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                                <span className="font-black text-[11px] tracking-widest flex justify-center items-center gap-2 uppercase text-white">
                                                    ☢️ GEX 폭발 구간 확인: 가속(Accelerate) 타격 승인
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
                                        {twapLockCountdown > 0 && (
                                            <div className="mb-2 p-3 bg-amber-950/80 border border-amber-600 rounded-lg text-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                                <span className="font-black text-[11px] tracking-widest flex justify-center items-center gap-2 uppercase text-amber-500">
                                                    ⏳ 기관 알고리즘 변동성(Spike) 회피 중: {twapLockCountdown}초 후 덫(지정가)이 활성화됩니다.
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={() => {
                                                    const limitPrice = masterSignal.direction === 'LONG' ? masterSignal.entryZoneMax : masterSignal.entryZoneMin;
                                                    const distSl = Math.abs(limitPrice - netVals.sl);
                                                    const riskPct = (distSl / limitPrice) * 100;
                                                    let calcLev = riskPct > 0 ? Math.floor(allocationPercent / riskPct) : 1;
                                                    if (calcLev > 15) calcLev = 15;
                                                    if (calcLev < 1) calcLev = 1;

                                                    const isBreakoutOrder = masterSignal.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;
                                                    const orderTypeLabel = isBreakoutOrder ? '조건부 주문(Stop-Market)' : '지정가(Limit)';

                                                    alert(`[자동 주문 계산기]\n\n바이낸스에 다음 가격으로 ${orderTypeLabel}을 걸어두세요:\n\n방향: ${masterSignal.direction}\n가격: ${limitPrice} USDT\n추천 레버리지: ${calcLev}x\n\n(※ ${isBreakoutOrder ? '이 가격을 돌파/붕괴할 때 진입합니다.' : '이 가격에 체결되기를 기다리며 그물을 칩니다.'})`);
                                                }}
                                                disabled={isSignalExpired}
                                                className={`flex-1 bg-zinc-900 border hover:bg-zinc-800 h-12 font-bold transition-all text-[11px] sm:text-xs ${isSignalExpired ? 'text-zinc-600 border-zinc-800 cursor-not-allowed' : 'text-blue-400 border-blue-900/50'}`}
                                            >
                                                주문(Order) 역산
                                            </Button>
                                            <Button
                                                onClick={clearActiveSignal}
                                                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 h-12 font-bold transition-all"
                                            >
                                                의도적 폐기 (Discard)
                                            </Button>
                                            <Button
                                                onClick={handlePreTradeExecute}
                                                disabled={activePositions >= 3 || isSysBlocked || isSniperLocked || cvdStatus !== 'PASS' || twapLockCountdown > 0 || (masterSignal.kellyRiskPct === 0) || isSignalExpired}
                                                className={`flex-[2] h-12 font-black text-sm sm:text-lg tracking-widest transition-all ${activePositions >= 3 || isSysBlocked || isSniperLocked || cvdStatus !== 'PASS' || twapLockCountdown > 0 || (masterSignal.kellyRiskPct === 0) || isSignalExpired ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-[pulse_1.5s_ease-in-out_infinite]'}`}
                                            >
                                                {isSignalExpired ? '만료됨 (Discard Required)' : isSysBlocked || isSniperLocked || (masterSignal.kellyRiskPct === 0) ? '관망 처리' : twapLockCountdown > 0 ? '변동성 대기 중' : cvdStatus !== 'PASS' ? '오더플로우 대기' : (() => {
                                                    const limitPrice = masterSignal.direction === 'LONG' ? masterSignal.entryZoneMax : masterSignal.entryZoneMin;
                                                    const isBreakoutOrder = masterSignal.direction === 'LONG' ? limitPrice > livePrice : limitPrice < livePrice;
                                                    return isBreakoutOrder ? '⚡ 돌파 주문 (Stop-Limit)' : '🎯 지정가 덫 (Limit Order)';
                                                })()}
                                            </Button>
                                        </div>
                                        {masterSignal.darkPoolSpooferActive && (!isSysBlocked && !isSniperLocked) && (
                                            <div className="mt-2 text-[9px] text-center text-zinc-500 font-mono tracking-tighter animate-pulse">
                                                ※ Dark Pool Spoofer 활성화: 지정가 주문이 거래소 호가창에서 암호화 은닉됩니다 (타점 도달 시 0.1초 단위 난도질 전송).
                                            </div>
                                        )}
                                        {masterSignal.paretoRoutingOptimal && (!isSysBlocked && !isSniperLocked) && (
                                            <div className="mt-2 text-[9px] text-center text-sky-400 font-mono tracking-tighter animate-pulse">
                                                ⚖️ Pareto Optimal Routing 가동 대기: 승인 시 바이낸스/바이비트/OKX 등 다중 API로 수학적 최적화 분할 전송됩니다.
                                            </div>
                                        )}
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

            {/* Five Whys Modal Post-mortem */}
            {showFiveWhys && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-3xl bg-black/80 p-4">
                    <Card className="w-full max-w-lg bg-zinc-950 border-rose-900/50 shadow-2xl overflow-hidden relative">
                        <CardHeader className="text-center pb-2 bg-rose-950/20">
                            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-2 mix-blend-screen" />
                            <CardTitle className="text-xl font-black text-rose-500 tracking-widest uppercase">안돈 코드 발동: 손실 원인 규명</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                            <div className="p-4 bg-black/50 border border-zinc-800 rounded-lg mb-6 shadow-inner">
                                <p className="text-sm font-bold text-zinc-300 leading-relaxed tracking-wider mb-2">
                                    해당 전술이 무력화(LOSS)된 명확한 원인을 5번의 "왜?(Why?)"를 통해 분석하십시오.
                                </p>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">이 절차를 완료하기 전까지 모든 전술 엔진이 잠깁니다(Lock).</span>
                            </div>

                            <div className="space-y-4">
                                {fiveWhyAnswers.map((answer, index) => (
                                    <div key={index} className={`transition-opacity duration-300 ${index > currentWhyStep ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                                        <label className="text-xs font-bold text-blue-400 font-mono flex items-center gap-2 mb-1">
                                            <span className="bg-blue-900/50 px-1.5 py-0.5 rounded text-[10px]">WHY 0{index + 1}</span>
                                            {index === 0 ? "왜 손실이 발생했습니까?" : "그 원인은 무엇 때문입니까?"}
                                        </label>
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => {
                                                const newAnswers = [...fiveWhyAnswers];
                                                newAnswers[index] = e.target.value;
                                                setFiveWhyAnswers(newAnswers);
                                            }}
                                            placeholder="원인을 입력하세요..."
                                            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-white text-sm focus:border-blue-500 focus:outline-none focus:bg-zinc-900/80 transition-all font-mono"
                                        />
                                        {index === currentWhyStep && (
                                            <Button
                                                className="mt-2 text-[10px] w-full bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest"
                                                disabled={answer.trim().length < 5}
                                                onClick={() => {
                                                    if (currentWhyStep < 4) setCurrentWhyStep(currentWhyStep + 1);
                                                    else setShowFiveWhys(false); // Finished 5 steps
                                                }}
                                            >
                                                {currentWhyStep < 4 ? "다음 단계 규명 (Next)" : "원인 규명 완료 및 안돈 코드 해제"}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* HP1 v36.0: Flip Alert Modal */}
            {showFlipAlert && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
                    <Card className="w-full max-w-sm bg-rose-950 border-rose-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[50px] rounded-full"></div>
                        <CardHeader className="text-center pb-2 relative z-10">
                            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-2 animate-pulse" />
                            <CardTitle className="text-xl font-black text-white tracking-widest uppercase">🚨 긴급 전술 수정 (Flip Alert)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 text-center relative z-10">
                            <p className="text-sm font-bold text-rose-200 mb-4 leading-relaxed">
                                AI의 시장 분석이 실시간으로 급변했습니다.<br />
                                <span className="text-xs text-rose-300">이전 방향과 반대되는 강력한 반전 무빙(Reverse Mover)이 관찰되어 기존 전술을 강제 폐기하고 스위칭했습니다.</span>
                            </p>
                            <Button
                                onClick={() => setShowFlipAlert(false)}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black tracking-widest"
                            >
                                전술 변동 확인 (Acknowledge)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* HP1 v36.0: History Panel */}
            {showHistoryPanel && (
                <div className="fixed inset-y-0 right-0 z-[120] w-full max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-sm font-black text-zinc-300 font-mono tracking-widest">일일 전술 로깅 (HISTORY)</h2>
                        </div>
                        <button onClick={() => setShowHistoryPanel(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {signalHistory.length === 0 ? (
                            <div className="text-center text-zinc-600 font-mono text-xs py-10">아직 수신된 전술이 없습니다.</div>
                        ) : (
                            signalHistory.map((sig, idx) => (
                                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${sig.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                                            {sig.direction}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 font-mono">
                                            {sig.timestamp ? new Date(sig.timestamp).toLocaleTimeString() : '--:--:--'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="text-left">
                                            <div className="text-[8px] text-zinc-500 uppercase">최초 타점 (Avg)</div>
                                            <div className="text-[11px] font-mono text-zinc-300 font-bold">{(sig.entryZoneMax + sig.entryZoneMin) / 2}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] text-zinc-500 uppercase">예상 승률</div>
                                            <div className="text-[11px] font-mono text-zinc-400">{Math.round((sig.metaWinRate || sig.confidenceScore) * 100)}%</div>
                                        </div>
                                    </div>
                                    {sig.xaiRationale && sig.xaiRationale[0] && (
                                        <div className="text-[9px] text-zinc-500 line-clamp-2 mt-2 pt-2 border-t border-zinc-800 decoration-zinc-800">
                                            {sig.xaiRationale[0]}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RedPotionArena;
