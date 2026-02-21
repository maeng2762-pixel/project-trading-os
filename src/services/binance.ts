// Simple fetch for MVP to avoid CCXT client-side issues
export interface PriceData {
    symbol: string;
    price: number;
    timestamp: number;
}

export const BinanceService = {
    /**
     * Fetch current price for a symbol (e.g., 'BTC/USDT')
     */
    fetchPrice: async (symbol: string = 'BTC/USDT'): Promise<PriceData | null> => {
        try {
            // Binance public API
            const safeSymbol = symbol.replace('/', '');
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${safeSymbol}`);
            const data = await res.json();

            return {
                symbol,
                price: parseFloat(data.price),
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error('Failed to fetch price:', error);
            return null;
        }
    },

    /**
   * Fetch historical candles for indicators (RSI, etc.)
   */
    fetchCandles: async (symbol: string = 'BTC/USDT', timeframe: string = '1h', limit: number = 100) => {
        try {
            const safeSymbol = symbol.replace('/', '');
            // Binance interval mapping logic if needed, but 1h is standard
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${safeSymbol}&interval=${timeframe}&limit=${limit}`);
            const data = await res.json();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((candle: any) => ({
                time: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
            }));
        } catch (error) {
            console.error(`Failed to fetch ${timeframe} candles:`, error);
            return [];
        }
    },

    /**
   * Fetch multiple timeframes in parallel for Sentinel Analysis
   */
    fetchMultiFrameCandles: async (symbol: string = 'BTC/USDT') => {
        const timeframes = ['5m', '15m', '1h', '4h'];
        const promises = timeframes.map(tf => BinanceService.fetchCandles(symbol, tf, 201)); // Need 200 for EMA200 + 1 current

        const results = await Promise.all(promises);

        return {
            '5m': results[0],
            '15m': results[1],
            '1h': results[2],
            '4h': results[3],
        };
    }
};
