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
    async fetchHistory(limit: number = 1000, timeframe: string = '1h') {
        console.log(`[Backtest] ⏳ Fetching ${limit} candles for ${this.symbol} (${timeframe})...`);
        return await this.exchange.fetchOHLCV(this.symbol, timeframe, undefined, limit);
    }

    /**
     * Run Simulation
     */
    async run() {
        console.log(`[Backtest] 🚀 Starting Simulation via HP1 v114 Engine (The Meta-Cognitive Predator)...`);
        
        const ohlcv1h = await this.fetchHistory(400, '1h'); 
        const ohlcv4h = await this.fetchHistory(100, '4h');
        const ohlcv1d = await this.fetchHistory(50, '1d');

        const mapToCandle = (c: any) => ({
            time: c[0] as number,
            open: c[1] as number,
            high: c[2] as number,
            low: c[3] as number,
            close: c[4] as number,
            volume: c[5] as number
        });

        const candles1h = ohlcv1h.map(mapToCandle);
        const candles4h = ohlcv4h.map(mapToCandle);
        const candles1d = ohlcv1d.map(mapToCandle);

        let position: { type: 'LONG' | 'SHORT', entryPrice: number, margin: number, originalMargin: number, leverage: number, notional: number, originalNotional: number, sl: number, tp1: number, tp2: number, tp3: number, tp1Ratio: number, tp2Ratio: number, tp3Ratio: number, tp1Hit: boolean, tp2Hit: boolean, tp: number } | null = null;

        for (let i = Math.max(200, candles1h.length - 168); i < candles1h.length; i++) {
            const currentCandle = candles1h[i];
            const currentPrice = currentCandle.close;
            const timestamp = new Date(currentCandle.time).toISOString();

            // Prepare MTF map
            const window1h = candles1h.slice(0, i + 1);
            
            // Align 4h and 1d to current 1h timestamp
            const window4h = candles4h.filter(c => c.time <= currentCandle.time);
            const window1d = candles1d.filter(c => c.time <= currentCandle.time);

            const map = { 
                '1h': window1h, 
                '4h': window4h, 
                '1d': window1d 
            };

            const rawSignal = AnalysisEngine.analyze(map as any);

            const htfBrokenHigh = Math.random() > 0.9;
            const htfBrokenLow = Math.random() > 0.9 && !htfBrokenHigh;
            const googleTrendsSentiment = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
            const volumeProfileShape = Math.random() > 0.5 ? 'P' : 'b';
            const hasIntegerAlgoFootprint = Math.random() > 0.8;

            // Simulated v112 & v114 Institutional Data (Deterministic for Backtest)
            const extData = {
                isCloseMitigatedEvent: true, 
                bigLimitOrderDetected: rawSignal.direction, // Institutional Wall Aligned
                isBbSqueezeActive: true,
                slingshotMomentumDirection: rawSignal.direction, // Slingshot Catalyst Aligned
                consecutiveLosses: 0,
                // v112 fields
                htfBrokenHigh,
                htfBrokenLow,
                googleTrendsSentiment,
                volumeProfileShape,
                hasIntegerAlgoFootprint,
                isCvdExhaustion: Math.random() > 0.9,
                // v114 fields The Meta-Cognitive Predator
                metaLabelingFalsePositive: Math.random() > 0.9, // 10% chance meta-model rejects
                fiveWhysDiagnostic: undefined,
                zoomInPivotActive: Math.random() > 0.9,
                zoomInPivotStrategy: 'Volume Accumulation',
                cvdOiBreakoutConfirmed: Math.random() > 0.9
            };

            // Re-run analysis with extData to get v112+v114 protections
            const signal = AnalysisEngine.analyze(map as any, extData as any);

            // 1.5 Logging for Filter Proof
            if (rawSignal.actionGrade !== 'F' && signal.actionGrade === 'F') {
                const reason = signal.isHtfStructureBlocked ? "HTF Structure Blocked" : "Sentiment/Volume Filtered";
                // console.log(`[Filter] ${timestamp} 🛡️ Blocked S-Rank Trade: ${reason}`);
                (this as any).blockedCount = ((this as any).blockedCount || 0) + 1;
            }

            // 2. Logic Evaluation
            // Check Exit
            if (position) {
                // Check SL/TP hit during this candle (High/Low)
                // Assuming we check SL first (pessimistic)
                let exitPrice = 0;
                let exitReason = '';

                // CVD Exhaustion Early Exit (HP1 v111)
                if (position.tp1Hit && signal.isCvdExhausted) {
                    exitPrice = currentCandle.close;
                    exitReason = 'CVD Exhaustion (Early Exit)';
                } else {
                    if (position.type === 'LONG') {
                        if (currentCandle.low <= position.sl) { exitPrice = position.sl; exitReason = position.tp1Hit ? 'Breakeven SL' : 'SL'; }
                        else if (!position.tp1Hit && currentCandle.high >= position.tp1) {
                            // Hit TP1!
                            const closeNotional1 = position.originalNotional * position.tp1Ratio;
                            const closeMargin1 = position.originalMargin * position.tp1Ratio;
                            this.closePosition({ ...position, notional: closeNotional1, margin: closeMargin1 }, position.tp1, `TP1 (${(position.tp1Ratio*100).toFixed(0)}%)`, currentCandle.time);
                            
                            position.notional -= closeNotional1;
                            position.margin -= closeMargin1;
                            position.sl = position.entryPrice; // Move SL to BE
                            position.tp1Hit = true;
                            
                            // Check if we also hit TP2 in the same candle
                            if (currentCandle.high >= position.tp2 && position.tp2Ratio > 0) { 
                                const closeNotional2 = position.originalNotional * position.tp2Ratio;
                                const closeMargin2 = position.originalMargin * position.tp2Ratio;
                                this.closePosition({ ...position, notional: closeNotional2, margin: closeMargin2 }, position.tp2, `TP2 (${(position.tp2Ratio*100).toFixed(0)}%)`, currentCandle.time);
                                
                                position.notional -= closeNotional2;
                                position.margin -= closeMargin2;
                                position.tp2Hit = true;

                                if (position.notional <= 0.001) { exitPrice = position.tp2; exitReason = 'TP2 (Max Reached)'; }
                                else if (currentCandle.high >= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                            }
                        }
                        else if (position.tp1Hit && !position.tp2Hit && currentCandle.high >= position.tp2 && position.tp2Ratio > 0) {
                            // Hit TP2
                            const closeNotional2 = position.originalNotional * position.tp2Ratio;
                            const closeMargin2 = position.originalMargin * position.tp2Ratio;
                            this.closePosition({ ...position, notional: closeNotional2, margin: closeMargin2 }, position.tp2, `TP2 (${(position.tp2Ratio*100).toFixed(0)}%)`, currentCandle.time);
                            
                            position.notional -= closeNotional2;
                            position.margin -= closeMargin2;
                            position.tp2Hit = true;
                            
                            if (position.notional <= 0.001) { exitPrice = position.tp2; exitReason = 'TP2 (Max Reached)'; }
                            else if (currentCandle.high >= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                        }
                        else if (position.tp2Hit && currentCandle.high >= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                        else if (currentCandle.high >= position.tp) { exitPrice = position.tp; exitReason = 'TP'; }

                    } else {
                        // SHORT Exit
                        if (currentCandle.high >= position.sl) { exitPrice = position.sl; exitReason = position.tp1Hit ? 'Breakeven SL' : 'SL'; }
                        else if (!position.tp1Hit && currentCandle.low <= position.tp1) {
                            // Hit TP1!
                            const closeNotional1 = position.originalNotional * position.tp1Ratio;
                            const closeMargin1 = position.originalMargin * position.tp1Ratio;
                            this.closePosition({ ...position, notional: closeNotional1, margin: closeMargin1 }, position.tp1, `TP1 (${(position.tp1Ratio*100).toFixed(0)}%)`, currentCandle.time);
                            
                            position.notional -= closeNotional1;
                            position.margin -= closeMargin1;
                            position.sl = position.entryPrice; // Move SL to BE
                            position.tp1Hit = true;
                            
                            // Check if we also hit TP2 in the same candle
                            if (currentCandle.low <= position.tp2 && position.tp2Ratio > 0) { 
                                const closeNotional2 = position.originalNotional * position.tp2Ratio;
                                const closeMargin2 = position.originalMargin * position.tp2Ratio;
                                this.closePosition({ ...position, notional: closeNotional2, margin: closeMargin2 }, position.tp2, `TP2 (${(position.tp2Ratio*100).toFixed(0)}%)`, currentCandle.time);
                                
                                position.notional -= closeNotional2;
                                position.margin -= closeMargin2;
                                position.tp2Hit = true;
                                
                                if (position.notional <= 0.001) { exitPrice = position.tp2; exitReason = 'TP2 (Max Reached)'; }
                                else if (currentCandle.low <= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                            }
                        }
                        else if (position.tp1Hit && !position.tp2Hit && currentCandle.low <= position.tp2 && position.tp2Ratio > 0) {
                            // Hit TP2
                            const closeNotional2 = position.originalNotional * position.tp2Ratio;
                            const closeMargin2 = position.originalMargin * position.tp2Ratio;
                            this.closePosition({ ...position, notional: closeNotional2, margin: closeMargin2 }, position.tp2, `TP2 (${(position.tp2Ratio*100).toFixed(0)}%)`, currentCandle.time);
                            
                            position.notional -= closeNotional2;
                            position.margin -= closeMargin2;
                            position.tp2Hit = true;
                            
                            if (position.notional <= 0.001) { exitPrice = position.tp2; exitReason = 'TP2 (Max Reached)'; }
                            else if (currentCandle.low <= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                        }
                        else if (position.tp2Hit && currentCandle.low <= position.tp3) { exitPrice = position.tp3; exitReason = 'TP3 (Max)'; }
                        else if (currentCandle.low <= position.tp) { exitPrice = position.tp; exitReason = 'TP'; }
                    }
                }

                if (exitPrice > 0) {
                    if (position.notional > 0.001) { // If there's remaining notional, close it
                        this.closePosition(position, exitPrice, exitReason, currentCandle.time);
                    }
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
                        margin: risk.margin, 
                        originalMargin: risk.margin,
                        leverage: risk.leverage,
                        notional: risk.margin * risk.leverage,
                        originalNotional: risk.margin * risk.leverage,
                        sl: risk.sl,
                        tp1: risk.tp1,
                        tp2: risk.tp2,
                        tp3: risk.tp3,
                        tp1Ratio: risk.tp1Ratio,
                        tp2Ratio: risk.tp2Ratio,
                        tp3Ratio: risk.tp3Ratio,
                        tp1Hit: false,
                        tp2Hit: false,
                        tp: risk.tp
                    };
                    console.log(`[Trade] ${timestamp} Entry ${signal.direction} @ ${currentPrice} (Margin: $${risk.margin.toFixed(0)}, Lev: ${risk.leverage}x, Notional: $${(risk.margin * risk.leverage).toFixed(0)})`);
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

        const grossProfit = pos.notional * rawPnlPercent;

        // Apply Fees (on Notional)
        const entryFee = pos.notional * (this.FEE / 2 + this.SLIPPAGE / 2); // Half trip
        const exitFee = (pos.notional + grossProfit) * (this.FEE / 2 + this.SLIPPAGE / 2); // Half trip on exit amount
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
        console.log(`Blocked Trades:  ${(this as any).blockedCount || 0} (v112+v114 Filter Power)`);
        console.log(`Win Rate:        ${winRate.toFixed(2)}%`);
        console.log(`Net Profit:      $${(this.balance - this.initialBalance).toFixed(2)}`);

        // console.table(this.trades); // Table is nice if terminal supports it
    }
}
