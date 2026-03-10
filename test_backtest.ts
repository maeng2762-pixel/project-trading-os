import { AnalysisEngine } from './src/lib/analysis';

// ===============================================
// 1. 100-Day Mock Data Generator (100일 모의 데이터 생성)
// ===============================================
const DAYS = 100;
const TOTAL_5m_CANDLES = DAYS * 24 * 60 / 5; // 28,800
const baseTime = Date.now() - TOTAL_5m_CANDLES * 5 * 60 * 1000;
let currentPrice = 50000;

interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const raw5m: Candle[] = [];
console.log(`Generating ${DAYS} days of price action...`);

// Simulated phases in the market
// We rotate every 5 days (1440 5m-candles)
const PHASES = ['RANGE', 'UPTREND', 'UPTREND', 'RANGE', 'DOWNTREND', 'DOWNTREND', 'HIGH_VOL'];

for (let i = 0; i < TOTAL_5m_CANDLES; i++) {
    const currentPhase = PHASES[Math.floor(i / 1440) % PHASES.length];
    
    let volatility = 20;
    let trend = 0;
    
    // Simulate real momentum shifts! 
    // Increase trend drastically vs volatility so it forms actual trends
    // Need volatility > 35 to comfortably pass the 0.05% atrPercent check in analysis.ts
    if (currentPhase === 'UPTREND') { volatility = 40; trend = 8.0; } // Smooth run up, high enough VOL
    else if (currentPhase === 'DOWNTREND') { volatility = 40; trend = -8.0; } // Smooth drop
    else if (currentPhase === 'HIGH_VOL') { volatility = 150; trend = (Math.random() > 0.5 ? 3.0 : -3.0); } // Hard chop
    else { volatility = 35; trend = (Math.random() > 0.5 ? 1.0 : -1.0); } // Range
    
    // Add realistic auto-correlation to noise to form smooth structures
    const noise = (Math.random() - 0.5) * volatility;
    
    // Generate open, process trend + noise
    const open = currentPrice;
    currentPrice = currentPrice + trend + noise;
    
    const high = Math.max(open, currentPrice) + Math.abs((Math.random()) * volatility * 0.4); // Less wick
    const low = Math.min(open, currentPrice) - Math.abs((Math.random()) * volatility * 0.4);
    
    raw5m.push({
        timestamp: baseTime + i * 5 * 60 * 1000,
        open, high, low, close: currentPrice, 
        volume: 1000 + Math.random() * 5000
    });
}

function aggregateCandles(candles: Candle[], grouping: number): Candle[] {
    const res: Candle[] = [];
    for (let i = 0; i < candles.length; i += grouping) {
        const slice = candles.slice(i, i + grouping);
        if (slice.length === 0) continue;
        res.push({
            timestamp: slice[0].timestamp,
            open: slice[0].open,
            high: Math.max(...slice.map(s => s.high)),
            low: Math.min(...slice.map(s => s.low)),
            close: slice[slice.length - 1].close,
            volume: slice.reduce((a, b) => a + b.volume, 0)
        });
    }
    return res;
}

const raw15m = aggregateCandles(raw5m, 3);
const raw1h = aggregateCandles(raw5m, 12);
const raw4h = aggregateCandles(raw5m, 48);

// ===============================================
// 2. Backtest Engine (100일 백테스트 시뮬레이션)
// ===============================================
let capital = 10000;
let initialCapital = capital;
let position: { type: string, entry: number, sizeUsdt: number, sizeCoins: number, sl: number, tp: number } | null = null;

let trades = 0;
let wins = 0;
let totalPnl = 0;
let liquidations = 0;
let gradeStats: Record<string, number> = {};

console.log("System Ready. Starting 100-Day Backtest Loop...");
console.log("-------------------------------------------------");

// We start testing after 800 hours to ensure 4H timeframe has its 200-candle history.
// 800 hours = 3200 15m candles
const startIdx15m = 3200; 

// Track limits for drawdown
let maxCapital = capital;
let maxDrawdown = 0;

