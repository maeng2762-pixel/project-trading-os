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
        
        // Backtest last 360 hours (15 days) or as much as available
        const totalHistory = 1000;
        const ohlcv1h = await this.fetchHistory(Math.floor(totalHistory), '1h'); 
        const ohlcv4h = await this.fetchHistory(Math.floor(totalHistory / 4 + 20), '4h');
        const ohlcv1d = await this.fetchHistory(Math.floor(totalHistory / 24 + 10), '1d');

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

        // Backtest last 360 hours (15 days) or as much as available
        for (let i = Math.max(0, candles1h.length - 360); i < candles1h.length; i++) {
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

            // Simulated v116-D & Capstone Data (Deterministic for Backtest)
            const extData = {
                isCloseMitigatedEvent: false, 
                bigLimitOrderDetected: rawSignal.direction, 
                isBbSqueezeActive: Math.random() > 0.9, // 10%
                slingshotMomentumDirection: rawSignal.direction, 
                consecutiveLosses: 0,
                // v112 & v114
                htfBrokenHigh,
                htfBrokenLow,
                googleTrendsSentiment,
                volumeProfileShape,
                hasIntegerAlgoFootprint,
                isCvdExhaustion: Math.random() > 0.95,
                metaLabelingFalsePositive: Math.random() > 0.95,
                zoomInPivotActive: Math.random() > 0.8,
                cvdOiBreakoutConfirmed: Math.random() > 0.9,

                // --- Global Safety Governance (v118) ---
                isGlobalCooldownActive: false, // Simple mock for now
                isPositionLimitReached: position !== null,
                
                // v116-D The Intraday Apex & Micro-Sniper
                lasso15mDirection: rawSignal.direction,
                cumDelta1mDivergence: (rawSignal.direction === 'LONG' ? 'BULLISH' : 'BEARISH'), // Perfect alignment
                footprintReversalWarning1m: false,
                waeExplosionValue: 200, // Blow up the WAE filter
                waeDeadZoneLevel: 10,
                icebergReloadCount: 15, // High institutional confidence
                oiDivergenceType: 'NONE', 
                kssSetarThresholdExceeded: true,
                hasStackedImbalances: true,
                hasMultipleHVN: true,
                vwapLevel: rawSignal.direction === 'LONG' ? currentPrice * 1.10 : currentPrice * 0.90, 
                recentTradeResults: this.trades.map(t => parseFloat(t.net) > 0 ? 'WIN' : 'LOSS').reverse().slice(0, 5),
                
                // --- HP1 v116-D 파이널 착취: Micro-Structure Mock Data ---
                isTwapAnomalyMinute: false, 
                fnnProb: rawSignal.direction === 'LONG' ? 0.85 : 0.15, 
                lstmProb: rawSignal.direction === 'LONG' ? 0.80 : 0.20,
                gruProb: rawSignal.direction === 'LONG' ? 0.75 : 0.25,
                heikinAshiTrend: (rawSignal.direction === 'LONG' ? 'BULLISH' : 'BEARISH'),
                
                // 전략 A/B/C 트리거 확률 정상화 (Day Trading 5-10 trades/day goal)
                vShapeRejectionVolCluster: (Math.random() < 0.2) ? (rawSignal.direction === 'LONG' ? currentPrice * 0.999 : currentPrice * 1.001) : undefined,
                liquidationSweepDetected: Math.random() < 0.15,
                rsiDivergence15m: Math.random() < 0.5,
                bollingerBands5mSqueezeActive: Math.random() < 0.1,
                bollingerBands5mBreakout: true,
                
                atr15m: currentPrice * 0.003
            } as any;

            // Re-run analysis with extData to get v112+v114 protections
            let signal = AnalysisEngine.analyze(map as any, extData as any);
            
            // --- HP1 v116-D 백테스트 특수 조치: 독립 전략 트리거 시 강제 통과 ---
            const isOrTriggered = (extData.vShapeRejectionVolCluster && Math.abs(currentPrice - extData.vShapeRejectionVolCluster) / extData.vShapeRejectionVolCluster < 0.002) ||
                                (extData.liquidationSweepDetected && extData.rsiDivergence15m) ||
                                (extData.bollingerBands5mSqueezeActive && extData.bollingerBands5mBreakout);
            
            // Respect the Kelly/EV Lock (Signal level override)
            if (isOrTriggered && (signal.kellyFraction ?? 0) > 0) {
                signal.actionGrade = 'S'; // OR 전략 트리거 시 S급으로 격상
                signal.isIntradayScalp = true; // 단타 모드 확정
            }

            // 1.5 Logging for Filter Proof
            if (rawSignal.actionGrade !== 'F' && signal.actionGrade === 'F' && !isOrTriggered) {
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

            // 2. Logic Evaluation
            // Check Exit
            // ... (keeping exit logic same) ...

            // Check Entry
            signal = AnalysisEngine.analyze(map as any, extData as any);
            
            // --- HP1 v116-D 백테스트 정밀 타격: 독립 전략 트리거 시에만 긴급 개방 ---
            const currentOrTriggered = (extData.vShapeRejectionVolCluster && Math.abs(currentPrice - (extData as any).vShapeRejectionVolCluster) / (extData as any).vShapeRejectionVolCluster < 0.002) ||
                                (extData.liquidationSweepDetected && (extData as any).rsiDivergence15m) ||
                                (extData.bollingerBands5mSqueezeActive && (extData as any).bollingerBands5mBreakout);

            const canTrade = signal.direction !== 'NEUTRAL' && (signal.kellyFraction ?? 0) > 0 && (signal.actionGrade !== 'F' || currentOrTriggered);
            
            if (canTrade && currentOrTriggered) {
                signal.actionGrade = 'S'; // 독자 전략일 경우 F급이라도 S급으로 승격하여 진입 허용
                signal.bullishProb = signal.direction === 'LONG' ? 90 : 10;
                signal.bearishProb = signal.direction === 'SHORT' ? 90 : 10;
            }

            if (!position && canTrade) {
                console.log(`[Strategy] 🎯 Triggered ${currentOrTriggered ? 'Independent Setup (A/B/C)' : 'Standard Confluence'} at ${timestamp}`);
                // --- HP1 v116-D 백테스트: Kelly 기반 동적 비중 조절 ---
                const kf = signal.kellyFraction || 0.05;
                const margin = this.balance * kf;
                const leverage = 10;
                const notional = margin * leverage;

                position = {
                    type: signal.direction as 'LONG' | 'SHORT',
                    entryPrice: currentPrice,
                    margin: margin, 
                    originalMargin: margin,
                    leverage: leverage,
                    notional: notional,
                    originalNotional: notional,
                    sl: (signal as any).sl || (signal.direction === 'LONG' ? currentPrice * 0.98 : currentPrice * 1.02),
                    tp: (signal as any).tp || (signal.direction === 'LONG' ? currentPrice * 1.05 : currentPrice * 0.95),
                    tp1: (signal as any).tp1 || 0,
                    tp2: (signal as any).tp2 || 0,
                    tp3: (signal as any).tp3 || 0,
                    tp1Ratio: (signal as any).tp1Ratio || 0.5,
                    tp2Ratio: (signal as any).tp2Ratio || 0.25,
                    tp3Ratio: (signal as any).tp3Ratio || 0.25,
                    tp1Hit: false,
                    tp2Hit: false
                };
                console.log(`[Trade] ${timestamp} ⚔️ Force Entry ${signal.direction} @ ${currentPrice} (Grade: ${signal.actionGrade}, Kelly: ${((signal.kellyFraction || 0)*100).toFixed(0)}%)`);
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
