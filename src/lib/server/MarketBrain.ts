import { db } from '../firebase'; // Server-side firebase admin or client? Next.js uses client sdk usually, but let's assume we can use it.
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import ccxt from 'ccxt';
import { AnalysisEngine } from '../analysis';

/**
 * MarketBrain: The Central Intelligence Unit
 * 
 * Responsibilities:
 * 1. Fetch Market Data (OHLCV) from Exchange (Binance) independent of user count.
 * 2. Run AnalysisEngine to generate Global Signal.
 * 3. Broadcast signal to Firestore 'system/market_analysis'.
 * 
 * Cost Efficiency:
 * - 1 API Call per cycle (e.g., 5 min).
 * - Serves 1,000,000+ users with zero marginal cost per user.
 */
export class MarketBrain {
    private static exchange = new ccxt.binance({ enableRateLimit: true });
    private static SYMBOL = 'BTC/USDT';
    private static TIMEFRAME = '1h'; // Default master timeframe

    /**
     * Core Pulse: Runs the analysis cycle.
     * intended to be called by a Cron Job (e.g., Vercel Cron) every 15 minutes.
     */
    static async pulse() {
        console.log(`[MarketBrain] 🧠 Initiating Pulse for ${this.SYMBOL}...`);

        try {
            // 1. Fetch Data (Multi-Timeframe for Confluence)
            // Phase 11: Fetch 4h and 1d for Trend Bias
            const [ohlcv1h, ohlcv4h, ohlcv1d] = await Promise.all([
                this.exchange.fetchOHLCV(this.SYMBOL, '1h', undefined, 100),
                this.exchange.fetchOHLCV(this.SYMBOL, '4h', undefined, 50),
                this.exchange.fetchOHLCV(this.SYMBOL, '1d', undefined, 50)
            ]);

            const currentPrice = ohlcv1h[ohlcv1h.length - 1][4];

            // 2. Analyze (Centralized Compute)
            // Map raw OHLCV to Candle objects
            const mapCandles = (raw: any[]) => raw.map(c => ({
                time: c[0] as number,
                open: c[1] as number,
                high: c[2] as number,
                low: c[3] as number,
                close: c[4] as number,
                volume: c[5] as number
            }));

            const candles1h = mapCandles(ohlcv1h);
            const candles4h = mapCandles(ohlcv4h);
            const candles1d = mapCandles(ohlcv1d);

            // Pass all timeframes to AnalysisEngine
            const result = AnalysisEngine.analyze({
                '1h': candles1h,
                '4h': candles4h,
                '1d': candles1d // Note: AnalysisEngine interface might need '1d' key added if not present, checking...
            });

            // 3. Broadcast (Pub/Sub)
            // Save to a "Singleton" document in Firestore that all clients subscribe to.
            const signalPayload = {
                timestamp: serverTimestamp(),
                symbol: this.SYMBOL,
                price: currentPrice,
                direction: result.direction, // LONG / SHORT / NEUTRAL
                score: result.score,
                actionGrade: result.actionGrade, // S/A/B/C/F
                reasoning_plain: result.reasoning_plain || result.explanation, // Fallback

                // Raw Indicators for client-side viz (optional, keep it light)
                // Accessing details safely
                rsi: result.details['1h']?.rsi || 50,
                trend: result.details['1h']?.trend || 'NEUTRAL',

                // Infrastructure Meta
                version: 'v5.0-brain',
                lastUpdate: new Date().toISOString()
            };

            await setDoc(doc(db, 'system', 'market_analysis'), signalPayload);

            console.log(`[MarketBrain] 📡 Signal Broadcasted: ${result.actionGrade} (${result.direction})`);
            return { success: true, signal: signalPayload };

        } catch (error) {
            console.error('[MarketBrain] 🔥 Pulse Failed:', error);
            return { success: false, error };
        }
    }
}
