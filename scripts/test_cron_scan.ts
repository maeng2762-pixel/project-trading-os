import ccxt from 'ccxt';
import { AnalysisEngine } from '../src/lib/analysis';

async function main() {
    console.log(`[Test] 🔍 Scanning market...`);
    const exchange = new ccxt.binance({ enableRateLimit: true });
    const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
    
    for (const SYMBOL of SYMBOLS) {
        console.log(`\n============================`);
        console.log(`[Test] 📡 Scanning ${SYMBOL}...`);
        const limit = 300;
        const [ohlcv1h, ohlcv4h, ohlcv1d, ohlcv15m, ohlcv5m] = await Promise.all([
            exchange.fetchOHLCV(SYMBOL, '1h', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '4h', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '1d', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '15m', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '5m', undefined, limit)
        ]);

        const mapCandles = (raw: any[]) => raw.map(c => ({
            time: c[0] as number,
            open: c[1] as number,
            high: c[2] as number,
            low: c[3] as number,
            close: c[4] as number,
            volume: c[5] as number
        }));

        let extData: any = {};
        
        // Simulating the extData that TradingView webhook uses, but left empty to mimic the cron which sends {}
        const result = AnalysisEngine.analyze({
             '1h': mapCandles(ohlcv1h),
             '4h': mapCandles(ohlcv4h),
             '1d': mapCandles(ohlcv1d),
             '15m': mapCandles(ohlcv15m),
             '5m': mapCandles(ohlcv5m)
        }, extData);
        
        console.log(`[Result] ${SYMBOL} Grade: ${result.actionGrade}`);
        console.log(`[Reason] ${result.reasoning_plain}`);
        console.log(`[Direction] ${result.direction}`);
        
    }
}

main().catch(console.error);
