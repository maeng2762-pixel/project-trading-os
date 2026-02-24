export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface IndicatorState {
    rsi: number;
    ema20: number;
    ema50: number;
    ema200: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface AnalysisResult {
    score: number; // 0-100 (Legacy)
    bullishProb: number; // 0-100%
    bearishProb: number; // 0-100%
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    reasons: string[];
    explanation: string; // Detailed narrative
    reasoning_plain?: string; // One-line simple explanation (v3.0)
    actionGrade?: 'S' | 'A' | 'B' | 'C' | 'F'; // (v5.0)
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    atr: number;
    currentPrice?: number;
    recommendedSize: number; // Percentage 0-100
    isCapped: boolean; // True if Safety Cap applied
    recommendedLeverage: number;
    recommendedSL: number;
    recommendedTP: number;
    details: {
        '5m'?: IndicatorState;
        '15m'?: IndicatorState;
        '1h'?: IndicatorState;
        '4h'?: IndicatorState;
        '1d'?: IndicatorState;
    };
}

// --- Basic Indicator Functions ---

const calculateRSIArray = (prices: number[], period: number = 14): number[] => {
    const results: number[] = [];
    if (prices.length < period + 1) return results;

    let gains = 0;
    let losses = 0;

    // Initial avg
    for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // First RSI
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    results.push(100 - (100 / (1 + rs)));

    // Subsequent
    for (let i = period + 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        const currentGain = diff > 0 ? diff : 0;
        const currentLoss = diff < 0 ? -diff : 0;

        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        results.push(100 - (100 / (1 + rs)));
    }

    return results;
};

const calculateRSI = (prices: number[], period: number = 14): number => {
    const rsiArray = calculateRSIArray(prices, period);
    return rsiArray.length > 0 ? rsiArray[rsiArray.length - 1] : 50;
};

const calculateEMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1];

    const k = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
        ema = (prices[i] * k) + (ema * (1 - k));
    }

    return ema;
};

// --- Advanced Indicators ---

const calculatePivotPoints = (high: number, low: number, close: number) => {
    const pp = (high + low + close) / 3;
    const r1 = 2 * pp - low;
    const s1 = 2 * pp - high;
    const r2 = pp + (high - low);
    const s2 = pp - (high - low);
    return { pp, r1, s1, r2, s2 };
};

const calculateFibonacciLevels = (high: number, low: number, direction: 'UP' | 'DOWN') => {
    const diff = high - low;
    if (direction === 'UP') {
        // Retracement from High down to Low? No, Trend UP means Low to High. Retracement is down.
        // If Trend is UP (Low -> High), Retracement levels are below High.
        return {
            fib236: high - (diff * 0.236),
            fib382: high - (diff * 0.382),
            fib500: high - (diff * 0.5),
            fib618: high - (diff * 0.618), // Golden Pocket
            fib786: high - (diff * 0.786)
        };
    } else {
        // Trend DOWN (High -> Low), Retracement levels are above Low.
        return {
            fib236: low + (diff * 0.236),
            fib382: low + (diff * 0.382),
            fib500: low + (diff * 0.5),
            fib618: low + (diff * 0.618),
            fib786: low + (diff * 0.786)
        };
    }
};

const findSwingPoints = (highs: number[], lows: number[], period: number = 20) => {
    // Simple Swing High/Low detection
    // Let's find the highest high and lowest low in the last N periods
    // Excluding the most recent few candles to confirm the swing
    const recentHighs = highs.slice(-(period + 2), -2); // Exclude last 2 for confirmation
    const recentLows = lows.slice(-(period + 2), -2);

    const swingHigh = Math.max(...recentHighs);
    const swingLow = Math.min(...recentLows);

    return { swingHigh, swingLow };
};
const detectDivergence = (prices: number[], rsiArray: number[], period: number = 14) => {
    // Look for Divergence in last 10 periods
    if (prices.length < 20 || rsiArray.length < 20) return null;

    // Simple Slope Check (Last 10 vs Last 5)

    const recentPrice = prices[prices.length - 1];
    const oldPrice = prices[prices.length - 10];

    const recentRSI = rsiArray[rsiArray.length - 1];
    const oldRSI = rsiArray[rsiArray.length - 10];

    // Bearish Div: Price Higher, RSI Lower
    if (recentPrice > oldPrice && recentRSI < oldRSI && recentRSI > 60) {
        return "Bearish Divergence (하락 다이버전스)";
    }

    // Bullish Div: Price Lower, RSI Higher
    if (recentPrice < oldPrice && recentRSI > oldRSI && recentRSI < 40) {
        return "Bullish Divergence (상승 다이버전스)";
    }

    return null;
};

