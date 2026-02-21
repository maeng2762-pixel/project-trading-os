import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTradingStore } from '@/store/useTradingStore';
import { UserService } from '@/services/userService';
import { Unsubscribe } from 'firebase/firestore';

export function useCloudSync() {
    const { user } = useAuthStore();
    const {
        loadFromCloud,
        positions,
        tradeHistory,
        disciplineScore,
        tier,
        dailyPnl,
        balance,
        dailyStartBalance,
        resistedImpulses,
        dailyStreak,
        consecutiveLosses,
        lastPledgeTime,
        isLocked,
        lockReason,
        lockEndTime,
        setSyncStatus // New
    } = useTradingStore();

    const isHydrated = useRef(false);

    const [retryCount, setRetryCount] = useState(0);

    // 1. Read / Subscription (Cloud -> Local)
    useEffect(() => {
        let unsub: Unsubscribe | null = null;
        let watchdogTimer: NodeJS.Timeout;

        isHydrated.current = false; // Reset on user change

        if (user) {
            if (!navigator.onLine) {
                setSyncStatus("⚠️ Offline (Check Network)");
                return;
            }

            setSyncStatus(`🔌 Connecting to Stream... (Attempt ${retryCount + 1})`);

            // Watchdog: If still connecting after 7s, trigger retry
            watchdogTimer = setTimeout(() => {
                if (!isHydrated.current) {
                    console.warn("⚠️ Connection timed out. Retrying...");
                    setSyncStatus("⚠️ Timeout. Retrying...");
                    setRetryCount(prev => prev + 1);
                }
            }, 7000);

            try {
                unsub = UserService.subscribeToUserData(user.uid, (data) => {
                    clearTimeout(watchdogTimer); // Data received, cancel watchdog
                    if (data) {
                        setSyncStatus(`📥 Data Received at ${new Date().toLocaleTimeString()}`);
                        loadFromCloud(data);
                        isHydrated.current = true;
                    } else {
                        setSyncStatus("⚠️ New Account / Init Cloud...");
                        console.warn("⚠️ Cloud data missing. Initializing...");
                        isHydrated.current = true;
                    }
                });
            } catch (err) {
                console.error("🔥 Firebase Subscription Error:", err);
                setSyncStatus("🔥 Connection Error");
            }
        }

        return () => {
            if (unsub) unsub();
            clearTimeout(watchdogTimer);
        };
    }, [user, loadFromCloud, retryCount]); // Add retryCount dependency

    // 2. Write (Local -> Cloud)
    // We custom-serialize the state to avoid re-triggering save on PnL changes (which happen constantly).
    // If we included 'positions' directly, every price tick would reset the debounce timer, preventing save.
    const stateToSave = {
        positions: positions.map(p => ({
            id: p.id,
            symbol: p.symbol,
            type: p.type,
            entryPrice: p.entryPrice,
            size: p.size,
            leverage: p.leverage,
            stopLoss: p.stopLoss,
            takeProfit: p.takeProfit,
            timestamp: p.timestamp,
            entryReason: p.entryReason,
            originalAnalysis: p.originalAnalysis,
            auditResult: p.auditResult,
            emotion: p.emotion,
            mistake: p.mistake,
            sentinelScore: p.sentinelScore
            // EXCLUDE: pnl, highestPnL, lowestPnL
        })),
        tradeHistory,
        disciplineScore,
        tier,
        balance, // balance changes on close, so it's fine
        dailyStartBalance,
        resistedImpulses,
        dailyStreak,
        consecutiveLosses,
        lastPledgeTime,
        isLocked,
        lockReason,
        lockEndTime,
        // dailyPnl is derived, but we might want to save it for history. 
        // However, it changes constantly. Let's exclude it from dependency but SAVE it when we do save.
    };

    const stateString = JSON.stringify(stateToSave);

    useEffect(() => {
        if (!user) return;

        const saveToCloud = async () => {
            // CRITICAL: Only save if we have loaded data from cloud at least once.
            if (!isHydrated.current) {
                console.log("⏳ Waiting for Cloud Hydration before saving...");
                return;
            }

            setSyncStatus("☁️ Saving...");
            // We fetch the LATEST state here, including the PnL that we ignored in dependencies.
            // This is fine. We just didn't want the PnL *change* to trigger the timer reset.
            const currentState = useTradingStore.getState();

            try {
                await UserService.saveUserData(user.uid, {
                    positions: currentState.positions,
                    tradeHistory: currentState.tradeHistory,
                    disciplineScore: currentState.disciplineScore,
                    tier: currentState.tier,
                    dailyPnl: currentState.dailyPnl,
                    balance: currentState.balance,
                    dailyStartBalance: currentState.dailyStartBalance,
                    resistedImpulses: currentState.resistedImpulses,
                    dailyStreak: currentState.dailyStreak,
                    consecutiveLosses: currentState.consecutiveLosses,
                    lastPledgeTime: currentState.lastPledgeTime,
                    isLocked: currentState.isLocked,
                    lockReason: currentState.lockReason,
                    lockEndTime: currentState.lockEndTime,
                });
                setSyncStatus(`✅ Saved at ${new Date().toLocaleTimeString()}`);
            } catch (e) {
                console.error("Save Failed:", e);
                setSyncStatus(`🔥 Save Failed: ${e instanceof Error ? e.message : 'Unknown Error'}`);
            }
        };

        const timeoutId = setTimeout(saveToCloud, 2000); // Debounce 2s
        return () => clearTimeout(timeoutId);

    }, [stateString, user, isHydrated.current, setSyncStatus]); // Depend on serialized string
}
