import ccxt from 'ccxt';
import { AnalysisEngine, AnalysisResult } from '../analysis';

/**
 * Backtest Engine: The Truth Serum
 * 
 * Purpose:
 * Validate the "Zero Marginal Cost" & "Real EV" logic against historical data.
 * Does this strategy actually make money after fees?
 */
export class BacktestEngine {
    private exchange = new ccxt.binance({ enableRateLimit: true });
    private symbol = 'BTC/USDT';
    private timeframe = '1h';
    private initialBalance = 10000;
    private balance = 10000;
    private trades: any[] = [];

    // Cost Constants (Hardcoded Truth)
    private FEE = 0.0008; // 0.08%
    private SLIPPAGE = 0.0005; // 0.05%

    /**
     * Fetch Historical Data (Pagination required for long periods)
     * For MVP, we fetch last 1000 candles (~40 days of 1h data).
     */
    async fetchHistory(limit: number = 1000) {
        console.log(`[Backtest] ⏳ Fetching ${limit} candles for ${this.symbol}...`);
        return await this.exchange.fetchOHLCV(this.symbol, this.timeframe, undefined, limit);
    }

    /**
     * Run Simulation
     */
    async run() {
        console.log(`[Backtest] 🚀 Starting Simulation via HP1 v6.0 Engine...`);
        const ohlcv = await this.fetchHistory(1000);

        // Convert to Candles
        const candles = ohlcv.map(c => ({
            time: c[0] as number,
            open: c[1] as number,
            high: c[2] as number,
            low: c[3] as number,
            close: c[4] as number,
            volume: c[5] as number
        }));

        // Simulation Loop
        // We need a rolling window. AnalysisEngine needs ~200 candles to warm up indicators.
        // We start from index 200.

        let position: { type: 'LONG' | 'SHORT', entryPrice: number, size: number, sl: number, tp: number } | null = null;
        const history: any[] = [];

        for (let i = 200; i < candles.length; i++) {
            const currentCandle = candles[i];
            const currentPrice = currentCandle.close;
            const timestamp = new Date(currentCandle.time).toISOString();

            // 1. Prepare Window for Analysis
            // We need to slice the candles array up to index i
            // To simulate "past", we only see candles[0...i]
            // Optimization: AnalysisEngine expects a map. We pass the slice.
            // Note: This is computationally expensive if array is huge. 
            // For 1000 candles it's fine.
            const window = candles.slice(0, i + 1);

            // Mock Multi-Timeframe (For MVP Backtest, we assume HTF aligns or just use 1h logic)
            // Real backtest needs HTF data aligned. 
            // For now, we test the 1h Trigger logic + EV Filter.
            const map = { '1h': window };

            const signal = AnalysisEngine.analyze(map as any);

            // 2. Logic Evaluation
            // Check Exit
            if (position) {
                // Check SL/TP hit during this candle (High/Low)
                // Assuming we check SL first (pessimistic)
                let exitPrice = 0;
                let exitReason = '';

                if (position.type === 'LONG') {
                    if (currentCandle.low <= position.sl) { exitPrice = position.sl; exitReason = 'SL'; }
                    else if (currentCandle.high >= position.tp) { exitPrice = position.tp; exitReason = 'TP'; }
                    // Also check for signal reversal exit? (Optional)
                } else {
                    if (currentCandle.high >= position.sl) { exitPrice = position.sl; exitReason = 'SL'; }
                    else if (currentCandle.low <= position.tp) { exitPrice = position.tp; exitReason = 'TP'; }
                }

                if (exitPrice > 0) {
                    this.closePosition(position, exitPrice, exitReason, currentCandle.time);
                    position = null;
                }
            }

            // Check Entry
            if (!position && signal.actionGrade !== 'F' && signal.direction !== 'NEUTRAL') {
                // EV Filter is already applied inside AnalysisEngine (returns Grade F / Neutral if EV < Cost)
                // So if we are here, EV is Positive.

                // Calculate Size (HP1 v6.0 logic)
                const risk = AnalysisEngine.calculatePersonalRisk(signal, this.balance, currentPrice);

                if (risk.margin > 0) {
                    position = {
                        type: signal.direction as 'LONG' | 'SHORT',
                        entryPrice: currentPrice,
                        size: risk.margin, // Allocate margin
                        sl: risk.sl,
                        tp: risk.tp
                    };
                    console.log(`[Trade] ${timestamp} Entry ${position.type} @ ${currentPrice} (Margin: ${risk.margin.toFixed(0)})`);
                }
            }
        }

        this.report();
    }

    private closePosition(pos: any, exitPrice: number, reason: string, time: number) {
        // PnL Calculation
        const isLong = pos.type === 'LONG';
        const rawPnlPercent = isLong
            ? (exitPrice - pos.entryPrice) / pos.entryPrice
            : (pos.entryPrice - exitPrice) / pos.entryPrice;

        const grossProfit = pos.size * rawPnlPercent;

        // Apply Fees
        const entryFee = pos.size * (this.FEE / 2 + this.SLIPPAGE / 2); // Half trip
        const exitFee = (pos.size + grossProfit) * (this.FEE / 2 + this.SLIPPAGE / 2); // Half trip on exit amount
        const totalFee = entryFee + exitFee;

        const netProfit = grossProfit - totalFee;
        this.balance += netProfit;

        this.trades.push({
            time: new Date(time).toISOString(),
            type: pos.type,
            reason,
            entry: pos.entryPrice,
            exit: exitPrice,
            gross: grossProfit.toFixed(2),
            fee: totalFee.toFixed(2),
            net: netProfit.toFixed(2),
            balance: this.balance.toFixed(2)
        });
    }

    private report() {
        console.log(`\n=== 📊 Evaluation Report (HP1 v6.0) ===`);
        console.log(`Initial Balance: $${this.initialBalance}`);
        console.log(`Final Balance:   $${this.balance.toFixed(2)}`);

        const totalTrades = this.trades.length;
        const wins = this.trades.filter(t => parseFloat(t.net) > 0).length;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

        console.log(`Total Trades:    ${totalTrades}`);
        console.log(`Win Rate:        ${winRate.toFixed(2)}%`);
        console.log(`Net Profit:      $${(this.balance - this.initialBalance).toFixed(2)}`);

        // console.table(this.trades); // Table is nice if terminal supports it
    }
}
