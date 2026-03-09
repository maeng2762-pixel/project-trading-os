import ccxt from 'ccxt';
import { AnalysisEngine } from '../src/lib/analysis';

async function run() {
    const exchange = new ccxt.binance({ enableRateLimit: true });
    const SYMBOL = 'BTC/USDT';
    
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

    const result = AnalysisEngine.analyze({
            '1h': mapCandles(ohlcv1h),
            '4h': mapCandles(ohlcv4h),
            '1d': mapCandles(ohlcv1d),
            '15m': mapCandles(ohlcv15m),
            '5m': mapCandles(ohlcv5m)
    }, {});
    
    console.log(`\n==========================================`);
    console.log(`Grade: ${result.actionGrade}`);
    console.log(`Direction: ${result.direction}`);
    console.log(`Explanation: \n${result.explanation}`);
    console.log(`\nReasons:`);
    result.reasons.forEach(r => console.log(` - ${r}`));
    console.log(`==========================================\n`);
}
run();