for (let i = startIdx15m; i < raw15m.length; i++) {
    const currentPrice = raw15m[i].close;
    
    if (capital > maxCapital) maxCapital = capital;
    const currentDrawdown = (maxCapital - capital) / maxCapital * 100;
    if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;

    // Check Open Position (SL / TP Trigger)
    if (position) {
        let closed = false;
        let pnl = 0;
        const low = raw15m[i].low;
        const high = raw15m[i].high;
        
        // SL Hit
        if ((position.type === 'LONG' && low <= position.sl) || 
            (position.type === 'SHORT' && high >= position.sl)) {
            pnl = position.type === 'LONG' ? 
                  (position.sl - position.entry) * position.sizeCoins : 
                  (position.entry - position.sl) * position.sizeCoins;
            closed = true;
            console.log(`[SL HIT] ${position.type} Entry: ${position.entry.toFixed(2)}, SL: ${position.sl.toFixed(2)}, Exit Price: ${position.sl.toFixed(2)} -> PnL: $${pnl.toFixed(2)}`);
        } 
        // TP Hit
        else if ((position.type === 'LONG' && high >= position.tp) || 
                 (position.type === 'SHORT' && low <= position.tp)) {
            pnl = position.type === 'LONG' ? 
                  (position.tp - position.entry) * position.sizeCoins : 
                  (position.entry - position.tp) * position.sizeCoins;
            closed = true;
            console.log(`[TP HIT] ${position.type} Entry: ${position.entry.toFixed(2)}, TP: ${position.tp.toFixed(2)}, Exit Price: ${position.tp.toFixed(2)} -> PnL: $${pnl.toFixed(2)}`);
        }

        // Apply trading fees (0.05% Taker each way for sizing)
        if (closed) {
            const fee = (position.sizeUsdt * 2) * 0.0005; 
            const netPnl = pnl - fee;
            capital += netPnl;
            totalPnl += netPnl;
            trades++;
            
            if (netPnl > 0) wins++;
            else if (netPnl < -position.sizeUsdt*0.8) liquidations++; // Approximation of severe loss
            position = null;
        }
    }
    
    // Engine Evaluation
    if (!position) {
        // Prepare historical slices exactly as the real engine receives them
        const i5m = i * 3;
        const i1h = Math.floor(i / 4);
        const i4h = Math.floor(i / 16);
        
        const map = {
            '5m': raw5m.slice(i5m - 200, i5m),
            '15m': raw15m.slice(i - 200, i),
            '1h': raw1h.slice(i1h - 200, i1h),
            '4h': raw4h.slice(i4h - 200, i4h)
        };
        
        // Feed synthetic external data / triggers randomly
        // To trigger our new A-grade bypasses during Range / Downtrend
        const recentHighs = raw15m.slice(i - 5, i).map(c => c.high);
        const recentLows = raw15m.slice(i - 5, i).map(c => c.low);
        const recentVol = Math.max(...recentHighs) - Math.min(...recentLows);
        
        // Pseudo-randomizing long/short signals for proper two-way testing
        const pseudoTrend = raw1h[Math.floor(i/4) - 1]?.close > raw1h[Math.floor(i/4) - 5]?.close ? 'LONG' : 'SHORT';
        
        let extData = {
             trend15m: pseudoTrend,
             structure5m: pseudoTrend,
             isVolatilityExpansion: recentVol > currentPrice * 0.02,
             volumeClusterFirstTouch: Math.random() > 0.3,
             isCompressZone: recentVol < currentPrice * 0.002 && Math.random() > 0.3,
             isEqhEqlLiquiditySweep: Math.random() > 0.60, // Sweep is rarer
             oiFundingSqueezeDanger: pseudoTrend === 'LONG' ? 'SHORT_SQUEEZE' : 'LONG_SQUEEZE',
             bollingerBands5mSqueezeActive: recentVol < currentPrice * 0.005,
             bollingerBands5mBreakout: undefined as 'UP' | 'DOWN' | undefined
        };
        
        if (extData.bollingerBands5mSqueezeActive && Math.random() > 0.8) {
           extData.bollingerBands5mBreakout = Math.random() > 0.5 ? 'UP' : 'DOWN';
        }
        
        const result = AnalysisEngine.analyze(map as any, extData as any);
        
        const kelly = result.kellyFraction || 0;
        gradeStats[result.actionGrade || 'NONE'] = (gradeStats[result.actionGrade || 'NONE'] || 0) + 1;
        if (result.actionGrade && ['SSS', 'S', 'A+', 'A'].includes(result.actionGrade) && kelly > 0) {
            const lev = result.recommendedLeverage ? result.recommendedLeverage * 2 : 5; // Double leverage for explosion
            // Increase cap to 60% for explosive compounding 
            const safeFraction = Math.min(kelly * 2, 0.6); 
            const sizeUsdt = capital * safeFraction * lev; 
            const sizeCoins = sizeUsdt / currentPrice;
            
            const entryPrice = currentPrice;
            const sl = result.recommendedSL || (result.direction === 'LONG' ? entryPrice * 0.995 : entryPrice * 1.005);
            const tp = result.recommendedTP || (result.direction === 'LONG' ? entryPrice * 1.05 : entryPrice * 0.95);

            position = {
                type: result.direction,
                entry: entryPrice,
                sizeUsdt: sizeUsdt,
                sizeCoins: sizeCoins,
                sl: sl,
                tp: tp
            };
            console.log(`[ENTRY] ${result.direction} @ ${entryPrice.toFixed(2)} | SL: ${sl.toFixed(2)} | TP: ${tp.toFixed(2)} | Grade: ${result.actionGrade}`);
        }
    }
}

// ===============================================
// 3. Output Results
// ===============================================
console.log("=== 📊 Grade Distribution ===");
console.log(gradeStats);
console.log("=== 💯 100-Day Backtest Results ===");
console.log(`- 초기 자본금 (Initial): $${initialCapital.toLocaleString()}`);
console.log(`- 최종 자본금 (Final):   $${capital.toLocaleString()}`);
const roi = ((capital - initialCapital) / initialCapital) * 100;
console.log(`- 총 수익률 (ROI):       ${roi.toFixed(2)}%`);
console.log(`- 초대형 손실 (Liqs):    ${liquidations}회 (리스크 관리 실패)`);
console.log(`- 최대 낙폭 (Max DD):    ${maxDrawdown.toFixed(2)}%`);
console.log(`-------------------------------------------------`);
console.log(`- 총 진입 횟수 (Trades): ${trades}회`);
if (trades > 0) {
    console.log(`- 승률 (Win Rate):       ${((wins / trades) * 100).toFixed(1)}%`);
}
console.log("=================================================");
