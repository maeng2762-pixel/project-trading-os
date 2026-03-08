import ccxt from 'ccxt';
import { adminDb } from './firebaseAdmin';

/**
 * TradeEngine: Real-time Execution Engine for Binance Futures
 * Integrates with Red Potion v120 signals and user API keys.
 */
export class TradeEngine {
    /**
     * Executes a trade on Binance Futures based on a signal.
     * @param uid The user ID.
     * @param signal The signal object.
     */
    static async executeTrade(uid: string, signal: any) {
        console.log(`[TradeEngine] ⚔️ Initiating Live Execution for user ${uid}...`);

        try {
            // 1. Fetch Keys from Environment Variables (Vercel Style)
            const apiKey = process.env.BINANCE_API_KEY;
            const apiSecret = process.env.BINANCE_API_SECRET;

            if (!apiKey || !apiSecret) {
                throw new Error('Binance API keys not found in environment variables (BINANCE_API_KEY/SECRET).');
            }

            // 2. Initialize Exchange
            const exchange = new ccxt.binance({
                apiKey: apiKey,
                secret: apiSecret,
                options: { defaultType: 'future' }, // Important: Futures mode
                enableRateLimit: true
            });
            await exchange.loadMarkets(); // MUST load markets to use precision formatting

            // 3. Risk Calculation (Kelly-based)
            let balance = 1000; // Default fallback balance
            try {
                const exchangeBalance = await exchange.fetchBalance({ type: 'future' });
                if (exchangeBalance.free && (exchangeBalance.free as any)['USDT']) {
                    balance = (exchangeBalance.free as any)['USDT'];
                }
            } catch (e) {
                console.warn("[TradeEngine] Could not fetch real-time balance, using cached value.");
            }

            const symbol = 'BTC/USDT';
            const riskPct = signal.kellyRiskPct || 3.5;
            const entryPrice = signal.basePrice;
            const stopLossPrice = signal.basePrice * (1 + (signal.direction === 'LONG' ? -signal.baseStopLossPct/100 : signal.baseStopLossPct/100));
            
            const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
            let qty = (balance * (riskPct / 100)) / riskPerUnit;
            
            // --- [HP1 v120] MINIMUM NOTIONAL CHECK (Binance requirement >= 100 USDT) ---
            const minNotional = 110; // Extra safe buffer
            if (qty * entryPrice < minNotional) {
                qty = minNotional / entryPrice;
            }

            // Format to proper exchange precision
            let formattedQty = Number(exchange.amountToPrecision(symbol, qty));
            
            // If the formatting rounded it down below the 100 USDT limit, bump it by one BTC step increment
            if (formattedQty * entryPrice < 101) {
               console.log(`[TradeEngine] ⚠️ Precision truncation caused notional to drop below 100. Bumping qty up.`);
               formattedQty += 0.001; 
               formattedQty = Number(exchange.amountToPrecision(symbol, formattedQty));
            }
            qty = formattedQty;

            let leverage = Math.ceil((qty * entryPrice) / balance);
            // Safety cap for test accounts
            if (leverage > 20) leverage = 20;

            console.log(`[TradeEngine] Risk Profile: Qty=${qty}, Leverage=${leverage}x, Notional=${(qty * entryPrice).toFixed(2)} USDT`);

            // 4. Execution Logic (Mocked if in sandbox/dry-run, or real)
            const side = signal.direction === 'LONG' ? 'buy' : 'sell';

            // Set Leverage first
            try {
                if (process.env.DRY_RUN !== 'true') {
                    await exchange.setLeverage(leverage, symbol);
                } else {
                    console.log(`[TradeEngine] 🧪 DRY RUN: Skipping Leverage Set (${leverage}x)`);
                }
            } catch (e) {
                console.warn("[TradeEngine] Leverage set failed (might already be set):", e);
            }

            // Place Market Order (or Limit if preferred)
            console.log(`[TradeEngine] 🚀 Sending ${side.toUpperCase()} order for ${symbol}... (Qty: ${qty})`);
            
            if (process.env.DRY_RUN === 'true') {
                console.log(`[TradeEngine] 🛑 DRY RUN ACTIVE: Bypassing exchange.createOrder`);
                const mockOrderId = `MOCK_${Date.now()}`;
                const tpPrice = signal.basePrice * (1 + (signal.direction === 'LONG' ? signal.baseTargetPct/100 : -signal.baseTargetPct/100));
                
                return { success: true, orderId: mockOrderId, details: { qty, leverage, entryPrice, stopLossPrice, tpPrice }, isDryRun: true };
            }

            // In a real scenario, use:
            const order = await exchange.createOrder(symbol, 'market', side, qty);
            
            // 5. Set TP/SL
            // Binance Futures allows conditional orders
            const tpSide = side === 'buy' ? 'sell' : 'buy';
            const tpPrice = signal.basePrice * (1 + (signal.direction === 'LONG' ? signal.baseTargetPct/100 : -signal.baseTargetPct/100));
            
            await exchange.createOrder(symbol, 'limit', tpSide, qty, tpPrice, { reduceOnly: true });
            
            // SL is usually better as Stop Market
            await exchange.createOrder(symbol, 'stop_market', tpSide, qty, undefined, { 
                stopPrice: stopLossPrice, 
                reduceOnly: true 
            });

            console.log(`[TradeEngine] ✅ Execution Complete. Order ID: ${order.id}`);

            return { success: true, orderId: order.id, details: { qty, leverage, entryPrice, stopLossPrice, tpPrice } };

        } catch (error: any) {
            console.error(`[TradeEngine] ❌ Execution Failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}
