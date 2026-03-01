import ccxt from 'ccxt';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * AutoPilot 2.0: Guarded Spot Accumulation Master (Capital Mode)
 * HP1 v22.0
 * 
 * Strict Isolation Rule:
 * - This worker ONLY runs for users with tier === 'PRO'.
 * - Focuses on long-only spot trading, dynamic cash-to-crypto ratio, and time-bound edges.
 */
export class AutoPilot {
    private static exchange = new ccxt.binance({
        enableRateLimit: true,
        // API Keys would be injected per user from a secure Vault
    });

    /**
     * The Guarded AutoPilot 2.0 Constraints Validation
     * @returns { success: boolean, reason?: string, data?: any }
     */
    static async verifyHardConstraints(userId: string, signal: any, userData: any) {
        // 1. Core Identity: Spot Only (LONG), Capital Mode
        if (userData.mode !== 'capital') {
            return { success: false, reason: 'mode_not_capital' };
        }
        if (signal.direction !== 'LONG') {
            return { success: false, reason: 'spot_only_allows_long' };
        }
        if (!['S', 'A'].includes(signal.grade)) {
            return { success: false, reason: 'grade_too_low' };
        }

        // 2. The Whale Tracker (LSTM Macro Filter) Check (Mocked state)
        // In real-time, this queries the ML model.
        const isWinter = userData.autoPilot?.isCryptoWinter ?? false;
        if (isWinter) {
            return { success: false, reason: 'crypto_winter_blocked' };
        }

        // 3. Frequency Cap: Max 1 spot accumulation per day
        const today = new Date().toISOString().split('T')[0];
        if (userData.autoPilot?.lastTradeDate === today) {
            return { success: false, reason: 'daily_accumulation_limit_reached' };
        }

        // 4. Circuit Breaker: 3 Consecutive Losses -> 24h Penalty
        const consecutiveLosses = userData.autoPilot?.consecutiveLosses || 0;
        const lockoutUntil = userData.autoPilot?.lockoutUntil || 0;
        const now = Date.now();

        if (now < lockoutUntil) {
            return { success: false, reason: 'circuit_breaker_active' };
        }

        if (consecutiveLosses >= 3) {
            // Trigger Lockout
            return { success: false, reason: 'initiating_circuit_breaker', data: { lockoutDuration: 24 * 60 * 60 * 1000 } };
        }

        // 5. System Vacation: 5% MDD Limit
        const mdd = userData.autoPilot?.currentMdd || 0;
        if (mdd >= 5.0) {
            return { success: false, reason: 'system_vacation_mdd_exceeded' };
        }

        return { success: true };
    }

    /**
     * Force Close Stale Positions (Time-Cap Circuit Breaker)
     * If spot position exists > 14 days sideways without target.
     */
    static async checkTimeCapCircuitBreaker(userId: string, activePositions: any[]) {
        const now = Date.now();
        const TIME_CAP_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

        for (const pos of activePositions) {
            const holdTime = now - pos.entryTimestamp;
            if (holdTime > TIME_CAP_MS) {
                console.warn(`[AutoPilot] ⏳ Time Cap Exceeded for user ${userId} on ${pos.symbol}. Liquidating to protect core cash.`);
                // Execution logic to sell at market
                return { action: 'LIQUIDATE_TIME_CAP', symbol: pos.symbol };
            }
        }
        return { action: 'NONE' };
    }

    /**
     * Execute a spot trade on behalf of a user.
     * @param userId The UID of the user.
     * @param signal The signal derived from Spot Accumulation Engine.
     */
    static async executeReferenceTrade(userId: string, signal: any) {
        console.log(`[AutoPilot] 🔒 Checking Spot Clearance for User ${userId}...`);

        try {
            // Verify Tier
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error('User not found');
            }

            const userData = userSnap.data();
            if (userData.tier !== 'PRO') {
                console.warn(`[AutoPilot] ⛔ Access Denied: User ${userId} is ${userData.tier}.`);
                return { success: false, reason: 'tier_low' };
            }

            // Time Cap Verification First
            // activePositions would normally be fetched from user state
            await this.checkTimeCapCircuitBreaker(userId, userData.activePositions || []);

            // Verify Constraints
            const constraintCheck = await this.verifyHardConstraints(userId, signal, userData);
            if (!constraintCheck.success) {
                console.log(`[AutoPilot] 🛡️ Execution Blocked: ${constraintCheck.reason}`);
                return constraintCheck;
            }

            // Execute Logic (Risk-Constrained Spot Kelly)
            console.log(`[AutoPilot] 🚀 Executing SPOT Accumulation for INNER_CIRCLE...`);

            const balance = userData.balance || 10000;
            const maxRiskPct = 0.03; // Max 3% risk
            const riskPerUnit = Math.abs(signal.entry - signal.stopLoss);
            const stopLossPct = riskPerUnit / signal.entry;

            // Spot Target Allocation (Mock Kelly)
            const targetCryptoRatio = Math.min((signal.recommendedKellyFraction || 0.25), maxRiskPct / stopLossPct);
            let spotAllocation = balance * targetCryptoRatio;

            // Fixed 1x Leverage rule
            if (spotAllocation > balance) {
                spotAllocation = balance;
            }

            const spotSize = spotAllocation / signal.entry;

            const order = {
                symbol: signal.symbol,
                side: 'buy', // Long Spot Only
                amount: spotSize, // Spot qty
                price: signal.entry,
                type: 'limit',
                leverage: 1, // Fixed 1x Leverage
                cashRatio: (100 - (targetCryptoRatio * 100)).toFixed(1) + "%"
            };

            console.log(`[AutoPilot] ✅ Spot Order Placed:`, order);

            // Mock update user state
            // await updateDoc(userRef, { 'autoPilot.lastTradeDate': new Date().toISOString().split('T')[0] });

            return { success: true, orderId: 'MOCK_SPOT_' + Date.now(), executionDetails: order };

        } catch (error: any) {
            console.error(`[AutoPilot] ❌ Execution Error: ${error.message}`);
            return { success: false, reason: 'execution_error', error: error.message };
        }
    }
}
