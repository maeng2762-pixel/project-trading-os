import ccxt from 'ccxt';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * AutoPilot: The "Inner Circle" Execution Unit
 * 
 * Strict Isolation Rule:
 * - This worker ONLY runs for users with tier === 'inner_circle'.
 * - It has its own infrastructure/queue separate from the public signal stream.
 */
export class AutoPilot {
    private static exchange = new ccxt.binance({
        enableRateLimit: true,
        // API Keys would be injected per user from a secure Vault (not stored in plain code)
    });

    /**
     * The 5 Hard Constraints Check
     * @returns { success: boolean, reason?: string, data?: any }
     */
    static async verifyHardConstraints(userId: string, signal: any, userData: any) {
        // 1. Quality Control: Capital Mode + Grade A/S ONLY
        if (userData.mode !== 'capital') {
            return { success: false, reason: 'mode_not_capital' };
        }
        if (!['S', 'A'].includes(signal.grade)) {
            return { success: false, reason: 'grade_too_low' };
        }

        // 2. Frequency Cap: Max 1 trade per day
        const today = new Date().toISOString().split('T')[0];
        if (userData.autoPilot?.lastTradeDate === today) {
            return { success: false, reason: 'daily_limit_reached' };
        }

        // 3. Circuit Breaker: 3 Consecutive Losses -> 24h Lockout
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

        // 4. System Vacation: 5% MDD -> Full System Halt
        const mdd = userData.autoPilot?.currentMdd || 0;
        if (mdd >= 5.0) {
            return { success: false, reason: 'system_vacation_mdd_exceeded' };
        }

        // 5. Risk Per Trade is handled during order sizing.
        return { success: true };
    }

    /**
     * Execute a trade on behalf of a user.
     * @param userId The UID of the user.
     * @param signal The signal derived from MarketBrain.
     */
    static async executeReferenceTrade(userId: string, signal: any) {
        console.log(`[AutoPilot] 🔒 Checking Clearance for User ${userId}...`);

        try {
            // Verify Tier
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error('User not found');
            }

            const userData = userSnap.data();
            if (userData.tier !== 'inner_circle') {
                console.warn(`[AutoPilot] ⛔ Access Denied: User ${userId} is ${userData.tier}.`);
                return { success: false, reason: 'tier_low' };
            }

            // Verify Constraints
            const constraintCheck = await this.verifyHardConstraints(userId, signal, userData);
            if (!constraintCheck.success) {
                console.log(`[AutoPilot] 🛡️ Execution Blocked: ${constraintCheck.reason}`);
                // TODO: Log to LiveLog DB collection
                return constraintCheck;
            }

            // Execute Logic (Isolated)
            console.log(`[AutoPilot] 🚀 Executing for INNER_CIRCLE Member...`);

            // 5. Risk Per Trade (Calculate size based on 1-2% risk)
            // Mock Calculation based on balance
            const balance = userData.balance || 10000;
            const riskAmount = balance * 0.01; // 1% Risk
            const simulatedSize = riskAmount * 10; // e.g., 10x leverage

            const order = {
                symbol: signal.symbol,
                side: signal.direction === 'LONG' ? 'buy' : 'sell',
                amount: simulatedSize,
                price: signal.price,
                type: 'limit',
                risk: '1%'
            };

            console.log(`[AutoPilot] ✅ Order Placed:`, order);

            // Update user record: lastTradeDate
            // await updateDoc(userRef, { 'autoPilot.lastTradeDate': new Date().toISOString().split('T')[0] })

            return { success: true, orderId: 'mock_order_123', orderDetails: order };

        } catch (error) {
            console.error('[AutoPilot] 🔥 Execution Failed:', error);
            return { success: false, error };
        }
    }
}
