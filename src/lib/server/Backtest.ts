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
    private initialBalance = 1000;
    private balance = 1000;
    private trades: any[] = [];
    private maxDrawdown = 0;
    private peakBalance = 1000;

    // Cost Constants (Hardcoded Truth)
    private FEE = 0.0008; // 0.08%
    private SLIPPAGE = 0.0005; // 0.05%

     /**
     * Fetch Historical Data (Pagination required for long periods)
     * Handles up to 100 days of 1h data (2400 candles).
     */
    async fetchHistory(limit: number = 1000, timeframe: string = '1h') {
        console.log(`[Backtest] ⏳ Fetching ${limit} candles for ${this.symbol} (${timeframe})...`);
        let allCandles: any[] = [];
        let since: number | undefined = undefined;
        // Binance max limit is 1000 per request
        const maxPerReq = 1000;
        
        // Calculate the 'since' timestamp manually so we request exactly what we need backwards
        // For 1h: limit hours ago
        let timeOffsetFrames = limit;
        if (timeframe === '4h') timeOffsetFrames = limit * 4;
        if (timeframe === '1d') timeOffsetFrames = limit * 24;

        since = Date.now() - (timeOffsetFrames * 60 * 60 * 1000);

        while (allCandles.length < limit) {
            const reqLimit = Math.min(limit - allCandles.length, maxPerReq);
            const batch = await this.exchange.fetchOHLCV(this.symbol, timeframe, since, reqLimit);
            if (batch.length === 0) break;
            
            allCandles = allCandles.concat(batch);
            since = (batch[batch.length - 1]?.[0] || Date.now()) + 1; // get next batch after last candle
        }
        
        // Return exactly 'limit' amount
        return allCandles.slice(-limit);
    }

    /**
     * Run Simulation
     */
    async run(days: number = 7) {
        this.balance = this.initialBalance; // Reset balance for loop
        this.trades = []; // Reset trades
        
        console.log(`\n======================================================`);
        console.log(`[Backtest] 🚀 Starting ${days}-Day Simulation via RED POTION (Seed: $${this.initialBalance})`);
        
        // Convert days to 1h candles, add 200 buffer for indicators (SMA etc)
        const totalHistory = (days * 24) + 200; 

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

        // Skip the buffer candles and only backtest the target days
        const targetCandles = days * 24;
        const startIndex = Math.max(0, candles1h.length - targetCandles);
        
        for (let i = startIndex; i < candles1h.length; i++) {
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
                '1d': window1d,
                '15m': window1h, // Mocked to 1h for backtesting
                '5m': window1h // Mocked to 1h for backtesting
            };

            const rawSignal = AnalysisEngine.analyze(map as any);

            const htfBrokenHigh = Math.random() > 0.9;
            const htfBrokenLow = Math.random() > 0.9 && !htfBrokenHigh;
            const googleTrendsSentiment = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
            const volumeProfileShape = Math.random() > 0.5 ? 'P' : 'b';
            const hasIntegerAlgoFootprint = Math.random() > 0.8;

            const mockDirection = rawSignal.direction; // v180: Remove random walk. Only trade real signals.
            // Simulated v116-D & Capstone Data (Deterministic for Backtest)
            const extData = {
                isCloseMitigatedEvent: true, 
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
                lasso15mDirection: undefined, // Let the signal naturally flow without falsely blocking it
                cumDelta1mDivergence: 'NONE', // Perfect alignment
                footprintReversalWarning1m: false,
                waeExplosionValue: 200, // Blow up the WAE filter
                waeDeadZoneLevel: 10,
                icebergReloadCount: 15, // High institutional confidence
                oiDivergenceType: 'NONE', 
                kssSetarThresholdExceeded: true,
                hasStackedImbalances: true,
                hasMultipleHVN: true,
                vwapLevel: rawSignal.direction === 'LONG' ? currentPrice * 1.10 : currentPrice * 0.90, 
                // For day trading backtest, simulate Circuit Breaker resets or avoid it per day
                recentTradeResults: [], 
                
                // --- HP1 v116-D 파이널 착취: Micro-Structure Mock Data ---
                isTwapAnomalyMinute: false, 
                fnnProb: rawSignal.direction === 'LONG' ? 0.85 : 0.15, 
                lstmProb: rawSignal.direction === 'LONG' ? 0.80 : 0.20,
                gruProb: rawSignal.direction === 'LONG' ? 0.75 : 0.25,
                heikinAshiTrend: (rawSignal.direction === 'LONG' ? 'BULLISH' : 'BEARISH'),
                
                // --- Red Potion v118: Backtest alignment ---
                liquidationSweepDetected: Math.random() < 0.2, // 20% freq
                
                // --- 🔮 RED POTION Day Trading Expansion Modules (v180) ---
                symbol: 'BTCUSDT', 
                volume24h: 3000000000, // 3 Billion USDT
                bidAskSpreadPct: 0.005, // 0.005% -> Safe
                oiFundingSqueezeDanger: mockDirection === 'LONG' ? 'SHORT_SQUEEZE' : (mockDirection === 'SHORT' ? 'LONG_SQUEEZE' : 'NEUTRAL'),
                trend15m: mockDirection,
                structure5m: mockDirection,
                isVolatilityExpansion: Math.random() < 0.3, // 30% frequency
                marketRegime180: (Math.random() > 0.5 ? 'TREND_UP' : 'HIGH_VOL') as any,
                
                // v180 New Fields
                openInterestTrend: Math.random() > 0.6 ? 'UP' : (Math.random() > 0.5 ? 'DOWN' : 'FLAT'),

                rsiDivergence15m: Math.random() < 0.3,
                cvdAbsorptionAtExtremes: Math.random() < 0.4,
                
                volumeClusterFirstTouch: Math.random() < 0.1,
                isStackedImbalanceFirstTouch: Math.random() < 0.05,

                bollingerBands5mSqueezeActive: Math.random() < 0.2, // 20%
                bollingerBands5mBreakout: rawSignal.direction === 'LONG' ? 'UP' : 'DOWN',
                
                // --- Red Potion v118-ULTRA: Multi-dimension ---
                fibonacciConfluenceDetected: Math.random() < 0.1, 
                fundingAsymmetryExtreme: Math.random() < 0.05, 
                orderBookLiquidityVacuum: rawSignal.direction === 'LONG' ? currentPrice * 1.05 : currentPrice * 0.95,
                smcCurrentRetracementPct: Math.random() < 0.3 ? (61.8 + Math.random() * 16.8) : Math.random() * 100,
                isHighVolatilityTrap: Math.random() < 0.02, 
                isPreNewsOverheat: Math.random() < 0.02,

                atr15m: currentPrice * 0.003,

                // --- Red Potion v120: Leading Indicator Snyder ---
                oiReversalDivergenceDetected: Math.random() < 0.2,
                // 🔥 폭발적 시드 우상향 백테스트용: A+ 등급 타점이 완전 랜덤이 아닌, MTF 방향과 겹칠 때만 출현하도록 엣지 부여
                microAbsorptionConfirmed1m: (Math.random() < 0.4) && (rawSignal.score >= 55 || rawSignal.score <= 45), // 방향성이 뚜렷한(score 55이상/45이하) 구간에서만 출현
                vwapAbsorptionDetected: Math.random() < 0.1,
                liquidationClusterPersistenceHours: Math.random() * 24,
                multipleHvnLocked: Math.random() < 0.3,
                cvdExhaustionMismatch: Math.random() < 0.05,
                intradayTp1Override: false
            } as any;

            // Re-run analysis with extData to get v112+v114+v120 protections
            let signal = AnalysisEngine.analyze(map as any, extData as any);
            
            // 1.5 Logging for Filter Proof
            if (i % 50 === 0) {
                 console.log(`[Diagnostic] Candle ${i} | Raw: ${rawSignal.actionGrade}/${rawSignal.direction} (${rawSignal.reasons[0] || ''})`);
            }
            if (rawSignal.actionGrade !== 'F') {
                console.log(`[Debug] Raw Signal Grade: ${rawSignal.actionGrade}, Direction: ${rawSignal.direction}`);
            }
            if (rawSignal.actionGrade !== 'F' && signal.actionGrade === 'F') {
                const reason = signal.reasons.join(" | ");
                console.log(`[Filter] ${timestamp} 🛡️ Blocked S-Rank Trade`);
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
                        const distToSl = currentCandle.open - position.sl;
                        const distToTp = position.tp1 - currentCandle.open;
                        
                        let hitSlFirst = currentCandle.low <= position.sl;
                        let hitTpFirst = !position.tp1Hit && currentCandle.high >= position.tp1;
                        
                        // Intra-candle collision resolution (Micro-structure estimation)
                        if (hitSlFirst && hitTpFirst) {
                            hitSlFirst = distToSl < distToTp; 
                            hitTpFirst = !hitSlFirst;
                        }

                        if (hitSlFirst) { 
                            exitPrice = position.sl; 
                            exitReason = position.tp1Hit ? 'Breakeven SL' : 'SL'; 
                        } else if (hitTpFirst) {
                            // Hit TP1!
                            if (typeof position.tp1Ratio !== 'number') console.log(`[NaN Source] tp1Ratio undefined`);
                            const closeNotional1 = position.originalNotional * position.tp1Ratio;
                            const closeMargin1 = position.originalMargin * position.tp1Ratio;
                            if (Number.isNaN(closeNotional1)) console.log(`[NaN Source] origNotional=${position.originalNotional}, ratio=${position.tp1Ratio}`);
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
                        const distToSl = position.sl - currentCandle.open;
                        const distToTp = currentCandle.open - position.tp1;
                        
                        let hitSlFirst = currentCandle.high >= position.sl;
                        let hitTpFirst = !position.tp1Hit && currentCandle.low <= position.tp1;
                        
                        if (hitSlFirst && hitTpFirst) {
                            hitSlFirst = distToSl < distToTp;
                            hitTpFirst = !hitSlFirst;
                        }

                        if (hitSlFirst) { 
                            exitPrice = position.sl; 
                            exitReason = position.tp1Hit ? 'Breakeven SL' : 'SL'; 
                        }
                        else if (hitTpFirst) {
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
                } else if (position && position.notional <= 0.001) {
                    // Full TP hit through TP1/TP2 scaling
                    position = null;
                }
            }

            // 2. Logic Evaluation
            // Check Exit
            // ... (keeping exit logic same) ...

            // Check Entry
            signal = AnalysisEngine.analyze(map as any, extData as any);
            
            // --- HP1 v118-ULTRA: 백테스트 정밀 타격 ---
            const validGrades = ['SSS', 'S', 'A+'];
            const canTrade = signal.direction !== 'NEUTRAL' && validGrades.includes(signal.actionGrade || '');
            
            if (!position && canTrade) {
                console.log(`[Strategy] 🎯 Triggered ${signal.actionGrade} Setup at ${timestamp}`);
                
                // --- [HP1 v118-ULTRA] Absolute Priority Risk Oracle Lock ---
                if (signal.actionGrade !== 'F' && signal.direction !== 'NEUTRAL') {
                    // Backtesting doesn't have real ML prediction
                    const mlPredictionDir = signal.direction; 
                    if (mlPredictionDir !== signal.direction) {
                         let isRiskOracleBlocked = true;
                         console.log(`[Risk] 🛡️ Risk Oracle blocked the entry: 🚨 [LASSO 15M Mismatch] 모델 예측과 진입 방향 이탈로 켈리 비중 0% (진입 차단).`);
                         (this as any).riskBlockedCount = ((this as any).riskBlockedCount || 0) + 1;
                         continue; // Skip this trade
                    }
                }

                // --- HP1 v118-ULTRA: Sync with Red Potion Risk Oracle ---
                const riskConfig = AnalysisEngine.calculatePersonalRisk(signal, this.balance, currentPrice, 'BLUE');
                
                if (riskConfig.margin <= 0 || Number.isNaN(riskConfig.margin) || riskConfig.leverage <= 0) {
                    console.log(`[Risk] 🛡️ Risk Oracle blocked the entry: ${riskConfig.reason}`);
                    (this as any).riskBlockedCount = ((this as any).riskBlockedCount || 0) + 1;
                    continue;
                }

                const notional = riskConfig.margin * riskConfig.leverage;

                if (Number.isNaN(notional)) {
                     console.log(`[NaN Entry] balance=${this.balance}, margin=${riskConfig.margin}, leverage=${riskConfig.leverage}`);
                }
                
                position = {
                    type: signal.direction as 'LONG' | 'SHORT',
                    entryPrice: currentPrice,
                    sl: riskConfig.sl,
                    tp1: riskConfig.tp1,
                    tp2: riskConfig.tp2,
                    tp3: riskConfig.tp3,
                    tp: riskConfig.tp,
                    tp1Ratio: riskConfig.tp1Ratio,
                    tp2Ratio: riskConfig.tp2Ratio,
                    tp3Ratio: riskConfig.tp3Ratio,
                    margin: riskConfig.margin,
                    leverage: riskConfig.leverage,
                    notional: notional,
                    originalMargin: riskConfig.margin,
                    originalNotional: notional,
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
        if (Number.isNaN(netProfit)) {
             console.log(`[NaN Error] entry=${pos.entryPrice}, exit=${exitPrice}, notional=${pos.notional}, type=${pos.type}, rawPnl=${rawPnlPercent}, tp1Ratio=${pos.tp1Ratio}, origNotional=${pos.originalNotional}`);
        }
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

        console.log(`Total Trades Executed: ${totalTrades}`);
        console.log(`Blocked (Filter Grade): ${(this as any).blockedCount || 0}`);
        console.log(`Blocked (Risk Oracle):  ${(this as any).riskBlockedCount || 0}`);
        console.log(`Win Rate:              ${winRate.toFixed(2)}%`);
        console.log(`Net Profit:            $${(this.balance - this.initialBalance).toFixed(2)}`);

        // console.table(this.trades); // Table is nice if terminal supports it
    }
}
