import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult, AnalysisEngine } from '@/lib/analysis';
import { safeStorage } from '@/lib/safeStorage';

export interface Position {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    size: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
    sentinelScore?: number;
    pnl: number;
    highestPnL: number;
    lowestPnL: number;
    timestamp: number;
    auditResult?: 'NORMAL_WIN' | 'NORMAL_LOSS' | 'BAD_WIN' | 'GOOD_LOSS';
    emotion?: string;
    mistake?: boolean;
    entryReason?: string; // Added for trade journal
    originalAnalysis?: AnalysisResult; // Added for 'The Handler' invalidation logic
    isPyramidEligible?: boolean; // Phase 16: Aggressive R:R sizing
    pyramidAdded?: boolean; // Phase 16: Has pyramid been added?
}

export interface ResistedImpulse {
    id: string;
    timestamp: number;
    amountSaved: number;
}

export interface TradingState {
    balance: number;
    dailyStartBalance: number;
    dailyPnl: number;
    positions: Position[];
    isLocked: boolean;
    lockReason: 'STOP_LOSS_LIMIT' | 'MANUAL' | 'CONSECUTIVE_LOSS' | 'DAILY_LOSS_LIMIT' | 'RULE_VIOLATION' | 'TILT_DETECTED' | null;
    lockEndTime: number | null;

    // Phase 12: Dual Engine & Gamification (v7.0) -> Replaced by Phase 13 Potion Meta
    potionMode: 'BLUE' | 'RED';
    setPotionMode: (mode: 'BLUE' | 'RED') => void;
    survivalScore: number; // 0-100
    xp: number; // Experience Points
    level: number; // 1-99
    seasonId: string; // "2026-S02"
    tiltScore: number;
    disciplineScore: number;
    dailyStreak: number;
    consecutiveLosses: number; // New for Cooldown
    ruleViolations: number;
    maxAllowedLeverage: number;
    tradeHistory: any[];
    resistedImpulses: ResistedImpulse[];
    isReviewPending: boolean;
    pendingReviewTradeId: string | null;
    lastPledgeTime: number | null;

    // Auto-Journal Sync
    isSyncingHistory: boolean;
    fetchTradeHistory: () => Promise<void>;
    emotionTags: Record<string, string>;
    setEmotionTag: (tradeId: string, tag: string) => void;

    // Phase 15: Real API Integration
    liveBalance: number;
    apiConnected: boolean;
    setApiConnected: (status: boolean) => void;

    setBalance: (amount: number) => void;
    resetDaily: () => void;
    resetStore: () => void; // Clear state on logout
    pledge: () => void;
    openPosition: (position: Omit<Position, 'id' | 'pnl' | 'timestamp' | 'highestPnL' | 'lowestPnL'>) => void;
    updatePosition: (id: string, updates: Partial<Position>) => void; // Added for Handler (Ratchet)
    closePosition: (id: string, exitPrice: number) => { pnl: number, feedback: string, scoreChange: number } | null;
    submitReview: (tradeId: string, emotion: string, mistake: boolean) => void;
    recordImpulseResistance: (amount: number) => void;
    updatePnL: (currentPrice: number) => void;
    checkRisk: () => void;
    unlock: () => void;
    loadFromCloud: (data: Partial<TradingState>) => void;
    isSleepMode: boolean; // New: Sleep Mode
    toggleSleepMode: () => void; // New: Toggle Sleep Mode

    // v7.0 Actions

    addXp: (amount: number) => void;
    updateSurvivalScore: (change: number) => void;
    registerTradeResult: (pnlPercent: number) => void;

    isAdmin: boolean;
    tier: 'FREE' | 'PRO'; // Updated SaaS Tiers
    setAdmin: (isAdmin: boolean) => void;
    setTier: (tier: 'FREE' | 'PRO') => void; // Allow upgrading tier

    syncStatus: string; // New: Debug Sync Status
    setSyncStatus: (status: string) => void;
}