const calculateATR = (highs: number[], lows: number[], closes: number[], period: number = 14): number => {
    if (highs.length < period + 1) return 0;

    let trSum = 0;
    // True Range for the first available period
    for (let i = 1; i < period + 1; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        trSum += Math.max(hl, hc, lc);
    }

    let atr = trSum / period;

    // Smoothed ATR
    for (let i = period + 1; i < highs.length; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        const tr = Math.max(hl, hc, lc);
        atr = ((atr * (period - 1)) + tr) / period;
    }

    return atr;
};

// --- Main Engine ---

export const AnalysisEngine = {
    analyze: (candlesMap: { [key: string]: Candle[] }): AnalysisResult => {
        const timeframes = ['5m', '15m', '1h', '4h'];
        const details: any = {};

        // Primary Timeframe for Signal (using 1h for now as main anchor)
        const mainTF = '1h';
        const mainCandles = candlesMap[mainTF];

        if (!mainCandles || mainCandles.length < 200) {
            return {
                score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', reasons: ['Insufficient Data'],
                explanation: "데이터 수집 중입니다...", details: {}, riskLevel: 'HIGH', atr: 0,
                recommendedSize: 0, isCapped: false, recommendedLeverage: 1, recommendedSL: 0, recommendedTP: 0
            } as any;
        }

        const closes = mainCandles.map(c => c.close);
        const highs = mainCandles.map(c => c.high);
        const lows = mainCandles.map(c => c.low);
        const volumes = mainCandles.map(c => c.volume);

        const currentPrice = closes[closes.length - 1];

        // 1. Indicators Calculation
        const rsiArray = calculateRSIArray(closes, 14);
        const rsi = rsiArray.length > 0 ? rsiArray[rsiArray.length - 1] : 50;
        const ema20 = calculateEMA(closes, 20);
        const ema50 = calculateEMA(closes, 50);
        const ema200 = calculateEMA(closes, 200);
        const atr = calculateATR(highs, lows, closes, 14);

        // Advanced Indicators
        const divergence = detectDivergence(closes, rsiArray);
        const { swingHigh, swingLow } = findSwingPoints(highs, lows);
        const pivotPoints = calculatePivotPoints(highs[highs.length - 2], lows[lows.length - 2], closes[closes.length - 2]);

        // 2. Risk Level Calculation
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        const atrPercent = (atr / currentPrice) * 100;
        if (atrPercent < 0.5) riskLevel = 'LOW';
        else if (atrPercent < 1.5) riskLevel = 'MEDIUM';
        else riskLevel = 'HIGH';

        // 3. Scoring Logic (The Brain)
        const reasons: string[] = [];

        // --- Phase 11: Multi-Timeframe Confluence (The Compass) ---
        // V6.0: "The Compass" - If 4H/1D bias contradicts 1H, we do NOT trade.
        // We define Trend Bias based on EMA 50 vs EMA 200
        const getTrendBias = (tfCandles: Candle[] | undefined): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
            if (!tfCandles || tfCandles.length < 200) return 'NEUTRAL';
            const cCloses = tfCandles.map(c => c.close);
            const _ema50 = calculateEMA(cCloses, 50);
            const _ema200 = calculateEMA(cCloses, 200);
            const _price = cCloses[cCloses.length - 1];

            if (_price > _ema200 && _ema50 > _ema200) return 'BULLISH';
            if (_price < _ema200 && _ema50 < _ema200) return 'BEARISH';
            return 'NEUTRAL';
        };

        const bias1d = getTrendBias(candlesMap['1d']);
        const bias4h = getTrendBias(candlesMap['4h']);
        // 1H Bias is calculated below in Trend Score, but let's pre-calculate for confluence check
        const bias1h = getTrendBias(mainCandles);

        let isConfluenceRejected = false;

        // Strict Rule: If 1D is Bullish, we cannot Short. If 1D is Bearish, we cannot Long.
        // (Neutral 1D allows both if 4H aligns)

        let allowedDirection: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH';

        if (bias1d === 'BULLISH') allowedDirection = 'LONG';
        else if (bias1d === 'BEARISH') allowedDirection = 'SHORT';

        // Refine with 4H
        if (allowedDirection === 'LONG' && bias4h === 'BEARISH') allowedDirection = 'BOTH'; // Conflict? Actually conflict usually means Wait.
        // Let's go simple: "The Compass" -> 1D is the Law.

        // We will apply this filter AFTER raw score calculation to force Neutral.

        // A. Trend Score (1H)
        let trendScore = 50;
        if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200) {
            trendScore = 100; reasons.push("Perfect Bullish Trend (EMA 20>50>200)");
        } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200) {
            trendScore = 0; reasons.push("Perfect Bearish Trend (EMA 20<50<200)");
        } else if (currentPrice > ema50) trendScore = 60;
        else trendScore = 40;

        // B. Volume Score
        let volumeScore = 50;
        const avgVol = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
        const currentVol = volumes[volumes.length - 1];
        if (currentVol > avgVol * 1.5) {
            volumeScore = trendScore > 50 ? 80 : 20;
            reasons.push("Volume Spike Detected");
        }

        // C. RSI Score
        let rsiScore = 50;
        if (rsi < 30) { rsiScore = 80; reasons.push(`RSI Oversold (${rsi.toFixed(0)})`); }
        else if (rsi > 70) { rsiScore = 20; reasons.push(`RSI Overbought (${rsi.toFixed(0)})`); }
        else if (rsi >= 40 && rsi <= 60) rsiScore = 60;

        // Divergence Impact
        if (divergence) {
            if (divergence.includes("Bullish")) { rsiScore = 90; reasons.push(divergence); }
            else if (divergence.includes("Bearish")) { rsiScore = 10; reasons.push(divergence); }
        }

        // D. Price Action (Pattern)
        let patternName = "";
        let patternScore = 0;
        const prevCandle = mainCandles[mainCandles.length - 2];
        const currCandle = mainCandles[mainCandles.length - 1];
        const getBody = (c: Candle) => Math.abs(c.close - c.open);
        const isBullish = (c: Candle) => c.close > c.open;
        const body = getBody(currCandle);
        const lower = Math.min(currCandle.open, currCandle.close) - currCandle.low;
        const upper = currCandle.high - Math.max(currCandle.open, currCandle.close);

        // Pinbar
        if (lower > body * 2 && upper < body * 0.5) { patternName = "Institutional Pinbar (망치형)"; patternScore = 15; }
        else if (upper > body * 2 && lower < body * 0.5) { patternName = "Institutional Pinbar (유성형)"; patternScore = -15; }

        // Engulfing
        if (body > getBody(prevCandle) && isBullish(currCandle) !== isBullish(prevCandle)) {
            if (isBullish(currCandle)) { patternName = "Order Block Engulfing (장악형)"; patternScore = 20; }
            else { patternName = "Order Block Engulfing (하락 장악형)"; patternScore = -20; }
        }

        if (patternName) reasons.push(patternName);

        // Final Score Calculation
        // Base Score
        let rawScore = (trendScore * 0.4) + (volumeScore * 0.2) + (rsiScore * 0.2) + 50 * 0.2; // Sentiment default 50
        rawScore += patternScore;

        // Clamp 0-100
        rawScore = Math.max(0, Math.min(100, rawScore));

        // 4. Direction & Probability Logic (v2.0)
        // Bullish Prob = Raw Score
        // Bearish Prob = 100 - Raw Score
        const bullishProb = Math.floor(rawScore);
        const bearishProb = 100 - bullishProb;

        let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';

        // Neutral Cutoff: < 60% probability is Neutral
        if (bullishProb >= 60) direction = 'LONG';
        else if (bearishProb >= 60) direction = 'SHORT';
        else direction = 'NEUTRAL';

        // --- Confluence Check Application ---
        if (direction === 'LONG' && allowedDirection === 'SHORT') {
            isConfluenceRejected = true;
            direction = 'NEUTRAL';
            reasons.unshift(`⛔ 1D Trend Conflict (Daily is Bearish)`);
        } else if (direction === 'SHORT' && allowedDirection === 'LONG') {
            isConfluenceRejected = true;
            direction = 'NEUTRAL';
            reasons.unshift(`⛔ 1D Trend Conflict (Daily is Bullish)`);
        }
        // ------------------------------------

        // 5. Position Sizing & Safety Cap (v2.0)
        // HP1 Proxy: (WinRate - 50) * 2. 
        // Example: 65% win rate -> (15) * 2 = 30% HP1.
        // Safety Cap: Min(HP1, 20%)
        let winRateProxy = direction === 'LONG' ? bullishProb : direction === 'SHORT' ? bearishProb : 50;
        let hp1Size = 0;

        if (winRateProxy > 50) {
            hp1Size = (winRateProxy - 50) * 2; // Simple HP1-like scaler
        }

        // Apply Safety Cap (Naval's Law) - Max 20%
        const SAFETY_CAP = 20; // 20% max size
        let recommendedSize = Math.min(hp1Size, SAFETY_CAP);
        recommendedSize = Math.max(0, recommendedSize);

        const isPositiveEdge = hp1Size > 0;
        const isCapped = hp1Size > SAFETY_CAP;

        // Leverage
        const slDistPercent = (atr * 2) / currentPrice;
        let recommendedLeverage = Math.max(1, Math.min(5, 0.01 / slDistPercent));

        // 6. SL & TP (Legal Terms: Invalidation & Stat Resistance)
        let recommendedSL = 0;
        let recommendedTP = 0;
        let rewardRatio = 2.0;

        if (Math.abs(rawScore - 50) > 30) rewardRatio += 1.0; // Strong signal bonus

        if (direction === 'LONG') {
            recommendedSL = currentPrice - (atr * 2);
            recommendedTP = currentPrice + (atr * 2 * rewardRatio);
        } else if (direction === 'SHORT') {
            recommendedSL = currentPrice + (atr * 2);
            recommendedTP = currentPrice - (atr * 2 * rewardRatio);
        }

        // --- Phase 11: Real EV Engine (The Cost Filter) ---
        // V6.0: "Avoid Ruin" - If expected return < cost * 3, DO NOT TRADE.
        const TRADING_FEE = 0.0008; // 0.08% (Round trip)
        const SLIPPAGE = 0.0005;    // 0.05% (Conservative)
        const TOTAL_COST = TRADING_FEE + SLIPPAGE;
        const COST_THRESHOLD = TOTAL_COST * 3; // 0.39%

        const expectedReturn = direction === 'NEUTRAL' ? 0 : (atr * 2 * rewardRatio) / currentPrice;
        let isCostRejected = false;

        if (direction !== 'NEUTRAL' && expectedReturn < COST_THRESHOLD) {
            isCostRejected = true;
            direction = 'NEUTRAL'; // FORCE NEUTRAL
            recommendedSize = 0;
            reasons.unshift(`⛔ EV < Cost (Expect ${expectedReturn.toFixed(4)} < Threshold ${COST_THRESHOLD.toFixed(4)})`);
        }

        // 7. Text Generation (Term Reform)
        let explanation = "";

        // --- 1. Bias & Probability ---
        const biasEmoji = direction === 'LONG' ? '🐮' : direction === 'SHORT' ? '🐻' : '☁️';
        const biasText = direction === 'LONG' ? '상승 우위 (Bullish Bias)' : direction === 'SHORT' ? '하락 우위 (Bearish Bias)' : '관망 (Neutral)';

        explanation += `### ${isCostRejected ? '⛔' : biasEmoji} ${biasText}\n`;
        explanation += `**상승 확률 ${bullishProb}%** vs **하락 확률 ${bearishProb}%**\n\n`; // Plain text fallback, UI will use Bar code

        // --- 2. 3-Line Summary ---
        explanation += `📋 **AI 3줄 요약**\n`;
        if (isCostRejected) {
            explanation += `1. **시장 바이어스**: 방향성은 보이나 **수익성이 없습니다**.\n`;
            explanation += `2. **기대 수익**: ${expectedReturn.toFixed(4)} (비용 임계값 ${COST_THRESHOLD.toFixed(4)} 미달)\n`;
            explanation += `3. **행동 지침**: ⛔ **NO TRADE** (수수료를 이기지 못하는 구간입니다)\n\n`;
        } else if (isConfluenceRejected) {
            explanation += `1. **시장 바이어스**: 단기 신호(${direction})가 대추세(1D ${bias1d})와 충돌합니다.\n`;
            explanation += `2. **나침반(Compass)**: 1D(${bias1d}) vs 4H(${bias4h}) vs 1H(${bias1h})\n`;
            explanation += `3. **행동 지침**: ⛔ **NO TRADE** (거대한 흐름을 거스르지 마십시오)\n\n`;
        } else {
            explanation += `1. **시장 바이어스**: ${biasText} (확률: ${Math.max(bullishProb, bearishProb)}%)\n`;
            explanation += `2. **나침반(Compass)**: 1D ${bias1d === 'BULLISH' ? '↗️' : bias1d === 'BEARISH' ? '↘️' : '➡️'} | 4H ${bias4h === 'BULLISH' ? '↗️' : bias4h === 'BEARISH' ? '↘️' : '➡️'}\n`;
            explanation += `3. **핵심 근거**: ${reasons[0] ? reasons[0] : '뚜렷한 신호 없음'} \n`;

            const actionText = direction === 'LONG' ? '눌림목 매수 (Long Dip)' : direction === 'SHORT' ? '반등 매도 (Short Rip)' : '휴식 추천';
            explanation += `4. **행동 지침**: ${actionText}`;
            if (isCapped) explanation += ` (⚠️ 리스크 제한: 최대 20%)\n\n`;
            else explanation += `\n\n`;
        }

        explanation += `--- \n\n`;

        // --- 3. Beginner Guide ---
        explanation += `💡 **쉬운 설명**\n`;
        if (isCostRejected) {
            explanation += `- "방향은 맞을 수 있으나, 변동성이 너무 작아 수수료 떼고 나면 남는 게 없습니다. 이런 자리에서 매매하면 계좌가 서서히 녹습니다(Bleeding)."\n`;
        } else if (direction === 'NEUTRAL') {
            explanation += `- "지금은 싸움의 승자가 정해지지 않았습니다. 애매할 땐 쉬는 것이 돈 버는 것입니다."\n`;
        } else {
            const strength = Math.max(bullishProb, bearishProb);
            explanation += `- "현재 ${direction === 'LONG' ? '매수세' : '매도세'}가 ${strength}% 로 우위입니다. 통계적 우위를 점유하세요."\n`;
        }

        if (isCapped && !isCostRejected) explanation += `- **⚠️ 안전장치 발동**: 높은 확률일지라도 한 번에 파산하지 않기 위해 비중을 20%로 제한했습니다.\n`;

        explanation += `\n--- \n\n`;

        // --- 4. Pro Data (Legal Terms) ---
        explanation += `📊 **전문가 데이터**\n`;
        explanation += `- **관심 구간 (Watch Zone)**: 현재가 부근\n`;
        explanation += `- **무효화 레벨 (Invalidation)**: ${recommendedSL.toFixed(2)}\n`;
        explanation += `- **통계적 저항선 (Stat. TP)**: ${recommendedTP.toFixed(2)}\n`;
        explanation += `- **중요 가격 (Key Levels)**: Pivot ${pivotPoints.pp.toFixed(2)}\n`;

        const riskKr = riskLevel === 'HIGH' ? '높음' : riskLevel === 'MEDIUM' ? '보통' : '낮음';
        explanation += `- **변동성 (Vol)**: ${riskKr} (ATR ${atr.toFixed(1)})\n`;
        if (isCostRejected) explanation += `- **Real EV Status**: 🩸 Negative (Fee Drag)\n`;
        else explanation += `- **Real EV Status**: ✅ Positive (> Cost * 3)\n`;

        // Populate Details
        details['1h'] = { rsi, ema20, ema50, ema200, trend: trendScore > 50 ? 'BULLISH' : 'BEARISH' };

        // 8. Plain English Translator (HP1 v3.0) & Action Grade (v5.0)
        let reasoning_plain = "";
        let actionGrade: 'S' | 'A' | 'B' | 'C' | 'F' = 'F';

        // Logic: Combine Indicators into One Sentence & Grade
        if (isCostRejected) {
            actionGrade = 'F'; // Force F
            reasoning_plain = "⛔ [관망] 기대 수익이 수수료+슬리피지 비용보다 낮습니다. (EV < Cost)";
        } else if (direction === 'LONG') {
            if (currentPrice > ema200 && currentVol > avgVol * 1.5 && trendScore === 100 && rsi < 60) {
                actionGrade = 'S';
                reasoning_plain = "🚀 [S급] 장기 추세 + 거래량 폭발 + 정배열. 강력 매수 기회 (비중 50% 권장).";
            } else if (trendScore >= 80 && currentVol > avgVol * 1.2) {
                actionGrade = 'A';
                reasoning_plain = "✅ [A급] 추세와 수급이 일치합니다. 분할 진입 권장 (비중 30%).";
            } else if (rsi < 30) {
                actionGrade = 'B';
                reasoning_plain = "📉 [B급] 과매도 반등(Mean Reversion) 시도. 소액 진입 (비중 10%).";
            } else if (trendScore > 50) {
                actionGrade = 'C';
                reasoning_plain = "⚠️ [C급] 상승 우위이나 모멘텀이 약합니다. 관망하거나 매우 적게 진입하세요.";
            } else {
                reasoning_plain = "⛔ 조건 불충분. 자본을 지키십시오.";
            }
        } else if (direction === 'SHORT') {
            if (currentPrice < ema200 && currentVol > avgVol * 1.5 && trendScore === 0 && rsi > 40) {
                actionGrade = 'S';
                reasoning_plain = "📉 [S급] 주요 지지 붕괴 + 거래량 실림 + 역배열. 강력 매도 기회 (비중 50%).";
            } else if (trendScore <= 20 && currentVol > avgVol * 1.2) {
                actionGrade = 'A';
                reasoning_plain = "✅ [A급] 하락 추세와 매도세가 일치합니다. 반등 시 매도 (비중 30%).";
            } else if (rsi > 70) {
                actionGrade = 'B';
                reasoning_plain = "🔥 [B급] 과열권(RSI > 70) 도달. 기술적 조정 기대 (비중 10%).";
            } else if (trendScore < 50) {
                actionGrade = 'C';
                reasoning_plain = "⚠️ [C급] 하락 우위이나 신호가 혼잡합니다. 보수적 접근 필요.";
            } else {
                reasoning_plain = "⛔ 조건 불충분. 쉬는 것도 투자입니다.";
            }
        } else {
            // Neutral
            actionGrade = 'F';
            if (atrPercent < 0.5) {
                reasoning_plain = "💤 [F급] 변동성 실종(Low Vol). 폭풍 전의 고요. 절대 진입 금지.";
            } else {
                reasoning_plain = "⚖️ [F급] 방향성 부재. 관망이 최고의 수익입니다.";
            }
        }

        return {
            score: Math.floor(rawScore),
            bullishProb,
            bearishProb,
            direction,
            reasons: reasons.slice(0, 3),
            explanation, // Consider moving bulky text generation to client-side too if bandwidth is concern, but for now keep here
            reasoning_plain,
            actionGrade,
            details,
            riskLevel,
            atr,
            // recommendedSize, // MOVED to calculatePersonalRisk
            // recommendedLeverage, // MOVED to calculatePersonalRisk
            // recommendedSL, // MOVED to calculatePersonalRisk
            // recommendedTP, // MOVED to calculatePersonalRisk
            // isCapped // MOVED
        } as any; // Cast as any because we are changing the return shape potentially, but let's keep it compatible if possible or update interface
    },



    // 8. [New v9.0] Personal Risk Calculator (Live Balance 1.5% Risk)
    calculatePersonalRisk: (
        signal: AnalysisResult,
        balance: number,
        currentPrice: number,
        mode: 'BLUE' | 'RED' = 'BLUE'
    ): { margin: number; leverage: number; sl: number; tp: number; reason: string; isPyramidEligible?: boolean } => {

        if (signal.actionGrade === 'F') {
            return { margin: 0, leverage: 0, sl: 0, tp: 0, reason: "Signal Grade F. Do not trade." };
        }

        // SL/TP logic remains pure technical (ATR based)
        const atr = signal.atr || (currentPrice * 0.01);
        const slDist = atr * 1.5;

        // [Phase 16] Aggressive 1:5 R:R for High Conviction (S-Grade)
        const isHighConviction = signal.actionGrade === 'S';
        const tpDist = isHighConviction ? (slDist * 5.0) : (atr * 3.0);

        let sl = 0, tp = 0;
        if (signal.direction === 'LONG') {
            sl = currentPrice - slDist;
            tp = currentPrice + tpDist;
        } else if (signal.direction === 'SHORT') {
            sl = currentPrice + slDist;
            tp = currentPrice - tpDist;
        }

        const slPercent = slDist / currentPrice;

        // Leverage based on confidence
        let leverage = isHighConviction ? 5 : (signal.actionGrade === 'A' ? 3 : 2); // Aggressive 5x for S-Grade

        if (mode === 'RED') {
            leverage = 1; // Training wheels
        }

        // Allowed Max Loss based on Live Balance
        // [Phase 16] 2.0% for S-Grade Capital, else 1.5%
        let maxRiskPct = mode === 'BLUE' ? (isHighConviction ? 0.020 : 0.015) : 0.005;
        const maxLossUSDT = balance * maxRiskPct;

        // Position Size ($) to hit exact max loss at SL
        // positionSize * slPercent = maxLossUSDT
        const positionSizeUSDT = maxLossUSDT / slPercent;

        // Margin = Position Size / Leverage
        let marginUSDT = positionSizeUSDT / leverage;

        // Hard Cap on Margin (e.g. no more than 20% of balance)
        const maxMarginCap = balance * 0.20;
        if (marginUSDT > maxMarginCap) {
            marginUSDT = maxMarginCap;
        }

        const isPyramidEligible = isHighConviction;

        const reason = `[${mode}] ${isHighConviction ? '🔥 S급 공격 진입: ' : ''}Max Risk ${maxRiskPct * 100}% ($${maxLossUSDT.toFixed(1)}). SL ${slDist.toFixed(1)} points away. Set Margin to $${marginUSDT.toFixed(0)} with ${leverage}x Lev.`;

        return { margin: marginUSDT, leverage, sl, tp, reason, isPyramidEligible };
    },

    // 6. Generate Position Advice (Consistency Protocol)
    generatePositionAdvice: (position: any, analysis: AnalysisResult, lang: 'ko' | 'en' = 'en'): { advice: string, action: 'HOLD' | 'REDUCE' | 'CLOSE' | 'TP_ADJUST' } => {
        // Default
        let advice = lang === 'ko'
            ? "포지션 유지. 기존 관점 유효함. 계획을 따르세요."
            : "Holding position. Thesis is still valid. Stick to the plan.";
        let action: 'HOLD' | 'REDUCE' | 'CLOSE' | 'TP_ADJUST' = 'HOLD';

        if (!analysis || analysis.direction === 'NEUTRAL') return { advice, action };

        const isLong = position.type === 'LONG';
        const isContrary = (isLong && analysis.direction === 'SHORT') || (!isLong && analysis.direction === 'LONG');
        const score = analysis.score;

        // CASE C: Noise (Score 40-60) -> Hold
        if (score >= 40 && score <= 60) {
            advice = lang === 'ko'
                ? "단기 노이즈 발생. 원래 계획을 유지하세요. 흔들리지 마십시오."
                : "Market noise detected. Stick to original plan. Do not waver.";
            action = 'HOLD';
        }

        // CASE A: Weakening (Same direction but low score, or slight contrary)
        if (!isContrary && score < 70) {
            advice = lang === 'ko'
                ? "추세 힘이 약해지고 있습니다. 익절가(Take Profit)를 현재가 근처로 당기세요."
                : "Trend is weakening. Tighten your Take Profit to near current price.";
            action = 'TP_ADJUST';
        }

        // CASE B: Fatal Reversal
        if (isContrary) {
            if (score >= 60) {
                advice = lang === 'ko'
                    ? `치명적 반전 감지 (${analysis.direction} 우위 ${score}%). 즉시 청산하거나 스탑로스를 본전으로 옮기세요.`
                    : `Fatal Reversal Detected (${analysis.direction} Dominance ${score}%). Close immediately or move SL to Break Even.`;
                action = 'CLOSE';
            } else {
                // Weak contrary
                advice = lang === 'ko'
                    ? "반대 방향 신호가 감지되나 아직 약합니다. 주의 깊게 관찰하십시오."
                    : "Contrary signal detected but weak. Monitor closely.";
                action = 'HOLD';
            }
        }

        return { advice, action };
    }
};