export const useTradingStore = create<TradingState>()(
    persist(
        (set, get) => ({
            balance: 0,
            dailyStartBalance: 0,
            dailyPnl: 0,
            positions: [],
            apiConnected: false,
            liveBalance: 0,
            isLocked: false,
            lockReason: null,
            lockEndTime: null,

            // Phase 12 / 13
            potionMode: 'BLUE',
            setPotionMode: (mode) => set({ potionMode: mode }),
            survivalScore: 100,
            xp: 0,
            level: 1,
            seasonId: '2026-S02',
            tiltScore: 100,
            disciplineScore: 100,
            dailyStreak: 0,
            consecutiveLosses: 0, // Initialize
            ruleViolations: 0,
            maxAllowedLeverage: 125,
            tradeHistory: [],
            resistedImpulses: [],
            isReviewPending: false,
            pendingReviewTradeId: null,
            lastPledgeTime: null,
            isSleepMode: false,
            isAdmin: false,
            tier: 'PRO',
            syncStatus: 'Initializing...',
            isSyncingHistory: false,
            emotionTags: {},

            fetchTradeHistory: async () => {
                set({ isSyncingHistory: true });
                try {
                    // Use standard fetch if auth is handled via cookies or get token
                    const { useAuthStore } = await import('@/store/useAuthStore');
                    const { user } = useAuthStore.getState();
                    if (!user) throw new Error("Not logged in");

                    const token = await user.getIdToken();
                    const res = await fetch('/api/binance/history', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();

                    if (data.success && data.history) {
                        set({ tradeHistory: data.history });
                    }
                } catch (error) {
                    console.error("Failed to fetch history:", error);
                } finally {
                    set({ isSyncingHistory: false });
                }
            },

            setSyncStatus: (status) => set({ syncStatus: status }),

            setEmotionTag: (tradeId, tag) => set((state) => ({
                emotionTags: { ...state.emotionTags, [tradeId]: tag }
            })),

            setAdmin: (isAdmin) => set({ isAdmin }),
            setTier: (tier) => set({ tier }), // Added missing implementation

            setApiConnected: (status) => set({ apiConnected: status }),

            setBalance: (amount) => set({ balance: amount, liveBalance: amount }),

            // v7.0 Actions -> Phase 13 Potion Meta

            addXp: (amount) => set((state) => {
                const newXp = state.xp + amount;
                const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
                return { xp: newXp, level: newLevel };
            }),

            updateSurvivalScore: (change) => set((state) => ({
                survivalScore: Math.max(0, Math.min(100, state.survivalScore + change))
            })),

            registerTradeResult: (pnlPercent) => set((state) => {
                let newConsecutiveLosses = state.consecutiveLosses;
                let isLocked = state.isLocked;
                let lockReason = state.lockReason;
                let lockEndTime = state.lockEndTime;

                if (pnlPercent < 0) {
                    newConsecutiveLosses += 1;
                    if (state.potionMode === 'BLUE' && newConsecutiveLosses >= 3) {
                        isLocked = true;
                        lockReason = 'CONSECUTIVE_LOSS';
                        lockEndTime = Date.now() + 24 * 60 * 60 * 1000;
                    }
                } else {
                    newConsecutiveLosses = 0;
                }
                return { consecutiveLosses: newConsecutiveLosses, isLocked, lockReason, lockEndTime };
            }),

            resetDaily: () => {
                const { balance, dailyPnl, dailyStartBalance } = get();
                const lossPercent = (dailyPnl / dailyStartBalance) * 100;
                const survived = lossPercent > -3;

                set((state) => ({
                    dailyStartBalance: balance,
                    dailyPnl: 0,
                    isLocked: false,
                    lockReason: null,
                    dailyStreak: survived ? state.dailyStreak + 1 : 0,
                    consecutiveLosses: 0, // Reset daily? Or keep rolling? Usually restart daily.
                    ruleViolations: 0,
                    maxAllowedLeverage: 125,
                }));
            },

            resetStore: () => {
                const currentLiveBalance = get().liveBalance;
                set({
                    balance: currentLiveBalance || 0,
                    dailyStartBalance: currentLiveBalance || 0,
                    dailyPnl: 0,
                    positions: [],
                    isLocked: false,
                    lockReason: null,
                    lockEndTime: null,

                    potionMode: 'BLUE',
                    survivalScore: 100,
                    xp: 0,
                    level: 1,
                    seasonId: '2026-S02',
                    tiltScore: 100,
                    disciplineScore: 100,
                    dailyStreak: 0,
                    consecutiveLosses: 0,
                    tradeHistory: [],
                    resistedImpulses: [],
                    isReviewPending: false,
                    pendingReviewTradeId: null,
                    lastPledgeTime: null,
                    isSleepMode: false,
                    tier: 'FREE',
                });
            },

            pledge: () => {
                const { lastPledgeTime, disciplineScore } = get();
                const now = Date.now();
                if (lastPledgeTime && (now - lastPledgeTime) < (18 * 60 * 60 * 1000)) {
                    return;
                }
                set({
                    lastPledgeTime: now,
                    disciplineScore: Math.min(100, disciplineScore + 5)
                });
            },

            openPosition: (pos) => {
                const { isLocked, isReviewPending, positions, isAdmin } = get();
                if (isLocked && !isAdmin) return;
                if (isReviewPending) {
                    alert("Please complete your Post-Mortem review first!");
                    return;
                }
                const newPosition: Position = {
                    ...pos,
                    sentinelScore: pos.sentinelScore || 50,
                    id: Math.random().toString(36).substr(2, 9),
                    pnl: 0,
                    highestPnL: 0,
                    lowestPnL: 0,
                    timestamp: Date.now(),
                };
                const updatedPositions = [...positions, newPosition];
                set({ positions: updatedPositions });
            },

            updatePosition: (id, updates) => {
                set((state) => {
                    const updatedPositions = state.positions.map((p) => p.id === id ? { ...p, ...updates } : p);
                    return { positions: updatedPositions };
                });
            },

            closePosition: (id, exitPrice) => {
                const { positions, balance, dailyPnl, dailyStartBalance, consecutiveLosses, tradeHistory } = get();
                const pos = positions.find((p) => p.id === id);
                if (!pos) return null;

                const direction = pos.type === 'LONG' ? 1 : -1;
                const priceDiff = exitPrice - pos.entryPrice;
                const realizedPnl = (priceDiff / pos.entryPrice) * pos.size * pos.leverage * direction;

                const newBalance = balance + realizedPnl;
                const updatedDailyPnl = dailyPnl + realizedPnl;
                const dailyLossPercent = (updatedDailyPnl / dailyStartBalance) * 100;

                // Cooldown Logic
                let newConsecutiveLosses = consecutiveLosses;
                let lockState = { isLocked: false, lockReason: null as TradingState['lockReason'], lockEndTime: null as number | null };

                // v3.0 Circuit Breaker: Leverage Cap
                let newMaxAllowedLeverage = 125;

                if (realizedPnl < 0) {
                    newConsecutiveLosses += 1;
                } else {
                    newConsecutiveLosses = 0;
                }

                // If 2+ consecutive losses, cap leverage at 2x
                if (newConsecutiveLosses >= 2) {
                    newMaxAllowedLeverage = 2;
                }

                if (dailyLossPercent <= -3) {
                    lockState = { isLocked: true, lockReason: 'DAILY_LOSS_LIMIT', lockEndTime: Date.now() + 24 * 60 * 60 * 1000 };
                }
                // Note: Removed the "3 losses = 1h ban" rule in favor of Leverage Cap?
                // User said "IF 2 losses -> Max Lev 2x".
                // User also said "IF 3 Rule Violations -> 24h Ban".
                // I will keep the 3 losses = 1h ban as an extra safety from v2.0, or replace it?
                // Replacing it with Leverage Cap as per v3.0 request seems more aligned with "Constraint" rather than "Stop".
                // But let's keep the soft ban for 3 losses if desired. The prompt says "IF 2 losses -> 2x".
                // Nothing about banning on losses, only banning on Rule Violations.
                // So I will REMOVE the old 3 losses ban to follow v3.0 spec strictly.

                if (lockState.isLocked) {
                    set(lockState);
                }

                const closedPos: Position = { ...pos, pnl: realizedPnl, timestamp: Date.now() };

                set((state) => ({
                    positions: state.positions.filter((p) => p.id !== id),
                    tradeHistory: [closedPos, ...state.tradeHistory],
                    balance: newBalance,
                    dailyPnl: updatedDailyPnl,
                    consecutiveLosses: newConsecutiveLosses,
                    maxAllowedLeverage: newMaxAllowedLeverage,
                    isReviewPending: true,
                    pendingReviewTradeId: id,
                }));



                return { pnl: realizedPnl, feedback: "Review Required", scoreChange: 0 };
            },

            submitReview: (tradeId, emotion, mistake) => {
                set((state) => {
                    const history = [...state.tradeHistory];
                    const tradeIndex = history.findIndex(t => t.id === tradeId);
                    if (tradeIndex === -1) return state;

                    const trade = history[tradeIndex];
                    let scoreChange = 0;
                    let auditResult: Position['auditResult'] = trade.pnl >= 0 ? 'NORMAL_WIN' : 'NORMAL_LOSS';
                    const sentinelScore = trade.sentinelScore || 50;

                    if (trade.pnl > 0) {
                        if (mistake || sentinelScore < 40) {
                            auditResult = 'BAD_WIN';
                            scoreChange = -10;
                        } else {
                            scoreChange = +2;
                        }
                    } else {
                        const expectedLoss = trade.stopLoss ? Math.abs((trade.entryPrice - trade.stopLoss) * trade.size / trade.entryPrice) : 0;
                        const actualLoss = Math.abs(trade.pnl);

                        if (!mistake && (trade.stopLoss && actualLoss <= expectedLoss * 1.1)) {
                            auditResult = 'GOOD_LOSS';
                            scoreChange = +5;
                        } else if (mistake) {
                            scoreChange = -5;
                        } else {
                            scoreChange = -2;
                        }
                    }

                    history[tradeIndex] = { ...trade, emotion, mistake, auditResult };

                    // v3.0 Rule Violation Counter
                    let newRuleViolations = state.ruleViolations;
                    let lockState = { isLocked: state.isLocked, lockReason: state.lockReason, lockEndTime: state.lockEndTime };

                    if (mistake) {
                        newRuleViolations += 1;
                        if (newRuleViolations >= 3) {
                            lockState = {
                                isLocked: true,
                                lockReason: 'RULE_VIOLATION',
                                lockEndTime: Date.now() + 24 * 60 * 60 * 1000
                            };
                        }
                    }

                    return {
                        tradeHistory: history,
                        disciplineScore: Math.min(100, Math.max(0, state.disciplineScore + scoreChange)),
                        isReviewPending: false,
                        pendingReviewTradeId: null,
                        ruleViolations: newRuleViolations,
                        ...lockState
                    };
                });
            },



            recordImpulseResistance: (amount) => {
                const newRecord: ResistedImpulse = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    amountSaved: amount
                };
                set((state) => ({
                    resistedImpulses: [newRecord, ...state.resistedImpulses],
                    disciplineScore: Math.min(100, state.disciplineScore + 3) // +3 Points for resisting
                }));
            },

            updatePnL: (currentPrice) => {
                const { positions } = get();
                const updatedPositions = positions.map(pos => {
                    const direction = pos.type === 'LONG' ? 1 : -1;
                    const priceDiff = currentPrice - pos.entryPrice;
                    const unrealizedPnl = (priceDiff / pos.entryPrice) * pos.size * pos.leverage * direction;
                    return {
                        ...pos,
                        pnl: unrealizedPnl,
                        highestPnL: Math.max(pos.highestPnL || -Infinity, unrealizedPnl),
                        lowestPnL: Math.min(pos.lowestPnL || Infinity, unrealizedPnl)
                    };
                });
                set({ positions: updatedPositions });

                // Cloud Sync (Optional? PnL updates are frequent, maybe debounce? Or skip partial updates and rely on local calc?)
                // Actually, if we want mobile to see PnL updates, we should sync. But PnL is derived from Price.
                // We sync positions. The other device will calculate PnL based on its own price feed or we sync PnL.
                // Syncing PnL constantly is expensive (writes per second).
                // Better approach: Sync only Entry/Exit/Structure. PnL is calculated on client.
                // So we do NOT sync here.
            },

            checkRisk: () => {
                const { dailyPnl, dailyStartBalance, tiltScore, positions } = get();
                const lossPercent = (dailyPnl / dailyStartBalance) * 100;

                // 1. Daily Loss Limit
                if (lossPercent <= -3) {
                    set({ isLocked: true, lockReason: 'DAILY_LOSS_LIMIT', lockEndTime: Date.now() + 24 * 60 * 60 * 1000 });
                }

                // 2. Tilt Detection
                if (tiltScore < 40) {
                    set({ isLocked: true, lockReason: 'TILT_DETECTED', lockEndTime: Date.now() + 1 * 60 * 60 * 1000 });
                }

                // 3. Stop Loss Delay Alert (The Shield)
                // Check if any position is violating SL by > 1%
                positions.forEach(pos => {
                    if (pos.stopLoss) {
                        const direction = pos.type === 'LONG' ? 1 : -1;
                        const currentPnLPercent = (pos.pnl / (pos.size * pos.leverage)) * 100; // Approx logic, simplified for currentPrice access check
                        // Actually we usually calculate based on price.
                        // Since checkRisk is usually called after updatePnL, pos.pnl is up to date.

                        // Better check: Access current price?
                        // Store doesn't hold current price easily unless passed.
                        // But updatePnL updates PnL. Let's infer breach from PnL vs Expected SL PnL.

                        const entryTotal = pos.size * pos.leverage;

                        // SL Price Diff Pct
                        const slDiffPct = Math.abs((pos.entryPrice - pos.stopLoss) / pos.entryPrice);

                        // Current PnL Pct (Unrealized)
                        const currentLossPct = - (pos.pnl / entryTotal); // Positive if loss

                        // If Current Loss > (SL Loss + 1%)
                        if (pos.pnl < 0 && currentLossPct > (slDiffPct + 0.01)) {
                            // Trigger Alert!
                            // For MVP, since we don't have a toast system linked to store easily,
                            // we might set a flag or relying on UI to read this.
                            // Let's set a 'danger' flag on the position or global warning?
                            // Let's just alert for now or set a temporary state if possible.
                            console.warn(`⚠️ STOP LOSS DELAYED! Position ${pos.symbol} is beyond SL by 1%!`);
                            // In a real app, we'd dispatch a toast or modal state here.
                        }
                    }
                });
            },



            unlock: () => set({ isLocked: false, lockReason: null, lockEndTime: null }),
            loadFromCloud: (data) => set((state) => ({ ...state, ...data })),

            // [New v5.0] Zero Marginal Cost: Load Global Signal
            // Call this when Firestore listener receives a new 'system/market_analysis' update.
            loadGlobalSignal: (signal: AnalysisResult, currentPrice: number) => {
                const { balance, potionMode } = get();
                // Client-side CPU Calculation
                const risk = AnalysisEngine.calculatePersonalRisk(signal, balance, currentPrice, potionMode);

                // Store/Update Global Context for UI to read
                return risk;
            },

            toggleSleepMode: () => set((state) => ({ isSleepMode: !state.isSleepMode })),
        }),
        {
            name: 'trading-storage',
            partialize: (state) => ({
                balance: state.balance,
                positions: state.positions,
                tradeHistory: state.tradeHistory,
                // Persist v7.0 State
                potionMode: state.potionMode,
                survivalScore: state.survivalScore,
                xp: state.xp,
                level: state.level,
                consecutiveLosses: state.consecutiveLosses,
                seasonId: state.seasonId
            }),
            storage: safeStorage,
        }
    )
);
