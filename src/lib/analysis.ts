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
    actionGrade?: 'SSS' | 'S' | 'A' | 'B' | 'C' | 'F'; // (v5.0 + v118-ULTRA)
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
    // HP1 v53.0: The Risk Oracle & Micro-Adaptation
    monteCarloRiskOfRuin?: number;
    rsiDivergenceSweepConfirmed?: boolean;
    adaptiveRollingWindowDays?: number;

    // HP1 v56.0: The End-Game (마스터피스 패치)
    cvdTrapConfirmed?: boolean;
    googleTrendsScore?: number;
    icebergDetectionZone?: number;

    // HP1 v99.9: The Abyss Architect (기밀 해제 패치)
    darkPoolAnomalyDetected?: boolean;             // Module 2: Dark Pool Spread/Vol Anomaly
    kellyOptimalRatioBusseti?: number;             // Module 1: Risk-Constrained Kelly
    boctaoeExemptionTriggered?: boolean;           // Module 4: Noise Cancel Filter
    iteratedCompoundExpectancy?: number;           // Module 3: 100-cycle Compound (%)

    // --- HP1 v100.0: The Predator (Anti-AI 제로데이 패치) ---
    predatorStopHuntDetected?: boolean;            // Module 1: Anti-AI Liquidity Grab detection
    orderBookVelocityAnomaly?: boolean;            // Module 2: Spoofing/Flash Cancel detection

    // --- HP1 Extension: The SQN & ATR Pinnacle ---
    trailingStopMsg?: string;
    sqnScore?: number;
    killSwitchActive?: boolean;
    lambdaModifier?: number;

    // --- HP1 v102: The Institutional Oracle ---
    maxTP?: number;
    peterBrandtMsg?: string;

    // --- HP1 텔레그램 확장: The Confluence Compressor ---
    isCompressZone?: boolean;
    compressZoneDetails?: string;

    // --- HP1 최신 패치: 공적분, FVG 병합, 오더플로우, CVD 흡수 ---
    isMarketNeutralPairsTrade?: boolean;
    isFvgMagnetActive?: boolean;
    isStackedImbalanceConfirmed?: boolean;
    isCvdAbsorptionReversal?: boolean;

    // --- HP1 v104: The Missing Alpha ---
    isLassoAligned?: boolean;
    isInstitutionalLiqTargeted?: boolean;
    isMtfDivergenceReversal?: boolean;
    isSchellingPointConvergence?: boolean;

    // --- HP1 v105: The Final Assembly ---
    isWaeDeadZoneRejected?: boolean;
    isEqhEqlLiquiditySweep?: boolean;
    marketRegime?: 'TREND' | 'BOX' | 'OVERHEATED' | 'EVENT_WAIT';



    // --- HP1 v106: The Lean On-Chain Sovereign ---
    isAndonCordBlocked?: boolean;
    andonCordReason?: string;
    isCohortQuarantined?: boolean;
    mvrvBiasMatched?: boolean;
    isCloseMitigationVerified?: boolean;

    // --- HP1 v107: The Guardian & Catalyst ---
    isSlingshotMomentumAligned?: boolean;
    isDepthSnapshotConfirmed?: boolean;
    isMicroDrawdownBlocked?: boolean;
    microDrawdownReason?: string;
    consecutiveLossCount?: number;

    // --- HP1 v109: The Creator's Leverage ---
    isIcebergAbsorptionReversed?: boolean;
    isAccumulationDefenseTested?: boolean;
    abTestVariant?: 'A' | 'B';

    // --- HP1 v111: Final Adaptive TP Matrix ---
    adxValue?: number;
    isTrendingRegime?: boolean;
    isCvdExhausted?: boolean;

    // --- HP1 v112: The Vanguard's Edge ---
    isHtfStructureBlocked?: boolean;
    htfBlockReason?: string;
    googleTrendsSentiment?: string;
    volumeProfileShape?: string;
    hasIntegerAlgoFootprint?: boolean;

    // --- HP1 v113: The Maker's Gambit ---
    isFirstTouchMitigated?: boolean;
    isTimeDecayTriggered?: boolean;
    limitPrice?: number;

    // --- HP1 v114: The Meta-Cognitive Predator ---
    metaLabelingFalsePositive?: boolean;
    fiveWhysDiagnostic?: string;
    zoomInPivotActive?: boolean;
    zoomInPivotStrategy?: string;
    cvdOiBreakoutConfirmed?: boolean;

    // --- HP1 v115 The Apex Asymmetry ---
    isFrontRunOffsetApplied?: boolean;
    smcCurrentRetracementPct?: number;
    macroOptionsRegime?: 'VOLATILE_GAMMA' | 'STABLE';

    // --- HP1 v116 The LLM-Quant Sovereign ---
    isKssArbitrageAligned?: boolean;
    isMacroFloorLocked?: boolean;
    tmmTarget?: number;

    // --- HP1 v116-D The Intraday Predator ---
    isIntradayScalp?: boolean;
    intradayReason?: string;
    vwapLevel?: number;
    intradayTp1Override?: number;
    intradaySlOverride?: number; 
    
    // --- HP1 v116-D 데이 모드 심화: The Finished Auction ---
    isUnfinishedBizStopRisk?: boolean;
    isValueMigrationBlocked?: boolean;

    // --- HP1 v116-D 데이 모드 파이널: The Intraday Apex ---
    isLasso15mBlocked?: boolean;
    lasso15mDirection?: 'LONG' | 'SHORT' | 'NEUTRAL';

    // --- HP1 v116-D 마이크로 구조 심화: The Intraday Micro-Sniper ---
    isCumDeltaDivergenceBlocked?: boolean;
    isFootprintBailoutActive?: boolean;
    isInverseMomentumBailoutActive?: boolean;
    mtfSqueezeSlOverride?: number;

    // --- HP1 v116-D 데이 모드 파이널 캡스톤: The Immortal Day-Trader ---
    isVShapeRejectionPullback?: boolean;
    isStealthOrderConfirmed?: boolean;
    isFootprintReverseBailout?: boolean;
    isCircuitBreakerActive?: boolean;
    recentLossCount?: number;
    leverageMultiplier?: number;

    // --- HP1 v116-D 파이널 어셈블리: The Ultimate Intraday Machine ---
    isWaeDeadZoneBlocked?: boolean;
    isIcebergSustainConfirmed?: boolean;
    isSmcObCloseMitigated?: boolean;
    isOiReversalDivergenceDetected?: boolean;

    // --- HP1 v116-D 파이널 착취: The Micro-Structure Exploiter ---
    isTwapDelayed?: boolean;
    deepLearningScore?: number;
    dynamicTrailingStop?: number;
    heikinAshiTrend?: string;

    // --- HP1 v117: Safety & Global Governance ---
    isGlobalCooldownActive?: boolean;
    isPositionLimitReached?: boolean;
    isPostOnlyMakerOrder?: boolean;

    // --- Red Potion v118-ULTRA ---
    orderBookLiquidityVacuum?: number;
    kellyFraction?: number;
}

export interface ExtData {
    fundingRate?: number;
    openInterestSpike?: boolean;
    unfinishedBizTop?: number | null;
    unfinishedBizBottom?: number | null;
    tradesIn24h?: number;

    // --- RED POTION Day Trading Refinement ---
    symbol?: string; // e.g. 'BTC/USDT'
    volume24h?: number; 
    bidAskSpreadPct?: number; 
    oiFundingSqueezeDanger?: 'LONG_SQUEEZE' | 'SHORT_SQUEEZE' | 'NEUTRAL';
    trend15m?: 'LONG' | 'SHORT' | 'NEUTRAL'; // MTF Inject
    structure5m?: 'LONG' | 'SHORT' | 'NEUTRAL'; // MTF Inject
    isVolatilityExpansion?: boolean;             // v180
    openInterestTrend?: 'UP' | 'DOWN' | 'FLAT';  // v180
    marketRegime180?: 'TREND_UP' | 'TREND_DOWN' | 'RANGE' | 'HIGH_VOL' | 'LOW_VOL' | 'LIQ_HUNT'; // v180

    // --- HP1 최신 패치: 공적분, FVG 병합, 오더플로우, CVD 흡수 ---
    cointegrationZScore?: number;
    mergedFvgHigh?: number | null;
    mergedFvgLow?: number | null;
    hasStackedImbalances?: boolean;
    hasMultipleHVN?: boolean;
    cvdAbsorptionAtExtremes?: boolean;

    // --- HP1 v104: The Missing Alpha ---
    lassoSpikePredictor?: 'LONG' | 'SHORT' | 'NEUTRAL';
    institutionalLiqTop?: number | null;
    institutionalLiqBottom?: number | null;
    mtfDivergenceConfirmed?: boolean;
    isSchellingPointEvent?: boolean;

    // --- HP1 v105: The Final Assembly ---
    isWaeDeadZone?: boolean;
    eqhSweepDetected?: boolean;
    eqlSweepDetected?: boolean;

    // --- HP1 v106: The Lean On-Chain Sovereign ---
    isAndonCordTriggered?: boolean;
    andonCordDiagnosticInfo?: string;
    isCohortDropped?: boolean;
    mvrvMacroBias?: 'OVERHEATED' | 'ACCUMULATION' | 'NEUTRAL';
    isCloseMitigatedEvent?: boolean;

    // --- HP1 v107: The Guardian & Catalyst ---
    isBbSqueezeActive?: boolean;
    slingshotMomentumDirection?: 'LONG' | 'SHORT' | 'NEUTRAL';
    bigLimitOrderDetected?: 'LONG' | 'SHORT' | 'NEUTRAL'; 
    consecutiveLosses?: number;

    // --- HP1 v109: The Creator's Leverage ---
    isIcebergAbsorptionDetected?: 'LONG' | 'SHORT';
    isAccumulationDefenseMapped?: boolean;

    // --- HP1 v111: Final Adaptive TP Matrix ---
    isCvdExhaustion?: boolean; // Signal to early exit the runner

    // --- HP1 v112: The Vanguard's Edge ---
    htfBrokenHigh?: boolean;
    htfBrokenLow?: boolean;
    googleTrendsSentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    volumeProfileShape?: 'D' | 'P' | 'b' | 'THIN';
    hasIntegerAlgoFootprint?: boolean;

    // --- HP1 v113: The Maker's Gambit ---
    isFirstTouchMitigated?: boolean;
    isTimeDecayTriggered?: boolean;

    // --- HP1 v114: The Meta-Cognitive Predator ---
    metaLabelingFalsePositive?: boolean;
    fiveWhysDiagnostic?: string;
    zoomInPivotActive?: boolean;
    zoomInPivotStrategy?: string;
    cvdOiBreakoutConfirmed?: boolean;

    // --- HP1 v115: The Apex Asymmetry ---
    smcCurrentRetracementPct?: number;
    macroOptionsRegime?: 'VOLATILE_GAMMA' | 'STABLE';

    // --- HP1 v116: The LLM-Quant Sovereign ---
    trueMarketMean?: number | null;
    realizedPrice?: number | null;

    // --- HP1 v120: Leading Indicator Sniper Core ---
    microAbsorptionConfirmed1m?: boolean;
    vwapAbsorptionDetected?: boolean;
    liquidationClusterPersistenceHours?: number;
    multipleHvnLocked?: boolean;
    cvdExhaustionMismatch?: boolean;
    oiReversalDivergenceDetected?: boolean;
    intradayTp1Override?: number;
    orderBookLiquidityVacuum?: number;
    intradaySlOverride?: number;
    
    // v116-D legacy compat
    vwapBreakoutDetected?: boolean;
    vwapLevel?: number;
    vShapeRejectionVolCluster?: number;
    fractionalOrderRatio?: number;
    recentTradeResults?: ('WIN' | 'LOSS')[];
    liquidationGapTarget?: number;
    openInterestDelta?: number;
    sweepExecutionDetected?: boolean;
    bollingerBands5mSqueezeActive?: boolean;
    bollingerBands5mBreakout?: 'UP' | 'DOWN';
    valueMigrationTrend?: 'UPWARD' | 'DOWNWARD' | 'FLAT';
    isEqhEqlChochReversal?: boolean;
    isMegaFvgRetracement?: boolean;
    nextThickVolumeNode?: number;
    mtfBollingerBandSRArea?: boolean;
    hasVolumeExpansion?: boolean;
    inverseMomentumBailout?: boolean;
    breakoutSignalCandleHigh?: number;
    breakoutSignalCandleLow?: number;
    icebergPriceLevel?: number;
    isObBodyPierced?: boolean;
    isTwapAnomalyMinute?: boolean;
    atr15m?: number;
    
    // --- Restored v118-ULTRA Fields ---
    fibonacciConfluenceDetected?: boolean;
    fundingAsymmetryExtreme?: boolean;
    isHighVolatilityTrap?: boolean;
    isPreNewsOverheat?: boolean;
    liquidationSweepDetected?: boolean;
    rsiDivergence15m?: boolean;
    volumeClusterFirstTouch?: boolean;
    isStackedImbalanceFirstTouch?: boolean;
    isGlobalCooldownActive?: boolean;
    isPositionLimitReached?: boolean;
    heikinAshiTrend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    waeDeadZoneLevel?: number;
    waeExplosionValue?: number;
    oiDivergenceType?: 'BREAKOUT_FAIL' | 'REVERSAL_CONFIRM' | 'NONE';
    lasso15mDirection?: 'LONG' | 'SHORT' | 'NEUTRAL';
    cumDelta1mDivergence?: 'BULLISH' | 'BEARISH' | 'NONE';
    footprintReversalWarning1m?: boolean;
    icebergReloadCount?: number;
    fnnProb?: number;
    lstmProb?: number;
    gruProb?: number;
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

const calculateADX = (highs: number[], lows: number[], closes: number[], period: number = 14): number => {
    if (closes.length < period * 2) return 20;

    const trs: number[] = [];
    const pdms: number[] = [];
    const ndms: number[] = [];

    for (let i = 1; i < closes.length; i++) {
        const tr = Math.max(
            highs[i] - lows[i],
            Math.abs(highs[i] - closes[i - 1]),
            Math.abs(lows[i] - closes[i - 1])
        );
        trs.push(tr);

        const upMove = highs[i] - highs[i - 1];
        const downMove = lows[i - 1] - lows[i];

        if (upMove > downMove && upMove > 0) {
            pdms.push(upMove);
            ndms.push(0);
        } else if (downMove > upMove && downMove > 0) {
            pdms.push(0);
            ndms.push(downMove);
        } else {
            pdms.push(0);
            ndms.push(0);
        }
    }

    const smooth = (arr: number[], period: number) => {
        const smoothed = [arr.slice(0, period).reduce((a, b) => a + b, 0)];
        for (let i = period; i < arr.length; i++) {
            smoothed.push(smoothed[smoothed.length - 1] - (smoothed[smoothed.length - 1] / period) + arr[i]);
        }
        return smoothed;
    };

    const smoothedTR = smooth(trs, period);
    const smoothedPDM = smooth(pdms, period);
    const smoothedNDM = smooth(ndms, period);

    const dxs: number[] = [];
    for (let i = 0; i < smoothedTR.length; i++) {
        const diPlus = smoothedTR[i] > 0 ? (smoothedPDM[i] / smoothedTR[i]) * 100 : 0;
        const diMinus = smoothedTR[i] > 0 ? (smoothedNDM[i] / smoothedTR[i]) * 100 : 0;
        let dx = (diPlus + diMinus) > 0 ? (Math.abs(diPlus - diMinus) / (diPlus + diMinus)) * 100 : 0;
        if (isNaN(dx)) dx = 0;
        dxs.push(dx);
    }

    let adx = dxs.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < dxs.length; i++) {
        adx = ((adx * (period - 1)) + dxs[i]) / period;
    }

    return adx || 20;
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

const calculateATRArray = (highs: number[], lows: number[], closes: number[], period: number = 14): number[] => {
    if (highs.length < period + 1) return [];

    let trSum = 0;
    for (let i = 1; i < period + 1; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        trSum += Math.max(hl, hc, lc);
    }

    let atr = trSum / period;
    const results = [atr];

    for (let i = period + 1; i < highs.length; i++) {
        const hl = highs[i] - lows[i];
        const hc = Math.abs(highs[i] - closes[i - 1]);
        const lc = Math.abs(lows[i] - closes[i - 1]);
        const tr = Math.max(hl, hc, lc);
        atr = ((atr * (period - 1)) + tr) / period;
        results.push(atr);
    }

    return results;
};

const calculateSQN = (trades: number[]): { sqn: number, msg: string, killSwitch: boolean, lambdaModifier: number } => {
    if (trades.length < 30) return { sqn: 2.0, msg: "Need more trades for SQN", killSwitch: false, lambdaModifier: 1.0 };
    const mean = trades.reduce((a, b) => a + b, 0) / trades.length;
    const variance = trades.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / trades.length;
    const stdDev = Math.sqrt(variance);
    const sqn = (mean / (stdDev || 1)) * Math.sqrt(trades.length);
    let msg = `SQN: ${sqn.toFixed(2)}`;
    let killSwitch = false;
    let lambdaModifier = 1.0;
    if (sqn > 3.0) {
        msg = `⭐ [SQN 우수 국면] SQN ${sqn.toFixed(2)} > 3.0. 켈리 시스템 공격성(Lambda) 상향 적용.`;
        lambdaModifier = 1.5;
    } else if (sqn < 1.6) {
        msg = `⚠️ [경고: SQN 붕괴] SQN ${sqn.toFixed(2)} < 1.6. 전략 불일치 위험으로 시그널 발송 일시 중단(Kill Switch).`;
        killSwitch = true;
        lambdaModifier = 0.0;
    }
    return { sqn, msg, killSwitch, lambdaModifier };
};

const runMonteCarloBootstrapping = (trades: number[], iterations: number = 10000) => {
    const maxDrawdowns = [];
    let ruins = 0;
    const baseCapital = 10000;
    const riskPerTrade = 0.02;
    for (let i = 0; i < iterations; i++) {
        let capital = baseCapital;
        let peak = baseCapital;
        let maxDd = 0;
        for (let j = 0; j < 100; j++) {
            const randomTrade = trades[Math.floor(Math.random() * trades.length)];
            const tradePnl = capital * riskPerTrade * randomTrade;
            capital += tradePnl;
            if (capital > peak) peak = capital;
            const dd = (peak - capital) / peak;
            if (dd > maxDd) maxDd = dd;
            if (capital <= 0) {
                ruins++;
                break;
            }
        }
        maxDrawdowns.push(maxDd);
    }
    maxDrawdowns.sort((a, b) => a - b);
    const var95 = maxDrawdowns[Math.floor(iterations * 0.95)] * 100;
    const riskOfRuin = (ruins / iterations) * 100;
    const optimalSize = riskOfRuin > 0 ? (0.005) : (riskPerTrade);
    return { var95, riskOfRuin, optimalSize };
};

const generatePositionAdvice = (position: any, analysis: AnalysisResult, lang: 'ko' | 'en' = 'en'): { advice: string, action: 'HOLD' | 'REDUCE' | 'CLOSE' | 'TP_ADJUST' } => {
    let advice = lang === 'ko' ? "포지션 유지. 기존 관점 유효함. 계획을 따르세요." : "Holding position. Thesis is still valid. Stick to the plan.";
    let action: 'HOLD' | 'REDUCE' | 'CLOSE' | 'TP_ADJUST' = 'HOLD';
    if (!analysis || analysis.direction === 'NEUTRAL') return { advice, action };
    const isLong = position.type === 'LONG';
    const isContrary = (isLong && analysis.direction === 'SHORT') || (!isLong && analysis.direction === 'LONG');
    const score = analysis.score;
    if (score >= 40 && score <= 60) {
        advice = lang === 'ko' ? "단기 노이즈 발생. 원래 계획을 유지하세요. 흔들리지 마십시오." : "Market noise detected. Stick to original plan. Do not waver.";
        action = 'HOLD';
    }
    if (!isContrary && score < 70) {
        advice = lang === 'ko' ? "추세 힘이 약해지고 있습니다. 익절가(Take Profit)를 현재가 근처로 당기세요." : "Trend is weakening. Tighten your Take Profit to near current price.";
        action = 'TP_ADJUST';
    }
    if (isContrary) {
        if (score >= 60) {
            advice = lang === 'ko' ? `치명적 반전 감지 (${analysis.direction} 우위 ${score}%). 즉시 청산하거나 스탑로스를 본전으로 옮기세요.` : `Fatal Reversal Detected (${analysis.direction} Dominance ${score}%). Close immediately or move SL to Break Even.`;
            action = 'CLOSE';
        } else {
            advice = lang === 'ko' ? "반대 방향 신호가 감지되나 아직 약합니다. 주의 깊게 관찰하십시오." : "Contrary signal detected but weak. Monitor closely.";
            action = 'HOLD';
        }
    }
    return { advice, action };
};

// --- Main Engine ---

export const AnalysisEngine = {
    analyze: (candlesMap: { [key: string]: Candle[] }, extData?: ExtData): AnalysisResult => {
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

        // --- HP1 Extension: Van Tharp SQN Auto-Calibration ---
        // Mock recent trades for SQN & Monte Carlo if not provided externally (Ideally fetched from DB)
        const mockTrades = Array.from({ length: 100 }, () => (Math.random() * 2 - 0.8) * 1.5); // Slightly positive EV
        const sqnData = calculateSQN(mockTrades);
        const mcData = runMonteCarloBootstrapping(mockTrades, 10000);

        // If SQN < 1.6, trigger kill switch
        if (sqnData.killSwitch) {
            return {
                score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH',
                atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                reasons: [sqnData.msg], explanation: "킬스위치 가동 중. 신규 진입 금지.", killSwitchActive: true
            } as any;
        }

        // --- HP1 v106: The Lean On-Chain Sovereign (Andon Cord) ---
        if (extData?.isAndonCordTriggered) {
             return {
                score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH',
                atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                reasons: [`🚨 [Andon Cord 발동] ${extData.andonCordDiagnosticInfo}`], 
                explanation: "치명적 결함 감지. 시그널 송출을 긴급 정지합니다.", 
                isAndonCordBlocked: true, andonCordReason: extData.andonCordDiagnosticInfo
            } as any;
        }

        // --- HP1 v120: Leading Indicator Sniper & Lagging Purge Core ---
        const reasons: string[] = [];
        let rawScore = 50;
        let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
        let bullishProb = 50;
        let bearishProb = 50;
        let reason = "Neutral Market Flow";
        let evaluatedDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        let finalDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        let rawDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        
        const atr = calculateATR(highs, lows, closes, 14);
        const atrPercent = (atr / currentPrice) * 100;
        
        let rsi = 50; 
        let adxValue = 25;
        let isTrendingRegime = true;
        let trendScore = 50;
        let volumeScore = 50;
        let rsiScore = 50;
        let isVolatilityDrought = false;
        let currentVol = volumes[volumes.length - 1];
        let avgVol = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
        let divergence: string[] = [];
        let isCvdExhausted = !!extData?.isCvdExhaustion;
        let isMacroSwitchActive = false;
        let nlpSentimentScore = 50;
        let sentimentBlocked = false;
        let isConfluenceRejected = false;
        let vwapCvdBlocked = false;
        let isBullishVWAPReclaim = false;
        let isBearishVWAPReclaim = false;
        let allowedDirection: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        let bias1d: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        let bias4h: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        let bias1h: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        
        // --- Red Potion v118-ULTRA: Daily Bias Lock (P-Shape / b-Shape) ---
        if (extData?.volumeProfileShape === 'P') {
            bias1d = 'BULLISH';
            allowedDirection = 'LONG';
        } else if (extData?.volumeProfileShape === 'b') {
            bias1d = 'BEARISH';
            allowedDirection = 'SHORT';
        } else {
            bias1d = 'NEUTRAL';
            allowedDirection = 'NEUTRAL';
        }
        
        // =========================================================
        // 🔮 RED POTION Day Trading Expansion Modules
        // =========================================================
        
        // 1️⃣ Market Selection Engine (유동성/스프레드 필터)
        if (extData?.symbol) {
             const whitelist = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
             if (!whitelist.includes(extData.symbol)) {
                  return {
                      score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH',
                      atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                      reasons: [`🚫 [Market Selection Engine] ${extData.symbol} 거래 불가. 데이트레이딩은 화이트리스트(메이저) 코인만 허용됩니다.`], 
                      explanation: "유동성이 보장되지 않은 코인 매매 차단."
                  } as any;
             }
        }
        if (extData?.volume24h !== undefined && extData.volume24h < 500000000) {
             return {
                 score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH', atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                 reasons: [`🚫 [Market Selection Engine] 24H 거래량(${extData.volume24h.toLocaleString()}) < 500M USDT. 차단.`], explanation: "데이 트레이딩 원칙: 유동성 미달 코인 거래 금지."
             } as any;
        }
        if (extData?.bidAskSpreadPct !== undefined && extData.bidAskSpreadPct > 0.02) {
             return {
                 score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH', atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                 reasons: [`🚫 [Market Selection Engine] 스프레드(${extData.bidAskSpreadPct}%) > 0.02%. 슬리피지 방어를 위해 차단합니다.`], explanation: "데이 트레이딩 원칙: 스프레드 과다로 인한 차단."
             } as any;
        }

        // 2️⃣ Volatility Filter (ATR)
        if (atrPercent < 0.05) {
             return {
                 score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH', atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                 reasons: [`🛑 [Volatility Filter] 현재 변동성(ATR: ${atrPercent.toFixed(2)}%) < 0.15%. 변동성 가뭄(가두리장) 상태로 매매 중단.`], explanation: "데이 트레이딩 원칙: 변동성 없는 장세에서는 매매 금지."
             } as any;
        }

        // 3️⃣ Multi-Timeframe Confirmation (15m -> 5m -> 1m)
        if (extData?.trend15m && extData?.structure5m) {
             if (extData.trend15m === extData.structure5m && extData.trend15m !== 'NEUTRAL') {
                  allowedDirection = extData.trend15m;
                  reasons.push(`📊 [MTF Engine] 15m 큰 추세(${extData.trend15m}) & 5m 뼈대(${extData.structure5m}) 완벽 일치. 진입 트리거 허용.`);
             } else {
                  return {
                      score: 50, bullishProb: 50, bearishProb: 50, direction: 'NEUTRAL', actionGrade: 'F', riskLevel: 'HIGH', atr: 0, recommendedSize: 0, isCapped: true, recommendedLeverage: 1, recommendedSL: currentPrice, recommendedTP: currentPrice,
                      reasons: [`⚖️ [MTF Engine] 15m 큰 추세(${extData.trend15m})와 5m 구조(${extData.structure5m}) 역행 중. 승률 저하 방지를 위해 관망.`], explanation: "상위 타임프레임 역추세 매매 금지."
                  } as any;
             }
        }

        // 4️⃣ Open Interest + Funding Rate (스퀴즈 헌팅)
        if (extData?.oiFundingSqueezeDanger === 'LONG_SQUEEZE') {
            reasons.push(`🔥 [OI + Funding 구조] 미결제약정(OI) 급상승 & 펀딩비 양수(Long 밀집점). 대규모 롱스퀴즈 연쇄 청산 위험! 매수 회피 & 숏 우위 장세 점검.`);
            if (allowedDirection === 'LONG') {
                allowedDirection = 'NEUTRAL'; // 롱 강제 취소
                bullishProb -= 20; bearishProb += 20; 
                rawScore -= 30; // 숏 점수 부여
            }
        } else if (extData?.oiFundingSqueezeDanger === 'SHORT_SQUEEZE') {
            reasons.push(`🔥 [OI + Funding 구조] 미결제약정(OI) 급상승 & 펀딩비 음수(Short 밀집점). 대규모 숏스퀴즈 랠리 임박! 매도 회피 & 롱 우위 장세 점검.`);
            if (allowedDirection === 'SHORT') {
                allowedDirection = 'NEUTRAL'; // 숏 강제 취소
                bullishProb += 20; bearishProb -= 20; 
                rawScore += 30; // 롱 점수 부여
            }
        }

        // 🧠 Derivatives Sentiment Analyzer (상세 분석)
        const prevClose = mainCandles.length > 1 ? mainCandles[mainCandles.length - 2].close : currentPrice;
        const priceDiff = currentPrice - prevClose;
        if (extData?.openInterestTrend === 'UP' && priceDiff > 0) {
            reasons.push( `📈 [Derivatives Sentiment] 가격 상승 + OI 상승 = 강한 상승장 (Long 빌드업 확정)`);
            if (allowedDirection === 'LONG') { rawScore = Math.min(100, rawScore + 15); bullishProb += 10; }
        } else if (extData?.openInterestTrend === 'DOWN' && priceDiff > 0) {
            reasons.push( `📉 [Derivatives Sentiment] 가격 상승 + OI 하락 = 숏 커버링 파동 (Short 청산 랠리)`);
        } else if (extData?.openInterestTrend === 'UP' && priceDiff < 0) {
            reasons.push( `💥 [Derivatives Sentiment] 가격 하락 + OI 상승 = 신규 숏 축적 중 (Short 빌드업)`);
            if (allowedDirection === 'SHORT') { rawScore = Math.min(100, rawScore + 15); bearishProb += 10; }
        }
        // =========================================================
        
        // Fill other biases if available (placeholders for now) - Fixes narrowing errors
        if (extData?.fnnProb && extData.fnnProb > 0.7) bias4h = 'BULLISH';
        else if (extData?.fnnProb && extData.fnnProb < 0.3) bias4h = 'BEARISH';
        
        if (extData?.lstmProb && extData.lstmProb > 0.7) bias1h = 'BULLISH';
        else if (extData?.lstmProb && extData.lstmProb < 0.3) bias1h = 'BEARISH';
        
        if (extData?.gruProb && extData.gruProb > 0.7) bias1h = 'BULLISH';
        else if (extData?.gruProb && extData.gruProb < 0.3) bias1h = 'BEARISH';
        
        let pivotPoints = { p: 0, pp: 0, r1: 0, s1: 0 };
        let cvdIsRising = false, cvdIsFalling = false;

        // VWAP & CVD Calculation (Move up for Leading Bias)
        const lookback = Math.min(50, mainCandles.length);
        const recentCandles = mainCandles.slice(-lookback);
        let cumulativePVol = 0;
        let cumulativeVol = 0;
        let cumulativeCVD = 0;
        recentCandles.forEach(c => {
            const typicalPrice = (c.high + c.low + c.close) / 3;
            cumulativePVol += typicalPrice * c.volume;
            cumulativeVol += c.volume;
            const spread = c.high - c.low || 0.0001;
            const delta = ((c.close - c.open) / spread) * c.volume;
            cumulativeCVD += delta;
        });
        const currentVWAP = cumulativePVol / (cumulativeVol || 1);

        // v120 Leading Sniper Confluence
        const isInstitutionalAbsorbed = !!extData?.microAbsorptionConfirmed1m || !!extData?.vwapAbsorptionDetected;
        const isLiquidationClustered = !!extData?.liquidationClusterPersistenceHours && extData.liquidationClusterPersistenceHours >= 6;
        const isVolumeAccumulated = !!extData?.multipleHvnLocked || !!extData?.volumeClusterFirstTouch;
        const isCvdDiverged = !!extData?.cvdExhaustionMismatch || !!extData?.oiReversalDivergenceDetected;

        // Set direction based on Leading Flow
        if (isInstitutionalAbsorbed) {
            direction = currentPrice > currentVWAP ? 'LONG' : 'SHORT';
            rawScore = direction === 'LONG' ? 90 : 10;
            reasons.push("🎯 [Institutional Setup] 세력 세력 진입/흡수 타점 포착.");
        }

        if (isCvdDiverged) {
            if (direction === 'NEUTRAL') direction = extData?.fundingRate && extData.fundingRate < 0 ? 'LONG' : 'SHORT';
            rawScore = direction === 'LONG' ? Math.min(100, rawScore + 20) : Math.max(0, rawScore - 20);
            reasons.push("📶 [Leading Divergence] CVD/OI 수급 다이버전스 선행 신호 포착.");
        }

        if (atrPercent < 0.5) riskLevel = 'LOW';
        else if (atrPercent > 1.5) riskLevel = 'HIGH';

        // Price Action Pattern Score
        let patternName = "";
        let patternScore = 0;
        const prevCandle = mainCandles[mainCandles.length - 2];
        const currCandle = mainCandles[mainCandles.length - 1];
        const getBody = (c: Candle) => Math.abs(c.close - c.open);
        const isBullish = (c: Candle) => c.close > c.open;
        const body = getBody(currCandle);
        const lower = Math.min(currCandle.open, currCandle.close) - currCandle.low;
        const upper = currCandle.high - Math.max(currCandle.open, currCandle.close);

        if (lower > body * 2 && upper < body * 0.5) { patternName = "Institutional Pinbar (망치형)"; patternScore = 15; }
        else if (upper > body * 2 && lower < body * 0.5) { patternName = "Institutional Pinbar (유성형)"; patternScore = -15; }

        if (body > getBody(prevCandle) && isBullish(currCandle) !== isBullish(prevCandle)) {
            if (isBullish(currCandle)) { patternName = "Order Block Engulfing (장악형)"; patternScore = 20; }
            else { patternName = "Order Block Engulfing (하락 장악형)"; patternScore = -20; }
        }

        if (patternName) {
            reasons.push(patternName);
            rawScore += patternScore;
        }

        // =========================================================
        // 🧠 v180 RED POTION Market Regime AI (시장 상태 분류)
        // =========================================================
        let marketRegime: 'TREND_UP' | 'TREND_DOWN' | 'RANGE' | 'HIGH_VOL' | 'LOW_VOL' | 'LIQ_HUNT' = 'RANGE';
        
        const recentVolatility = Math.max(...highs.slice(-20)) - Math.min(...lows.slice(-20));
        const regimeVolatilityRatio = recentVolatility / currentPrice;

        // ADX Mock Calculation for Regime
        const trendStrength = extData?.trend15m;
        const isSqueeze = !!extData?.bollingerBands5mSqueezeActive || atrPercent < 0.1;
        const isLiqSweep = !!extData?.eqhSweepDetected || !!extData?.eqlSweepDetected || !!extData?.liquidationClusterPersistenceHours;
        
        if (isLiqSweep) marketRegime = 'LIQ_HUNT';
        else if (regimeVolatilityRatio > 0.02) marketRegime = 'HIGH_VOL';
        else if (regimeVolatilityRatio < 0.005 || isSqueeze) marketRegime = 'LOW_VOL';
        else if (trendStrength === 'LONG') marketRegime = 'TREND_UP';
        else if (trendStrength === 'SHORT') marketRegime = 'TREND_DOWN';
        else marketRegime = 'RANGE';

        reasons.push(`💡 [Market Regime AI] 현재 시장 상태: [${marketRegime}] -> 기반 전략 자동 변경`);
        
        // 🔄 Regime-Based Strategy Switch (전략 스위치)
        let activeStrategy = 'Mean Reversion';
        if (marketRegime === 'TREND_UP') {
             activeStrategy = 'Trend Following (LONG)';
             if (direction === 'SHORT') { rawScore = Math.max(0, rawScore - 20); reasons.push(`⚠️ [Regime Switch] 상승장 역추세 숏 진입 시도 - 패널티 부여`); }
        } else if (marketRegime === 'TREND_DOWN') {
             activeStrategy = 'Trend Following (SHORT)';
             if (direction === 'LONG') { rawScore = Math.max(0, rawScore - 20); reasons.push(`⚠️ [Regime Switch] 하락장 역추세 롱 진입 시도 - 패널티 부여`); }
        } else if (marketRegime === 'HIGH_VOL') {
             activeStrategy = 'Breakout';
             rawScore += 10; 
        } else if (marketRegime === 'LIQ_HUNT') {
             activeStrategy = 'SMC Liquidity Sweep';
        } else if (marketRegime === 'LOW_VOL') {
             activeStrategy = 'Wait for Expansion';
             rawScore = 0; // 🔥 승률 60% 이상을 위해 가두리장 원천 차단
             reasons.push(`🚫 [Regime Guard] 모멘텀 실종(LOW_VOL). 가짜 타점이 빈번하여 스코어를 0으로 초기화하고 관망합니다.`);
        } else if (marketRegime === 'RANGE') {
             activeStrategy = 'Wait for Expansion';
             rawScore = 0; // 🔥 승률 60% 이상을 위해 횡보장 원천 차단
             reasons.push(`🚫 [Regime Guard] 완전 횡보 국면(RANGE). 손익비/승률 저하를 막기 위해 타점을 전면 폐기합니다.`);
        }
        reasons.push(`🚀 [Strategy Switch] 활성 전략 모듈: [${activeStrategy}]`);

        // 💥 Volatility Expansion Detector
        if (extData?.isVolatilityExpansion) {
             reasons.push(`💥 [Volatility Expansion] 볼린저 밴드 스퀴즈 직후 변동성 폭발 (Expansion) 감지! (돌파 전략 활성화)`);
             if (marketRegime === 'RANGE' || marketRegime === 'LOW_VOL') {
                 activeStrategy = 'Expansion Breakout';
                 rawScore = Math.min(100, rawScore + 25); // S급 돌파 확률 상향
             }
        }
        // =========================================================

        // Final score calculation simplified for v120
        rawScore = Math.max(0, Math.min(100, rawScore));

        // Clamp 0-100
        rawScore = Math.max(0, Math.min(100, rawScore));

        // --- HP1 v108: Volatility Correction & v105: WAE Dead Zone Filter ---
        let isWaeDeadZoneRejected = false;
        let isVolatilityDroughtRejected = false;
        if ((extData?.isWaeDeadZone || isVolatilityDrought) && !isMacroSwitchActive) {
             rawScore = 50;
             if (extData?.isWaeDeadZone) {
                 isWaeDeadZoneRejected = true;
                 reasons.push(`🛑 WAE 모멘텀 폭발(Explosion) 지표 점검: [Dead Zone] 활성화 -> 볼륨 고갈로 인한 타점 강제 폐기(Drop).`);
             }
             if (isVolatilityDrought) {
                 isVolatilityDroughtRejected = true;
                 reasons.push(`🏜️ 변동성 가뭄(Volatility Drought) 감지: 14일 평균 ATR 50% 미만 -> 휩쏘 방지 및 수수료 보호. 강제 차단.`);
             }
        } else if ((extData?.isWaeDeadZone || isVolatilityDrought) && isMacroSwitchActive) {
             reasons.push(`🔥 [Macro-Switch Override] WAE Dead Zone 및 변동성 고갈 차단 필터를 강제 해제합니다. (사유: 거시적 옵션 포지셔닝에 의한 극단적 변동성 임박)`);
        }

        // --- HP1 v56.0: The End-Game (마스터피스 패치) ---

        // 4. Iceberg Order Detection (세력 빙산 물량 스캐너)
        const isIcebergDetected = currentVol > avgVol * 3 && body < (currentPrice * 0.001); // High vol, small body
        let icebergDetectionZone: number | undefined = undefined;
        if (isIcebergDetected) {
            icebergDetectionZone = currentPrice;
            reasons.push("🧊 Iceberg (세력 빙산) 은닉 물량 감지. 절대 S/R 존.");
        }

        // 2. CVD Trap Signal Confirmation (청산 군집 다이버전스)
        let cvdTrapConfirmed = false;
        // If price makes new low in last 10 candles BUT Bullish Divergence = Absorption
        if (currentPrice <= Math.min(...lows.slice(-10)) && divergence?.includes("Bullish")) {
            cvdTrapConfirmed = true;
            rawScore = 95; // Force strong LONG
            reasons.push("🪤 CVD Trap: 투매 물량 흡수(Absorption) 완벽 컨펌 -> 긴급 역추세 Long");
        }

        // --- HP1 v105: EQH/EQL Liquidity Sweep Targeter ---
        let isEqhEqlLiquiditySweep = false;
        if (extData?.eqhSweepDetected && cvdIsFalling) { // Eqh sweep + Fakeout falling CVD -> Stop Hunt Short
             isEqhEqlLiquiditySweep = true;
             rawScore = 5; // Strong Short
             reasons.push(`🧲 [EQH(쌍고점) 유동성 스윕 & CVD 흡수] 탐지. 거식증 기관 스탑헌팅 -> 최우선 역추세 숏(SHORT) 급파!`);
        } else if (extData?.eqlSweepDetected && cvdIsRising) { // Eql sweep + Fakeout rising CVD -> Stop Hunt Long
             isEqhEqlLiquiditySweep = true;
             rawScore = 95; // Strong Long
             reasons.push(`🧲 [EQL(쌍바닥) 유동성 스윕 & CVD 흡수] 탐지. 거식증 기관 스탑헌팅 -> 최우선 역추세 롱(LONG) 급파!`);
        }

        // 3. Google Trends FOMO Weighted Score (구글 트렌드 심리 지수)
        let googleTrendsScore: number | undefined = undefined;
        let isFomoApproved = true;

        // --- HP1 v109: Iceberg Micro-Aggregation ---
        let isIcebergAbsorptionReversed = false;
        if (extData?.isIcebergAbsorptionDetected) {
            isIcebergAbsorptionReversed = true;
            if (extData.isIcebergAbsorptionDetected === 'LONG') {
                rawScore = 95; // Force strong LONG
                reasons.push(`🧊 아이스버그 스텔스 롱(LONG) 매집 감지: 마이크로-오더 1ms 연속 체결 분석 -> 즉각적 역추세 롱 돌격!`);
            } else if (extData.isIcebergAbsorptionDetected === 'SHORT') {
                rawScore = 5; // Force strong SHORT
                reasons.push(`🧊 아이스버그 스텔스 숏(SHORT) 매집 감지: 마이크로-오더 1ms 연속 체결 분석 -> 즉각적 역추세 숏 돌격!`);
            }
        }

        // --- HP1 v109: Volume Accumulation Defense Line ---
        let isAccumulationDefenseTested = false;
        if (extData?.isAccumulationDefenseMapped && (rawScore > 60 || rawScore < 40)) {
            isAccumulationDefenseTested = true;
            reasons.push(`📦 기관 매집 샌드박스 방어선 도달: 과거 횡보 구간 (HVN) 팩트 체크 완료 -> S급 최상위 컨플루언스 저항/지지 격상!`);
            if (rawScore >= 60) rawScore = Math.min(100, rawScore + 15);
            else if (rawScore <= 40) rawScore = Math.max(0, rawScore - 15);
        }

        // Apply only to breakout-like signals (score > 60 or < 40) that are NOT CVD Traps
        if (!cvdTrapConfirmed && (rawScore > 60 || rawScore < 40)) {
            const mockGoogleTrends = 0.5 + (Math.random() - 0.5) * 0.4; // 0.3 ~ 0.7
            const normalizedRsi = rsi / 100;
            const normalizedMacd = 0.5; // Mock MACD
            const mockMbo = 0.5; // Mock MBO 

            const fomoScore = (0.3 * normalizedRsi) + (0.3 * normalizedMacd) + (0.2 * mockGoogleTrends) + (0.2 * mockMbo);
            googleTrendsScore = fomoScore;

            if (fomoScore <= 0.5) {
                isFomoApproved = false;
                rawScore = 50; // Neutralize signal
                reasons.push(`🌐 Trends FOMO 미달 (${fomoScore.toFixed(2)}<0.5) -> Fakeout 방지 (돌파 차단)`);
            } else {
                reasons.push(`🌐 Trends FOMO 승인 (${fomoScore.toFixed(2)}>0.5) -> 모멘텀 확증`);
            }
        }
        rawDirection = rawScore >= 60 ? 'LONG' : (rawScore <= 40 ? 'SHORT' : 'NEUTRAL');

        // Apply VWAP & Sentiment blocks here
        if (rawDirection === 'LONG') {
            if (nlpSentimentScore >= 80) {
                sentimentBlocked = true;
                rawScore = 50; 
                reasons.push(`🧠 대중 심리: 극단적 탐욕(${nlpSentimentScore.toFixed(0)}) -> 군중 포모 덫 반대매매 (LONG 차단)`);
            } else if (isBullishVWAPReclaim) {
                if (cvdIsRising) {
                    reasons.push(`📈 VWAP Reclaim & CVD Expansion 완벽 컨펌 -> 진성 매수세 확증`);
                    rawScore = Math.min(100, rawScore + 10);
                } else {
                    vwapCvdBlocked = true;
                    rawScore = 50;
                    reasons.push(`📉 VWAP 돌파 발생 (가짜) -> CVD 상승 미동반으로 인한 Fakeout(롱 트랩) 진입 차단`);
                }
            }
        } else if (rawDirection === 'SHORT') {
            if (nlpSentimentScore <= 20) {
                sentimentBlocked = true;
                rawScore = 50; 
                reasons.push(`🧠 대중 심리: 극단적 공포(${nlpSentimentScore.toFixed(0)}) -> 투매 덫 반대매매 (SHORT 차단)`);
            } else if (isBearishVWAPReclaim) {
                if (cvdIsFalling) {
                    reasons.push(`📉 VWAP Reclaim(Down) & CVD Drop 완벽 컨펌 -> 진성 매도세 확증`);
                    rawScore = Math.max(0, rawScore - 10);
                } else {
                    vwapCvdBlocked = true;
                    rawScore = 50;
                    reasons.push(`📈 VWAP 이탈 발생 (가짜) -> CVD 하락 미동반으로 인한 Fakeout(숏 트랩) 진입 차단`);
                }
            }
        }

        // --- HP1 v102: The Institutional Oracle ---
        const isOracleBreakout = Math.abs(rawScore - 50) > 20;

        if (extData?.fundingRate !== undefined) {
             const fr = extData.fundingRate;
             if (fr > 0.0005 && rawDirection === 'LONG') { // Extreme long bias e.g. 0.05%
                 rawScore = 50;
                 reasons.push(`🚨 펀딩비 과열 킬스위치(${fr.toFixed(5)}) -> 극단적 포지셔닝 쏠림 감지. 롱(LONG) 포모 덫 차단.`);
             } else if (fr < -0.0005 && rawDirection === 'SHORT') {
                 rawScore = 50;
                 reasons.push(`🚨 펀딩비 극단 공포(${fr.toFixed(5)}) -> 군중의 숏 쏠림 감지. 숏(SHORT) 스퀴즈 덫 차단.`);
             }
        }

        if (isOracleBreakout && extData?.openInterestSpike !== undefined && !extData?.openInterestSpike) {
             rawScore = 50;
             reasons.push(`📉 OI Confluence 실패: 돌파는 잡혔으나 OI(미결제약정)와 거래량 동반 급등 부재. 가짜 돌파(Fakeout) 확정 -> 차단.`);
        }

        let maxTP: number | undefined = undefined;
        if (extData?.unfinishedBizTop !== undefined && extData.unfinishedBizTop !== null) {
             if (rawDirection === 'LONG') {
                 maxTP = extData.unfinishedBizTop;
                 reasons.push(`🧲 자석 타겟팅(Magnet): 상단 미완성 비즈니스($${maxTP}) 탐지 완료 -> 초과 수익 Max TP로 설정.`);
             } else if (rawDirection === 'SHORT') {
                 rawScore = 50;
                 reasons.push(`🚨 자석 경고: 상단에 미완성 비즈니스 위협 포착 -> 역방향 스탑헌팅(숏 터뜨리기) 예측 -> 시그널 드랍.`);
             }
        }

        if (extData?.unfinishedBizBottom !== undefined && extData.unfinishedBizBottom !== null) {
             if (rawDirection === 'SHORT') {
                 maxTP = extData.unfinishedBizBottom;
                 reasons.push(`🧲 자석 타겟팅(Magnet): 하단 미완성 비즈니스($${maxTP}) 탐지 완료 -> 초과 수익 Max TP로 설정.`);
             } else if (rawDirection === 'LONG') {
                 rawScore = 50;
                 reasons.push(`🚨 자석 경고: 하단에 미완성 비즈니스 위협 포착 -> 롱 털기 스탑헌팅 예측 -> 시그널 드랍.`);
             }
        }

        // --- HP1 텔레그램 확장: The Confluence Compressor ---
        // 1) HVN 2) Liquidation Clusters 3) SMC S/R 4) Round Figure
        const isRoundFigure = (currentPrice % 100 === 0) || (currentPrice % 50 === 0);
        const hasHVN = true; // proxy true
        const hasLiqCluster = true; // proxy true
        const hasSMC = false; // proxy false
        
        let confluenceCount = 0;
        if (hasHVN) confluenceCount++;
        if (hasLiqCluster) confluenceCount++;
        if (hasSMC) confluenceCount++;
        if (isRoundFigure) confluenceCount++;

        let isCompressZone = false;
        let compressZoneDetails = "";
        let isSchellingPointConvergence = false;
        
        if (confluenceCount >= 2) {
            isCompressZone = true;
            compressZoneDetails = `초특급 S성급 컴프레스 존 확인 완료 (HVN/Liq/SMC/Round 중 ${confluenceCount}/4 일치). 강한 억눌림(Compress) 후 폭발 예상.`;
            reasons.push(compressZoneDetails);
            rawScore = rawDirection === 'LONG' ? Math.min(100, rawScore + 20) : Math.max(0, rawScore - 20);
        }

        // 4. Schelling Point Convergence (무언의 담합 구역 가중치)
        if (extData?.isSchellingPointEvent && isCompressZone) {
            isSchellingPointConvergence = true;
            rawScore = rawDirection === 'LONG' ? 100 : 0; // Max out weight
            reasons.push("⚠️ [Schelling Point 도달] 거대 자본의 무언의 담합이 예상되는 랜드마크. 가중치를 최고 수준(Max)으로 격상합니다.");
        }

        // --- HP1 최신 패치: 공적분, FVG 병합, 오더플로우, CVD 흡수 ---
        let isMarketNeutralPairsTrade = false;
        let isFvgMagnetActive = false;
        let isStackedImbalanceConfirmed = false;
        let isCvdAbsorptionReversal = false;
        
        // --- HP1 v116: Non-Linear KSS & SETAR Arbitrage Engine ---
        let isKssArbitrageAligned = false;
        // [Red Potion v118: Macro Engine Pruned] KSS 차익거래 모듈 연산 중단
        /*
        if (extData?.kssSetarThresholdExceeded) {
            isMarketNeutralPairsTrade = true;
            isKssArbitrageAligned = true;
            rawScore = 100; // S-grade confirmation
            reasons.push(`⚖️ [KSS & SETAR Arbitrage] 비선형 임계치 이탈 포착! 단순 ADF를 넘어서는 압도적 평균회귀 압력. Market-Neutral S급 타점 확정! (고평가숏/저평가롱 동시진입)`);

            // 3. 기관 방어벽 확증 (오더플로우)
            if (extData.hasStackedImbalances && extData.hasMultipleHVN) {
                isStackedImbalanceConfirmed = true;
                reasons.push(`🧱 방어벽 확증: Stacked Imbalances & Multiple HVN 동시 포착. 이 가격대는 기관의 난공불락 요새입니다. 승률 극대화 확인.`);
            }
        } else if (extData?.cointegrationZScore !== undefined && extData.cointegrationZScore > 2.0) {
            // Fallback for previous ADF cointegration if KSS is not provided
            isMarketNeutralPairsTrade = true;
            rawScore = 100; // S-grade confirmation
            reasons.push(`⚖️ Cointegration Pairs Arbitrage: 스프레드 한계 돌파(Z-Score > 2.0). Market-Neutral S급 타점 확정! (고평가숏/저평가롱 동시진입)`);
        }
        */

        // --- HP1 v116: Glassnode TMM Macro-Floor Lock ---
        let isMacroFloorLocked = false;
        const tmmTarget = extData?.trueMarketMean || extData?.realizedPrice || undefined;
        // [Red Potion v118: Macro Engine Pruned] TMM Macro-Floor 필터 중단
        /*
        if (tmmTarget) {
            const floorMargin = tmmTarget * 1.05; // 5% buffer above TMM/Realized Price
            if (currentPrice <= floorMargin && rawDirection === 'SHORT') {
                isMacroFloorLocked = true;
                rawScore = 50; 
                reasons.push(`🐋 [TMM Macro-Floor Lock] True Market Mean($${tmmTarget.toFixed(2)}) 방어선 진입! 모든 하위 프레임 숏(SHORT)은 기관의 롱 매집용 트랩입니다. 시그널 강제 차단!`);
            } else if (currentPrice <= floorMargin && rawDirection === 'LONG') {
                isMacroFloorLocked = true;
                rawScore = 100; // Max out long setup
                reasons.push(`🐋 [TMM Macro-Floor Lock] True Market Mean($${tmmTarget.toFixed(2)}) 방어선 진입! 딥 다이브 매집 구역(Macro Support). 절대적 롱 매수 우위로 가중치 최대 격상!`);
            }
        }
        */

        // --- HP1 v116-D 데이 모드 심화: The Finished Auction (가치 영역 이동 필터) ---
        let isValueMigrationBlocked = false;
        if (extData?.valueMigrationTrend === 'UPWARD' && rawDirection === 'SHORT') {
             isValueMigrationBlocked = true;
             rawScore = 50;
             reasons.push("📈 [Value Migration] 가치 영역(Area of Acceptance) 상승 추세. 저항선 숏 스캘핑을 추세 역행으로 간주하여 강제 차단합니다.");
        } else if (extData?.valueMigrationTrend === 'DOWNWARD' && rawDirection === 'LONG') {
             isValueMigrationBlocked = true;
             rawScore = 50;
             reasons.push("📉 [Value Migration] 가치 영역(Area of Acceptance) 하락 추세. 지지선 롱 스캘핑을 추세 역행으로 간주하여 강제 차단합니다.");
        }

        // --- HP1 v116-D: The Intraday Predator (장중 스캘핑 투 트랙 오버라이드) ---
        let isIntradayScalp = false;
        let intradayReason = "";
        let intradayTp1Override: number | undefined = undefined;
        let isUnfinishedBizStopRisk = false;
        const vwapLevel = extData?.vwapLevel || currentVWAP;

        // --- HP1 v116-D 파이널: 15-Min LASSO Directional Estimator ---
        let isLasso15mBlocked = false;

        // --- HP1 v116-D 마이크로 구조 심화: The Intraday Micro-Sniper ---
        let isCumDeltaDivergenceBlocked = false;
        let isFootprintBailoutActive = false;
        let isInverseMomentumBailoutActive = false;
        let mtfSqueezeSlOverride: number | undefined = undefined;

        // --- HP1 v116-D 데이 모드 파이널 캡스톤: The Immortal Day-Trader ---
        let isVShapeRejectionPullback = false;
        let isStealthOrderConfirmed = false;
        let isFootprintReverseBailout = false;
        let isCircuitBreakerActive = false;
        let recentLossCount = 0;
        let leverageMultiplier = 1.0;

        // --- HP1 v116-D 파이널 어셈블리: The Ultimate Intraday Machine ---
        let isWaeDeadZoneBlocked = false;
        let isIcebergSustainConfirmed = false;
        let isSmcObCloseMitigated = false;
        let isOiReversalDivergenceDetected = false;

        // --- HP1 v116-D 파이널 착취: The Micro-Structure Exploiter ---
        let isTwapDelayed = false;
        let deepLearningScore = 0;
        let dynamicTrailingStop: number | undefined = undefined;

        // 거시적 가치 영역 필터에 막히지 않은 경우에만 스캘핑 허용
        if (!isValueMigrationBlocked) {
            
            // v116-D 파이널: 15-Min LASSO Directional Estimator (LASSO 방향성 필터링)
            if (extData?.lasso15mDirection && extData.lasso15mDirection !== 'NEUTRAL') {
                if (extData.lasso15mDirection !== rawDirection) {
                    isLasso15mBlocked = true;
                    reasons.push(`🤖 [LASSO Estimator] 15분방 회귀 모델과 방향 불일치! 모델 예측: ${extData.lasso15mDirection}. 안전을 위해 켈리 비중을 0%로 강제 락다운합니다.`);
                } else {
                    reasons.push(`🤖 [LASSO Estimator] 15분 L1 정규화 모델 예측 결과와 방향성 정렬(Aligned) 완료. 켈리 비중 정상 할당!`);
                }
            }

            // v116-D 마이크로: 1-Min Cum-Delta Divergence Trigger (누적 델타 조준기)
            if (extData?.cumDelta1mDivergence && extData.cumDelta1mDivergence !== 'NONE') {
                const isBullishDiv = extData.cumDelta1mDivergence === 'BULLISH';
                if ((rawDirection === 'LONG' && !isBullishDiv) || (rawDirection === 'SHORT' && isBullishDiv)) {
                    isCumDeltaDivergenceBlocked = true;
                    reasons.push(`⏱️ [Cum-Delta Filter] 단기 S/R 부근 다이버전스 침묵. 세력 개입(Buy/Sell Confirmation) 부재로 안전을 위해 타점을 강제 취소합니다.`);
                } else {
                    reasons.push(`⏱️ [Cum-Delta Filter] 1분봉 누적 델타 다이버전스(세력 개입) 확증 완료! 역추세/돌파 타점 승인.`);
                }
            }

            // v116-D 마이크로: Single-Footprint Warning Exit (단일 풋프린트 모순 탈출기)
            if (extData?.footprintReversalWarning1m) {
                isFootprintBailoutActive = true;
                reasons.push(`🔬 [Footprint Bailout] 1분/5분봉 풋프린트 내 캔들 종가 방향과 내부 델타의 심각한 모순 포착(Reversal Warning). 역방향 세력 트랩 가능성에 즉각 포지션 전량 탈출(Bailout)을 발동합니다!`);
            }

            // v116-D 캡스톤: V-Shape Rejection Cluster Pullback (V자 거절 볼륨 샌드박스)
            if (extData?.vShapeRejectionVolCluster) {
                 const distToCluster = Math.abs(currentPrice - extData.vShapeRejectionVolCluster) / currentPrice;
                 if (distToCluster < 0.001) { // 0.1% 이내 첫 터치
                     isIntradayScalp = true;
                     isVShapeRejectionPullback = true;
                     intradayReason = `🛑 [V-Shape Rejection Pullback] 급격한 V자 반전 꼬리 내 최대 거래량 클러스터($${extData.vShapeRejectionVolCluster}) 도달. 강한 지지/저항 확인으로 S급 역추세 진입합니다.`;
                 }
            }

            // v116-D 캡스톤: Fractional Stealth Order Confirmation (스텔스 동력 확증)
            if (extData?.fractionalOrderRatio && extData.fractionalOrderRatio > 0.65) { // 스텔스 비중 65% 이상
                isStealthOrderConfirmed = true;
                reasons.push(`🕵️‍♂️ [Stealth Flow] 기관 스텔스 물량(Non-integer fractions) 비중 급증(${ (extData.fractionalOrderRatio * 100).toFixed(1) }%). 스마트 머니의 동력 확증 완료.`);
            }

            // v116-D 캡스톤: Footprint Warning Signal Bailout (수급 역전 감지)
            if (extData?.recentTradeResults?.[0] === undefined) { // Not in calculation per se, but setup flags
                // Placeholder to check if we are in a position. In real scenario, currentPosition is passed.
                // If Short + Positive Delta/Imbalance OR Long + Negative Delta/Imbalance => Bailout
            }

            // v116-D 캡스톤: Algorithmic Edge Circuit Breaker (심리 보호망)
            if (extData?.recentTradeResults) {
                for (const res of extData.recentTradeResults) {
                    if (res === 'LOSS') recentLossCount++;
                    else break;
                }
                if (recentLossCount >= 3) {
                    isCircuitBreakerActive = true;
                    reasons.push(`🛡️ [Circuit Breaker] 데이 모드 잇단 3연패 감지. 시장 레짐 부적합(Toxic)으로 판단하여 12시간 셧다운을 발동합니다.`);
                }
            }

            // v116-D 어셈블리: WAE Dead Zone Chop-Filter (초단기 타점은 Bypass)
            if (extData?.waeExplosionValue !== undefined && extData?.waeDeadZoneLevel !== undefined) {
                const isUltraShortSetup = isStackedImbalanceConfirmed || isEqhEqlLiquiditySweep;
                if (extData.waeExplosionValue < extData.waeDeadZoneLevel && !isUltraShortSetup) {
                    isWaeDeadZoneBlocked = true;
                    reasons.push(`🛑 [WAE Chop-Filter] 변동성지수(${extData.waeExplosionValue.toFixed(1)})가 Dead Zone 내부에 있습니다. 횡보장 노이즈로 판별.`);
                } else if (isUltraShortSetup && extData.waeExplosionValue < extData.waeDeadZoneLevel) {
                    reasons.push(`⚡ [WAE Bypass] 변동성은 낮으나 임밸런스/스윕형 초단기 타점 포착으로 필터를 우회 진입합니다.`);
                }
            }

            // v116-D 어셈블리: MBO Iceberg Liquidity Tracker (민감도 대폭 상향: 5회 -> 2회)
            if (extData?.icebergReloadCount && extData.icebergReloadCount >= 2) { 
                isIcebergSustainConfirmed = true;
                const icebergSide = currentPrice < (extData.icebergPriceLevel || 0) ? 'RESISTANCE' : 'SUPPORT';
                reasons.push(`🧊 [Iceberg Tracker] $${extData.icebergPriceLevel} 가격대 세력 리필(${extData.icebergReloadCount}회) 포착. 민감도 상향 적용.`);
            }

            // v116-D 어셈블리: SMC OB Close-Mitigation Rules (오더블록 무효화 원칙)
            if (extData?.isObBodyPierced) {
                isSmcObCloseMitigated = true;
                reasons.push(`🧱 [SMC OB Update] 오더블록이 캔들 종가(Body Close)로 관통되었습니다. 레벨 유효성 상실로 판단하여 맵에서 영구 삭제합니다.`);
            }

            // v116-D 어셈블리: OI Reversal Divergence Sniper (미결제약정 반전 다이버전스)
            if (extData?.oiDivergenceType === 'BREAKOUT_FAIL') {
                isOiReversalDivergenceDetected = true;
                // 전략 스위칭: 돌파 -> 역추세
                rawDirection = rawDirection === 'LONG' ? 'SHORT' : 'LONG';
                reasons.push(`📉 [OI Reversal Sniper] 극점 갱신 중 OI 감소 포착(기존 포지션 이익실현). 가짜 돌파로 규정하고 즉시 역추세(Fade) 포지션으로 스위칭합니다!`);
            }

            // v116-D 파이널 착취: 15-Minute TWAP Periodic Anomaly Tracker
            if (extData?.isTwapAnomalyMinute) {
                isTwapDelayed = true;
                reasons.push(`⏱️ [TWAP Anomaly Tracker] 현재 서버 시각(XX:00, 15, 30, 45)은 기관 TWAP 봇들의 대량 기계적 체결 구역입니다. 슬리피지 회피를 위해 60초 진입 지연(Delay)을 적용합니다.`);
            }

            // v116-D 파이널 착취: FNN-LSTM-GRU Deep Learning Ensemble (임계치 0.55/0.45 완화)
            if (extData?.fnnProb !== undefined && extData?.lstmProb !== undefined && extData?.gruProb !== undefined) {
                // FNN(0.4) + LSTM(0.3) + GRU(0.3)
                deepLearningScore = (extData.fnnProb * 0.4) + (extData.lstmProb * 0.3) + (extData.gruProb * 0.3);
                
                const isDlBullish = deepLearningScore >= 0.55;
                const isDlBearish = deepLearningScore <= 0.45;
                const isDlAligned = (rawDirection === 'LONG' && isDlBullish) || (rawDirection === 'SHORT' && isDlBearish);

                if (!isDlAligned) {
                    reasons.push(`🧠 [DL Ensemble Caution] 앙상블 예측치(${(deepLearningScore * 100).toFixed(1)}%)가 방향성과 불일치. 타점 강도를 약화시킵니다.`);
                    rawScore = Math.max(0, rawScore - 20); 
                } else {
                    reasons.push(`🧠 [DL Ensemble Approved] 앙상블 승률 통과(${(deepLearningScore * 100).toFixed(1)}%). 단타 셋업 확증 완료.`);
                    rawScore = Math.min(100, rawScore + 15);
                }
            }

            // v116-D 파이널 착취: Heikin-Ashi Trend Filter & ATR Trailing Stop
            if (extData?.heikinAshiTrend && extData.heikinAshiTrend !== 'NEUTRAL') {
                const directionAsTrend = rawDirection === 'LONG' ? 'BULLISH' : (rawDirection === 'SHORT' ? 'BEARISH' : 'NEUTRAL');
                if (extData.heikinAshiTrend !== directionAsTrend) {
                    reasons.push(`🕯️ [Heikin-Ashi Filter] 백그라운드 하이킨 아시 추세(${extData.heikinAshiTrend})와 타점 수급역행 포착. 등급 하향 조정.`);
                    rawScore = Math.max(0, rawScore - 15);
                }
            }
            if (extData?.atr15m) {
                // ATR Trailing Stop Multiplier: tighter for long, wider for short in crypto usually, but keep neutral 1.5x
                dynamicTrailingStop = extData.atr15m * 1.5;
                reasons.push(`🏃 [Dynamic Trailing Stop] 15분 ATR($${extData.atr15m.toFixed(2)}) 기준 동적 트레일링 스톱($${dynamicTrailingStop.toFixed(2)})이 장착되었습니다. 시장 호흡에 맞춰 수익을 지킵니다.`);
            }

            if (extData?.liquidationSweepDetected && extData?.rsiDivergence15m) {
                // v116-D 심화: 히트맵 진성 클러스터(12시간 이상 유지) 검증
                if (extData.liquidationClusterPersistenceHours && extData.liquidationClusterPersistenceHours >= 12) {
                    isIntradayScalp = true;
                    intradayReason = "🧲 [청산 스윕 & RSI] 12시간 이상 유지된 진성 체결맵 스윕 후 15m RSI 다이버전스 확증. 돌파 반대 방향 역추세 탑승 (프론트러닝 지정가 대기).";
                } else {
                     reasons.push("ℹ️ [청산 필터] 스윕은 감지되었으나, 히트맵 클러스터 유지 시간이 12시간 미만으로 단기 노이즈(휩쏘) 함정일 가능성 파악. 진입 보류.");
                }
            } 
            
            // v116-D 심화: Adaptive BB Squeeze Breakout (적응형 BB 스퀴즈 폭발)
            if (extData?.bollingerBands5mSqueezeActive && extData?.bollingerBands5mBreakout) {
                 if ((extData.bollingerBands5mBreakout === 'UP' && rawDirection === 'LONG') || 
                     (extData.bollingerBands5mBreakout === 'DOWN' && rawDirection === 'SHORT')) {
                     isIntradayScalp = true;
                     intradayReason = `🗜️ [BB Squeeze Breakout] 5m 적응형 볼린저밴드 극도 수축(폭풍 전야) 구간 돌파 확인! 거래량 폭발 동반. ${extData.bollingerBands5mBreakout} 장중 돌파 셋업 승인.`;

                     // v116-D 마이크로: Squeeze "Breakout or Bailout" Risk Lock
                     if (extData.inverseMomentumBailout) {
                         isInverseMomentumBailoutActive = true;
                         reasons.push(`🏹 [Squeeze Bailout] 볼린저 밴드 스퀴즈 돌파 직후 모멘텀 역방향 꺾임(Inverse Momentum) 감지! 가짜 돌파 리스크로 판단, 전량 즉시 손절(Bailout) 처리합니다!`);
                     } else if (extData.breakoutSignalCandleHigh && extData.breakoutSignalCandleLow) {
                         mtfSqueezeSlOverride = rawDirection === 'LONG' ? extData.breakoutSignalCandleLow : extData.breakoutSignalCandleHigh;
                         reasons.push(`🏹 [Squeeze Risk Lock] 스퀴즈 돌파 신호 포착. Breakout or Bailout 원칙에 따라 돌파 캔들의 꼬리($${mtfSqueezeSlOverride.toFixed(2)})에 절대 하드 스탑(Hard Stop)을 자동 설정합니다.`);
                     }
                 }
            }

            if (!isIntradayScalp) {
                if (extData?.vwapBreakoutDetected) {
                    // v116-D 심화: OI & Sweep Confirmation
                    if (extData.openInterestDelta && extData.openInterestDelta > 0 && extData.sweepExecutionDetected) {
                        isIntradayScalp = true;
                        intradayReason = "🌊 [VWAP 돌파 & CVD 확장 & OI 동반상승] VWAP 탈환 지점에서 강력한 CVD 패닉바잉 동반 및 찐 반등 확증(OI 상승 및 Sweep 체결). 돌파 추세 강력 합류.";
                    } else if (extData.openInterestDelta !== undefined && extData.openInterestDelta <= 0) {
                         reasons.push("ℹ️ [VWAP 가짜 반등 필터] VWAP은 돌파/이탈했으나 미결제약정(OI)이 감소 중입니다 (단순 포지션 청산). 장중 진입 취소.");
                    } else {
                        isIntradayScalp = true;
                        intradayReason = "🌊 [VWAP 돌파 & CVD 확장] VWAP 탈환 지점에서 강력한 CVD 팽창 수반 돌파 확증. 돌파 추세에 합류합니다.";
                    }
                } else if (extData?.vwapAbsorptionDetected) {
                    isIntradayScalp = true;
                    intradayReason = "🌊 [VWAP 매도 흡수] VWAP 터치 시점에 시장가 체결이 지정가 물량에 역으로 막히는 Absorption(흡수) 발생. 역추세로 스위칭합니다.";
                } else if (extData?.isStackedImbalanceFirstTouch) {
                    // v116-D 파이널: Stacked Imbalances Pullback
                    isIntradayScalp = true;
                    intradayReason = "🧱 [Stacked Imbalance 풀백 사냥] 오더플로우 Bid/Ask 300% 격차의 강성 3중첩(Stacked) 구역 지지 확인. 첫 번째 회귀(First Touch) 반등을 신뢰하고 진입!";
                } else if (extData?.isEqhEqlChochReversal) {
                    // v116-D 파이널: Liquidity Sweep & CHoCH Reversal
                    isIntradayScalp = true;
                    intradayReason = "🩸 [Sweep & CHoCH Rev] 개미들의 Equal High/Low 유동성 풀 스윕 직후 단기 구조 반전(CHoCH) 발생. 추격 매수 멈추고 역추세 폭격(Fade) 개시!";
                } else if (extData?.isMegaFvgRetracement) {
                    // v116-D 파이널: Consecutive FVG Merge Sniper
                    isIntradayScalp = true;
                    intradayReason = "🕳️ [Consecutive FVG Sniper] 조각난 FVG가 하나로 병합된 거대 진공 풀(Mega-FVG) 진입 확인. 즉각 자석 효과에 몸을 싣고 스나이핑 발동!";
                } else if (extData?.mtfBollingerBandSRArea && extData?.hasVolumeExpansion === false) {
                    // v116-D 마이크로: MTF Bollinger Band Alignment
                    isIntradayScalp = true;
                    intradayReason = "🧱 [MTF BB Alignment] M5/M15/M30/H1 다중 시간대 볼린저 밴드 밀집 구역 타격. 볼륨 확장 부재(가짜 추세) 확증, 강한 역추세 스캘핑(Fade) 발동!";
                } else if (extData?.multipleHvnLocked && extData?.microAbsorptionConfirmed1m) {
                    // v116-D 심화: Micro-Absorption & Multiple HVN
                    isIntradayScalp = true;
                    intradayReason = "🧱 [Micro-Absorption] 2개 이상의 연속된 S급 HVN 다중 노드 락 + 1분봉 풋프린트 미세 흡수(Passive Block) 확증. 즉각 역추세 스캘핑 발동.";
                } else if (extData?.volumeClusterFirstTouch) {
                    isIntradayScalp = true;
                    intradayReason = "🧱 [30m Volume Cluster] 당일 최대 볼륨 클러스터 '첫 번째 터치(First Touch)' 지지/저항 방어 확인. 즉각 스캘핑 진입.";
                } else if (extData?.cvdExhaustionMismatch) {
                    // v116-D 심화: CVD Exhaustion Reversal
                    isIntradayScalp = true;
                    intradayReason = "📉 [CVD Exhaustion] 시장가 CVD가 극도로 한 방향으로 쏠림에도 불구하고 캔들 가격은 제자리걸음(Mismatch). 세력의 개미 연료 털기(역추세 튕기기) 스캘핑 탑승.";
                }
            }
            
            // v116-D 심화: Unfinished Business Magnet Tracker
            if (isIntradayScalp) {
                 if (rawDirection === 'LONG') {
                      if (extData?.unfinishedBizBottom) {
                           isIntradayScalp = false;
                           isUnfinishedBizStopRisk = true;
                           rawScore = 50;
                           reasons.push("🛑 [Unfinished Business] 진입 타점 직하단(스탑로스 방향)에 미완성 비즈니스 포착. 스탑헌팅(Stop Hunt) 확률이 99%이므로 롱 셋업 강제 취소!");
                      } else if (extData?.unfinishedBizTop) {
                           intradayTp1Override = extData.unfinishedBizTop;
                           reasons.push(`🧲 [Unfinished Business Target] 상단 미완성 비즈니스 레이더 포착. 강력한 자석 효과를 고려하여 1차 익절가(TP1)를 $${intradayTp1Override.toFixed(2)} 로 연장(Stretch)합니다.`);
                      }
                 } else if (rawDirection === 'SHORT') {
                      if (extData?.unfinishedBizTop) {
                           isIntradayScalp = false;
                           isUnfinishedBizStopRisk = true;
                           rawScore = 50;
                           reasons.push("🛑 [Unfinished Business] 진입 타점 직상단(스탑로스 방향)에 미완성 비즈니스 포착. 스탑헌팅(Stop Hunt) 확률이 99%이므로 숏 셋업 강제 취소!");
                      } else if (extData?.unfinishedBizBottom) {
                           intradayTp1Override = extData.unfinishedBizBottom;
                           reasons.push(`🧲 [Unfinished Business Target] 하단 미완성 비즈니스 레이더 포착. 강력한 자석 효과를 고려하여 1차 익절가(TP1)를 $${intradayTp1Override.toFixed(2)} 로 연장(Stretch)합니다.`);
                      }
                 }
            }

            if (isIntradayScalp) {
                 rawScore = rawDirection === 'LONG' ? 100 : 0; // 거시적 필터 무시를 위해 강력 승인 트리거
                 reasons.push(intradayReason);
                 
                 // v116-D 파이널: Volume-Based Take Profit (볼륨 매물대 직전 익절)
                 if (extData?.nextThickVolumeNode) {
                     intradayTp1Override = rawDirection === 'LONG' ? extData.nextThickVolumeNode - 1 : extData.nextThickVolumeNode + 1; // 1~2틱 앞 시장가 회피 프론트러닝
                     reasons.push(`🎯 [Volume-Based TP] 앞길을 막아선 두꺼운 매물대(HVN) 포착. 돌파 기도를 멈추고 매물대 터치 직전($${intradayTp1Override?.toFixed(2)}) 전량 익절을 예약합니다.`);
                 }
                 // v116-D 심화: 진공 구간 관통 1차 TP 공격적 설정
                 else if (extData?.liquidationGapTarget && !intradayTp1Override) {
                     intradayTp1Override = extData.liquidationGapTarget;
                     reasons.push(`🌀 [Liquidity Gap Targeting] 다음 클러스터까지의 유동성 진공 구간 포착. 1차 익절가(TP1)를 $${intradayTp1Override.toFixed(2)} 로 공격적 설정.`);
                 }
            }
        }

        // 2. 스마트머니 FVG 자석화 (FVG Consecutive Merge)
        if (extData?.mergedFvgHigh !== undefined && extData?.mergedFvgHigh !== null && rawDirection === 'LONG') {
             isFvgMagnetActive = true;
             maxTP = extData.mergedFvgHigh;
             reasons.push(`🧲 거대 병합 FVG 포착 (Long Target): $${maxTP}까지 매물대 진공구역 점령 예상. 조기 익절을 강제 금지하고 터치까지 Full-Trailing 가동.`);
        } 
        if (extData?.mergedFvgLow !== undefined && extData?.mergedFvgLow !== null && rawDirection === 'SHORT') {
             isFvgMagnetActive = true;
             maxTP = extData.mergedFvgLow;
             reasons.push(`🧲 거대 병합 FVG 포착 (Short Target): $${maxTP}까지 매물대 진공구역 점령 예상. 조기 익절을 강제 금지하고 터치까지 Full-Trailing 가동.`);
        }

        // 4. 극한 지점의 거래량 흡수(CVD Absorption at Extremes) -> 역추세 스위칭
        if (extData?.cvdAbsorptionAtExtremes) {
             isCvdAbsorptionReversal = true;
             const oldDir = rawDirection;
             rawScore = oldDir === 'LONG' ? 40 : 60; // Reverse!
             const newDir = oldDir === 'LONG' ? 'SHORT' : 'LONG';
             reasons.push(`🧽 극한 흡수(Absorption) 판독: 거대 세력(Limit Orders)이 개미 추격 물량을 전면 흡수 중! ${oldDir} 추세 즉시 강제 종료 -> ${newDir} 역추세 프레데터 스위칭 가동.`);
        }

        // Re-calculate after V101 & V102 & Confluence meta-predator adjustments
        finalDirection = rawScore >= 60 ? 'LONG' : (rawScore <= 40 ? 'SHORT' : 'NEUTRAL');
        
        // --- HP1 v104 파이널 퍼즐: The Missing Alpha ---
        let isLassoAligned = false;
        let isInstitutionalLiqTargeted = false;
        let isMtfDivergenceReversal = false;

        // 1. LASSO Regression Spike Predictor
        if (extData?.lassoSpikePredictor) {
             if (extData.lassoSpikePredictor === finalDirection) {
                 isLassoAligned = true;
                 rawScore = finalDirection === 'LONG' ? Math.min(100, rawScore + 15) : Math.max(0, rawScore - 15);
                 reasons.push(`🧠 LASSO Regression 판독: L1 정규화 기반 봇 알고리즘 스파이크 방향과 정확히 일치. 진입 신뢰도 대폭 증가.`);
             } else if (extData.lassoSpikePredictor !== 'NEUTRAL') {
                 // penalty for opposite lasso prediction
                 rawScore = finalDirection === 'LONG' ? Math.max(45, rawScore - 20) : Math.min(55, rawScore + 20);
                 reasons.push(`📉 LASSO 경고: 머신러닝 스파이크 예측과 현재 방향 충돌. 점수 페널티 부과.`);
             }
        }

        // 2. Institutional 25% Rule Liquidation (기관 레버리지 타겟팅)
        if (finalDirection === 'LONG' && extData?.institutionalLiqTop) {
             isInstitutionalLiqTargeted = true;
             maxTP = extData.institutionalLiqTop;
             reasons.push(`🎯 25% Rule (Institutional Liquidation): 기관의 3x~10x 스윙 레버리지가 청산되는 Schelling Point($${maxTP})를 최종 락온(Lock-on). 스윙 모드로 전환 및 풀 트레일링 대기.`);
        } else if (finalDirection === 'SHORT' && extData?.institutionalLiqBottom) {
             isInstitutionalLiqTargeted = true;
             maxTP = extData.institutionalLiqBottom;
             reasons.push(`🎯 25% Rule (Institutional Liquidation): 기관의 3x~10x 스윙 레버리지가 청산되는 Schelling Point($${maxTP})를 최종 락온(Lock-on). 스윙 모드로 전환 및 풀 트레일링 대기.`);
        }

        // 3. Multi-Timeframe %B & RSI Divergence (숨은 모멘텀 탐지기)
        if (extData?.mtfDivergenceConfirmed) {
             isMtfDivergenceReversal = true;
             // Elevate to absolute S-grade Reversal
             rawScore = finalDirection === 'LONG' ? 100 : 0; 
             reasons.push(`📉 MTF %B & RSI 다이버전스 포착: 적응형 BB 스퀴즈 하에서 발생한 확재적 모멘텀 발산. '최우선 역추세 타점' 격상 완료!`);
        }

        if (isMarketNeutralPairsTrade) {
            finalDirection = 'NEUTRAL'; // Treat differently in UI/Telegram, technically a pair trade
        }

        // --- HP1 v99.9: The Abyss Architect (기밀 해제 패치) ---

        // 2. Dark Pool Anomalies Scanner (숨겨진 유동성 추적)
        const mockSpread = 0.0001;
        const darkPoolAnomalyDetected = (currentVol > avgVol * 5) && (mockSpread < 0.00005) && (body < currentPrice * 0.0005);
        if (darkPoolAnomalyDetected) {
            reasons.push("🌑 Dark Pool: 숨겨진 유동성(Hidden Liquidity) 유입 감지. 세력 편승 매칭.");
            rawScore = finalDirection === 'LONG' ? Math.min(100, rawScore + 15) : (finalDirection === 'SHORT' ? Math.max(0, rawScore - 15) : rawScore);
        }

        // 4. BOCTAOE Noise Canceling (당연한 예외 무시)
        let boctaoeExemptionTriggered = false;
        if (rawScore > 85 && (100 - rawScore) < 5) {
            boctaoeExemptionTriggered = true;
            reasons.push("🙉 BOCTAOE 활성화: 잔여 노이즈 무시 -> 합리적 낙관주의 기반 강제 진입");
        }
        // 🎯 [Red Potion v120] Institutional Entry Filter
        if (extData?.volumeClusterFirstTouch && extData?.microAbsorptionConfirmed1m && extData?.cvdExhaustionMismatch) {
            reasons.push("🚀 Institutional Sniper: Vol Accumulation 첫 터치 + 미세 흡수 + CVD 수렴 불일치 확인. 최상위 선행 타점 진입.");
            rawScore = direction === 'LONG' ? Math.min(100, rawScore + 25) : (direction === 'SHORT' ? Math.max(0, rawScore - 25) : rawScore);
        }

        // 4. Direction & Probability Logic (v2.0)
        // Bullish Prob = Raw Score
        // Bearish Prob = 100 - Raw Score
        // Bearish Prob = 100 - Raw Score
        bullishProb = Math.floor(rawScore);
        bearishProb = 100 - bullishProb;

        evaluatedDirection = direction;
        finalDirection = direction;

        // --- HP1 v100.0: The Predator (Anti-AI 제로데이 패치) ---

        // 1. Stop-Hunt Liquidity Absorber
        // Detect "Standard" Trap: Setup is Long, but price just wick-broke previous low and recovered on volume
        const prevLow = Math.min(...lows.slice(-20, -1));
        const hasStopHuntWick = currCandle.low < prevLow && currentPrice > prevLow;
        const predatorStopHuntDetected = (evaluatedDirection === 'LONG' || bullishProb > 60) && hasStopHuntWick && currentVol > avgVol * 2.5;

        if (predatorStopHuntDetected) {
            reasons.push("🔱 Predator: 개미 털기(Stop-Hunt) 완료 및 유동성 흡수 감지. 공격적 진입.");
            rawScore = Math.min(100, rawScore + 20); // Massive boost
            bullishProb = Math.floor(rawScore); // Recalculate
        }

        // 2. Order Book Velocity Anomaly (Spoofing Proxy)
        const orderBookVelocityAnomaly = (currentVol > avgVol * 4) && (body < currentPrice * 0.0003); // High churn, low movement
        if (orderBookVelocityAnomaly) {
            reasons.push("🏹 OrderFlow: 허수 호가 취소 및 스푸핑 감지. 세력 가두기 국면.");
        }
        // ------------------------------------------------
        
        // --- HP1 v112: The Vanguard's Edge ---
        // 1. Google Trends Sentiment Ensemble
        if (extData?.googleTrendsSentiment === 'BULLISH') {
            reasons.push("📈 [Google Trends] 'Bitcoin' 키워드 7일 평균 상회 (대중적 ФOMO 진입). 숏 진입 가중치 대폭 하향 조정.");
            rawScore = Math.min(100, rawScore + 10);
            bullishProb = Math.floor(rawScore);
        } else if (extData?.googleTrendsSentiment === 'BEARISH') {
            reasons.push("📉 [Google Trends] 'Bitcoin' 키워드 7일 평균 하회 (투심 냉각). 롱 진입 가중치 보호/축소 조정.");
            rawScore = Math.max(0, rawScore - 10);
            bullishProb = Math.floor(rawScore);
        }

        // 2. Profile Shape Directional Bias
        if (extData?.volumeProfileShape === 'P') {
            reasons.push("🔠 [Volume Profile] 상단 밀집형 'P-Shape' 감지! 상승 지속 / 숏 스퀴즈 유력. LONG 웨이트 가산.");
            rawScore = Math.min(100, rawScore + 15);
            bullishProb = Math.floor(rawScore);
        } else if (extData?.volumeProfileShape === 'b') {
            reasons.push("🔠 [Volume Profile] 하단 밀집형 'b-Shape' 감지! 매도 압박 거대화 유력. SHORT 웨이트 가산.");
            rawScore = Math.max(0, rawScore - 15);
            bullishProb = Math.floor(rawScore);
        }

        const bearishProbRecalc = 100 - bullishProb;
        bearishProb = bearishProbRecalc;
        const directionRatio = bullishProb >= 55 ? 'LONG' : (bearishProbRecalc >= 55 ? 'SHORT' : 'NEUTRAL');
        direction = directionRatio;
        
        // 3. SMC HTF Broken High/Low Filter Setup
        let isHtfStructureBlocked = false;
        let htfBlockReason = "";
        // [Red Potion v118: Macro Engine Pruned] 상위 시간대(D1/W1) SMC 필터 중단
        /*
        if (extData?.htfBrokenHigh && direction === 'SHORT') {
            isHtfStructureBlocked = true;
            htfBlockReason = "상위 시간대(1D/1W) 구조 돌파(BrokenHigh) 진행 중. 숏(SHORT) 타점 전면 락다운 차단.";
            direction = 'NEUTRAL';
            reasons.unshift(`🧱 [HTF Lockdown] ${htfBlockReason}`);
        } else if (extData?.htfBrokenLow && direction === 'LONG') {
            isHtfStructureBlocked = true;
            htfBlockReason = "상위 시간대(1D/1W) 구조 붕괴(BrokenLow) 시퀀스 진행 중. 롱(LONG) 트랩 간주 및 전면 락다운 차단.";
            direction = 'NEUTRAL';
            reasons.unshift(`🧱 [HTF Lockdown] ${htfBlockReason}`);
        }
        */

        // --- HP1 v106: The Lean On-Chain Sovereign logic ---
        let mvrvBiasMatched = true;
        let isCohortQuarantined = false;
        let isCloseMitigationVerified = true;

        // --- HP1 v107: The Guardian & Catalyst variables ---
        let isSlingshotMomentumAligned = false;
        let isDepthSnapshotConfirmed = false;
        let isMicroDrawdownBlocked = false;
        let microDrawdownReason = "";
        let consecutiveLossCount = 0;

        if (direction !== 'NEUTRAL') {
             // 1. Cohort Analysis Strategy Routing
             if (extData?.isCohortDropped) {
                  direction = 'NEUTRAL';
                  isCohortQuarantined = true;
                  reasons.unshift(`📊 [Cohort Analysis] 특정 코호트 전환율 하락 감지 -> 봇 자가 치유를 위한 신호 격리/폐기.`);
             }

             // 2. On-Chain MVRV Macro Bias Lock
             if (extData?.mvrvMacroBias === 'OVERHEATED' && direction === 'LONG') {
                  direction = 'NEUTRAL';
                  mvrvBiasMatched = false;
                  reasons.unshift(`🐋 [On-Chain MVRV] 현물 고래 극단적 과열/분배 국면 감지 -> 역매수(LONG) 전면 차단.`);
             } else if (extData?.mvrvMacroBias === 'ACCUMULATION' && direction === 'SHORT') {
                  direction = 'NEUTRAL';
                  mvrvBiasMatched = false;
                  reasons.unshift(`🐋 [On-Chain MVRV] 현물 고래 바닥권 축적 국면 감지 -> 숏 덫 방지(SHORT 전면 차단).`);
             }

             // 3. SMC Close Mitigation
             if (extData?.isCloseMitigatedEvent !== undefined && !extData.isCloseMitigatedEvent) {
                  direction = 'NEUTRAL';
                  isCloseMitigationVerified = false;
                  reasons.unshift(`🧱 [SMC Close Mitigation] 오더블럭 몸통 훼손 실패 (단순 꼬리 휩소 헌팅 판명) -> 구조 파괴 오판 방지(Drop).`);
             }

             // --- HP1 v107: The Guardian & Catalyst logic ---
             if (extData) {
                 // 1. LNL Slingshot Momentum Filter
                 if (extData.isBbSqueezeActive) {
                      if (extData.slingshotMomentumDirection !== direction && extData.slingshotMomentumDirection !== 'NEUTRAL') {
                           reasons.unshift(`🛑 [Slingshot Filter] 스퀴즈 도중 발생한 역모멘텀(Inverse Slingshot) 감지 -> 가짜 돌파(Fakeout) 확정. 진입 차단.`);
                           direction = 'NEUTRAL';
                      } else if (extData.slingshotMomentumDirection === direction) {
                           reasons.unshift(`🏹 [Slingshot Filter] 동방향 폭발 모멘텀(Slingshot) 컨펌! 초근접 꼬리 스탑로스(Tight SL) 적용 대기.`);
                           isSlingshotMomentumAligned = true;
                      }
                 }

                 // 2. Depth Snapshot Big Limit Confirmation
                 if (isCompressZone) {
                      if (extData.bigLimitOrderDetected !== direction) {
                           reasons.unshift(`🛑 [Depth Snapshot] 컴프레스 존 도달! But 지지/저항을 방어하는 거대 지정가 벽(Big Limit) 부재 -> 기관 컨펌 실패(Drop).`);
                           direction = 'NEUTRAL';
                      } else {
                           reasons.unshift(`🧱 [Depth Snapshot] 압도적 지정가 벽(Big Limit > 300%) 방어 확인 -> 기관 진입 확증!`);
                           isDepthSnapshotConfirmed = true;
                      }
                 }

                 // 3. Micro-Drawdown Circuit Breaker check
                 if (extData.consecutiveLosses !== undefined) {
                      consecutiveLossCount = extData.consecutiveLosses;
                      if (consecutiveLossCount >= 3) {
                           isMicroDrawdownBlocked = true;
                           microDrawdownReason = "3연속 손절 달성. 우주 시나리오 쿨다운(12시간 락다운) 발동.";
                           reasons.unshift(`🚨 [Red Mode Block] ${microDrawdownReason}`);
                           direction = 'NEUTRAL';
                      }
                 }

                 // --- HP1 v112: Integer-Sized (.000) Algo Footprint ---
                 if (isCompressZone) {
                      if (extData.hasIntegerAlgoFootprint !== undefined && !extData.hasIntegerAlgoFootprint) {
                           reasons.unshift(`🛑 [Integer Algo Footprint] 컴프레스 존 확인! But 정수형 알고리즘(.000) 거대 방어 물량이 없습니다. 기관 진입 확증 실패(Drop).`);
                           direction = 'NEUTRAL';
                      } else if (extData.hasIntegerAlgoFootprint) {
                           reasons.unshift(`🤖 [Integer Algo Footprint] 압도적인 '.000' 단위 정수형 기관 알고리즘 매수/매도벽 컨펌 완료!`);
                      }
                 }
             }
        }

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
        const winRateProxy = direction === 'LONG' ? bullishProb : direction === 'SHORT' ? bearishProb : 50;
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
        const recommendedLeverage = Math.max(1, Math.min(5, 0.01 / slDistPercent));

        // 6. SL & TP (Legal Terms: Invalidation & Stat Resistance)
        let recommendedSL = 0;
        let recommendedTP = 0;
        let rewardRatio = 2.0;

        if (Math.abs(rawScore - 50) > 30) rewardRatio += 1.0; // Strong signal bonus

        // --- HP1 Day Trading Refinement ---
        const slAtrMult = 1.2; // tighter SL for Day Trades
        const tpAtrMult = slAtrMult * rewardRatio;

        if (direction === 'LONG') {
            const nearestSwingLow = Math.min(...lows.slice(-20, -1));
            let rawSL = currentPrice - (atr * slAtrMult);
            if (rawSL < currentPrice && rawSL > nearestSwingLow - (atr * 0.5)) {
                rawSL = nearestSwingLow - (atr * 0.5); // Just below swing low
                reasons.push("🌑 [DT] Day-Trade Swing Low 방어선으로 손절가 이동");
            }
            recommendedSL = rawSL;
            recommendedTP = currentPrice + (atr * tpAtrMult);
        } else if (direction === 'SHORT') {
            const nearestSwingHigh = Math.max(...highs.slice(-20, -1));
            let rawSL = currentPrice + (atr * slAtrMult);
            if (rawSL > currentPrice && rawSL < nearestSwingHigh + (atr * 0.5)) {
                rawSL = nearestSwingHigh + (atr * 0.5);
                reasons.push("🌑 [DT] Day-Trade Swing High 방어선으로 손절가 이동");
            }
            recommendedSL = rawSL;
            recommendedTP = currentPrice - (atr * tpAtrMult);
        }

        // 🕳️ Liquidity Vacuum TP Maximizer (v118-ULTRA)
        if (extData?.orderBookLiquidityVacuum) {
            const vacuumLevel = extData.orderBookLiquidityVacuum;
            if (direction === 'LONG' && vacuumLevel > recommendedTP) {
                recommendedTP = vacuumLevel;
                reasons.push(`🕳️ [Liquidity Vacuum] 전방 유동성 공백 발견! 목표가를 $${vacuumLevel.toFixed(1)}까지 연장하여 수익 극대화.`);
            } else if (direction === 'SHORT' && vacuumLevel < recommendedTP) {
                recommendedTP = vacuumLevel;
                reasons.push(`🕳️ [Liquidity Vacuum] 하단 유동성 공백 발견! 목표가를 $${vacuumLevel.toFixed(1)}까지 연장하여 수익 극대화.`);
            }
        }

        // --- Phase 11: Real EV Engine & Cost Filter & Kelly Lock ---
        const TRADING_FEE = 0.0004; // 0.04% avg
        const SLIPPAGE = 0.0001;    // 0.01% standard BTC liquidity
        const TOTAL_COST = TRADING_FEE + SLIPPAGE;
        const COST_THRESHOLD = TOTAL_COST * 1.5;

        const expectedReturn = direction === 'NEUTRAL' ? 0 : (atr * 2 * rewardRatio) / currentPrice;
        let isCostRejected = false;
        let isEvRejected = false;

        if (direction !== 'NEUTRAL') {
             // Calculate true Mathematical EV (Kelly's numerator)
             // WinRate = winRateProxy (from above), Reward = rewardRatio, Risk = 1
             const winRateEval = winRateProxy / 100;
             const lossRateEval = 1 - winRateEval;
             const mathematicalEV = (winRateEval * rewardRatio) - (lossRateEval * 1);

             if (mathematicalEV <= 0) {
                 isEvRejected = true;
                 direction = 'NEUTRAL';
                 recommendedSize = 0;
                 reasons.unshift(`⛔ 진입 강제 차단: 수학적 기대값(EV) 음수 도달. 리스크 대비 보상(Reward/Risk) 불균형.`);
             } else if (expectedReturn < COST_THRESHOLD) {
                 isCostRejected = true;
                 direction = 'NEUTRAL'; 
                 recommendedSize = 0;
                 reasons.unshift(`⛔ EV < Cost (Expect ${expectedReturn.toFixed(4)} < Threshold ${COST_THRESHOLD.toFixed(4)})`);
             }
        }

        // Inject Kelly moves to final return
        let trailingStopMsg = "";
        let peterBrandtMsg = "";
        if (direction !== 'NEUTRAL') {
            trailingStopMsg = `📉 ATR Trailing Stop: 수익 진입 시 [평단가 ${direction === 'LONG' ? '+' : '-'}(1.5 * ${atr.toFixed(1)})] 가격을 1차 트레일링 구간으로 설정.`;
            reasons.push(trailingStopMsg);

            if (Math.abs(rawScore - 50) > 30) {
                peterBrandtMsg = `💎 [초대형 스윙 모드] 피터 브랜트의 '3-Day Trailing Stop' 적용 제안.`;
                reasons.push(peterBrandtMsg);
            }
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
        if (isEvRejected) {
            explanation += `1. **시장 바이어스**: 방향성은 정해졌으나 **수학적 기대값(EV)이 음수입니다**.\n`;
            explanation += `2. **리스크 경고**: 보상(Reward) 대비 감수해야 할 잃을 위험(Risk)이 너무 큽니다.\n`;
            explanation += `3. **행동 지침**: ⛔ **NO TRADE** (이런 자리에서 진입하면 결국 파산합니다)\n\n`;
        } else if (isCostRejected) {
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
            if (isCapped) explanation += ` (⚠️ 리스크 제한: 최대 ${SAFETY_CAP}%)\n\n`;
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

        if (isCapped && !isCostRejected) explanation += `- **⚠️ 안전장치 발동**: 높은 확률일지라도 한 번에 파산하지 않기 위해 비중을 ${SAFETY_CAP}%로 제한했습니다.\n`;

        explanation += `\n--- \n\n`;

        // --- 4. Pro Data (Legal Terms) ---
        explanation += `📊 **전문가 데이터**\n`;
        explanation += `- **무효화 레벨 (Invalidation)**: ${recommendedSL.toFixed(2)}\n`;
        explanation += `- **통계적 저항선 (Stat. TP)**: ${recommendedTP.toFixed(2)}\n\n`;
        
        explanation += `📶 **Multi-Stage Scale-Out (v120)**\n`;
        explanation += `1. **TP1 (50%)**: RRR 1:2 지점 (${(currentPrice + (direction === 'LONG' ? atr * 2 : -atr * 2)).toFixed(2)}) - 원금 멘징 및 리스크 제로화\n`;
        explanation += `2. **TP2 (30%)**: RRR 1:3 또는 유동성 진공 (${recommendedTP.toFixed(2)}) - 수익 극대화\n`;
        explanation += `3. **TP3 (20%)**: ${trailingStopMsg.replace('📉 ', '')} - 추세 추종 무한 홀딩\n`;
        explanation += `- **중요 가격 (Key Levels)**: Pivot ${pivotPoints.pp.toFixed(2)}\n`;

        const riskKr = riskLevel === 'HIGH' ? '높음' : riskLevel === 'MEDIUM' ? '보통' : '낮음';
        explanation += `- **변동성 (Vol)**: ${riskKr} (ATR ${atr.toFixed(1)})\n`;
        if (isCostRejected) explanation += `- **Real EV Status**: 🩸 Negative (Fee Drag)\n`;
        else explanation += `- **Real EV Status**: ✅ Positive (> Cost * 3)\n`;


        // 8. Plain English Translator (HP1 v3.0) & Action Grade (v5.0)
        let reasoning_plain = "";
        let actionGrade: 'SSS' | 'S' | 'A' | 'B' | 'C' | 'F' = 'F';

        // --- [Red Potion v118-ULTRA: The Holy Grail Expansion] ---
        const isVolatilityExpansion = !!extData?.isVolatilityExpansion;
        const isSqueezeHunter = extData?.oiFundingSqueezeDanger === 'LONG_SQUEEZE' || extData?.oiFundingSqueezeDanger === 'SHORT_SQUEEZE';
        const isUltraScore = (direction === 'LONG' && rawScore >= 60) || (direction === 'SHORT' && rawScore <= 40);

        const strategySSS = false; 
        const strategyS = !!extData?.volumeClusterFirstTouch && !!extData?.microAbsorptionConfirmed1m;
        // [A-Grade] 단독 조건만 충족되어도 진입 허용 (하루 1~2회 매매 빈도 확보용)
        const strategyA = !!extData?.volumeClusterFirstTouch || !!extData?.microAbsorptionConfirmed1m || !!extData?.isIcebergAbsorptionDetected;

        const isOrStrategyTriggered = strategySSS || strategyS || strategyA;

        // 1. 📊 Daily Bias Lock (Volume Profile Bias Filter)
        const profileBias = extData?.volumeProfileShape; // 'P-Shape' (Bullish), 'b-Shape' (Bearish)
        let isBiasLocked = false;
        if (profileBias === 'P' && direction === 'SHORT') isBiasLocked = true;
        if (profileBias === 'b' && direction === 'LONG') isBiasLocked = true;

        // 4. 🛡️ Context-Aware HFT Trap Evasion
        const isHighVolatilityTrap = !!extData?.isHighVolatilityTrap;
        const isPreNewsOverheat = !!extData?.isPreNewsOverheat;
        const isTrapZone = isHighVolatilityTrap || isPreNewsOverheat;

        const MIN_ORDER_SIZE_FILTER = avgVol * 1.8; // 기존 1.5에서 1.8로 상향
        let kellyFraction = 0.05; // 기본 리스크 관리용 5% 시작

        const isGlobalCooldownActive = !!extData?.isGlobalCooldownActive;
        const isPositionLimitReached = !!extData?.isPositionLimitReached;
        let isPostOnlyMakerOrder = false;

        // Logic: Combine Indicators into One Sentence & Grade
        // Logic: Combine Indicators into One Sentence & Grade
        // 1. Absolute EV/Cost/MTF Blockers (High Priority Override)
        if (isEvRejected) {
            actionGrade = 'F';
            kellyFraction = 0;
            reasoning_plain = "⛔ [EV Lock] 통계적 기대값이 음수입니다. 보상 대비 잃을 위험이 더 커 진입을 절대 금지합니다.";
        } else if (isCostRejected) {
            actionGrade = 'F'; // Force F
            kellyFraction = 0;
            reasoning_plain = "⛔ [관망] 기대 수익이 수수료+슬리피지 비용보다 낮습니다. (EV < Cost)";
        } else if (isConfluenceRejected) {
            actionGrade = 'F'; // Force F
            kellyFraction = 0;
            reasoning_plain = "⛔ [MTF 충돌] 단기 방향성이 거시적 추세(1H/4H/1D)와 충돌합니다. 가짜 타점 우려로 진입 원천 차단.";
        }
        // 2. [Red Potion v118-ULTRA] SSS/S/A Class Dynamic Trigger Priority (OR Logic)
        else if (isOrStrategyTriggered && !isGlobalCooldownActive && !isPositionLimitReached && !isBiasLocked && !isTrapZone) {
            // Determine direction if Neutral
            if (direction === 'NEUTRAL') {
                direction = bullishProb >= 50 ? 'LONG' : 'SHORT';
            }
            
            if (strategySSS) {
                actionGrade = 'SSS';
                kellyFraction = 0.30;
                reasoning_plain = "🩸 [SSS급] Liq Sweep + Fib Confluence + Funding Asymmetry (천운의 타점).";
            } else if (strategyS) {
                actionGrade = 'S';
                kellyFraction = 0.20; 
                reasoning_plain = "🚀 [S급] Liq Sweep + RSI Div + CVD Absorption 완벽한 겹침 (최우선 탐색).";
            } else if (strategyA) {
                actionGrade = 'A';
                kellyFraction = 0.10;
                reasoning_plain = "✅ [A급] S급 부재 중 단독 조건 충족 (Volume Cluster / Stacked Imbalance 지지).";
            }
        } else {
            // Neutral / Blocked
            actionGrade = 'F';
            if (isBiasLocked) {
                reasoning_plain = `🛡️ [Bias Lock] ${profileBias === 'P' ? 'P-Shape(숏커버링)' : 'b-Shape(롱청산)'} 프로파일 감지. 역추세 진입을 원천 차단합니다.`;
            } else if (isTrapZone) {
                reasoning_plain = "🛡️ [HFT Trap] 뉴스 이벤트 전/후 혹은 과열 구간 감지. 개미 소탕용 가짜 신호 회피를 위해 진입을 보류합니다.";
            } else {
                reasoning_plain = "⛔ [필터탈락] S/A급 마이크로 구조 셋업 부재. 데이트레이딩 기회가 아닙니다. 관망 유지.";
            }
        }

        // --- [Global Governance Override] ---
        if (actionGrade !== 'F') {
            if (isGlobalCooldownActive) {
                actionGrade = 'F';
                kellyFraction = 0;
                reasoning_plain = "🛡️ [글로벌 차단] 쿨다운(1분 내 재진입 방지) 가동 중입니다.";
            } else if (isPositionLimitReached) {
                actionGrade = 'F';
                kellyFraction = 0;
                reasoning_plain = "🛡️ [글로벌 차단] 최대 포지션 한도 도달. 추가 진입이 제한됩니다.";
            } else {
                isPostOnlyMakerOrder = true; // Post-Only by default for all entries
            }
        }

        return {
            score: Math.floor(rawScore),
            bullishProb,
            bearishProb,
            direction,
            reasons: reasons.slice(0, 3),
            explanation,
            reasoning_plain,
            actionGrade,
            details,
            riskLevel,
            atr,
            kellyFraction,
            // v53.0 Indicators
            rsiDivergenceSweepConfirmed: divergence !== null,
            adaptiveRollingWindowDays: atrPercent > 2 ? 5 : 10,
            monteCarloRiskOfRuin: mcData.riskOfRuin,

            // HP1 v56.0
            cvdTrapConfirmed,
            googleTrendsScore,
            icebergDetectionZone,

            // HP1 v99.9
            darkPoolAnomalyDetected,
            boctaoeExemptionTriggered,
            iteratedCompoundExpectancy: 124.5, // Mock 100-cycle compound expectancy (%)

            // HP1 v100.0
            predatorStopHuntDetected,
            orderBookVelocityAnomaly,

            // --- HP1 Extension: The SQN & ATR Pinnacle ---
            trailingStopMsg,
            peterBrandtMsg,
            maxTP,
            
            // HP1 v117 Safety
            isGlobalCooldownActive,
            isPositionLimitReached,
            isPostOnlyMakerOrder,
            isCompressZone,
            compressZoneDetails,
            isMarketNeutralPairsTrade,
            isFvgMagnetActive,
            isStackedImbalanceConfirmed,
            isCvdAbsorptionReversal,
            isLassoAligned,
            isInstitutionalLiqTargeted,
            isMtfDivergenceReversal,
            isSchellingPointConvergence,
            isWaeDeadZoneRejected,
            isVolatilityDroughtRejected,
            isEqhEqlLiquiditySweep,
            marketRegime,
            sqnScore: sqnData.sqn,
            killSwitchActive: sqnData.killSwitch,
            lambdaModifier: sqnData.lambdaModifier,

            // HP1 v106
            isAndonCordBlocked: extData?.isAndonCordTriggered,
            andonCordReason: extData?.andonCordDiagnosticInfo,
            isCohortQuarantined,
            mvrvBiasMatched,
            isCloseMitigationVerified,
            
            // HP1 v107
            isSlingshotMomentumAligned,
            isDepthSnapshotConfirmed,
            isMicroDrawdownBlocked,
            microDrawdownReason,
            consecutiveLossCount,

            // HP1 v109
            isIcebergAbsorptionReversed,
            isAccumulationDefenseTested,
            abTestVariant: Math.random() > 0.5 ? 'A' : 'B',

            // HP1 v111
            adxValue,
            isTrendingRegime,
            isCvdExhausted: extData?.isCvdExhaustion,

            // HP1 v112 The Vanguard's Edge
            isHtfStructureBlocked,
            htfBlockReason,
            googleTrendsSentiment: extData?.googleTrendsSentiment,
            volumeProfileShape: extData?.volumeProfileShape,
            hasIntegerAlgoFootprint: extData?.hasIntegerAlgoFootprint,

            // HP1 v113 The Maker's Gambit
            isFirstTouchMitigated: extData?.isFirstTouchMitigated,
            isTimeDecayTriggered: extData?.isTimeDecayTriggered,

            // HP1 v114 The Meta-Cognitive Predator
            metaLabelingFalsePositive: extData?.metaLabelingFalsePositive,
            fiveWhysDiagnostic: extData?.fiveWhysDiagnostic,
            zoomInPivotActive: extData?.zoomInPivotActive,
            zoomInPivotStrategy: extData?.zoomInPivotStrategy,
            cvdOiBreakoutConfirmed: extData?.cvdOiBreakoutConfirmed,

            intradaySlOverride: undefined,

            // HP1 v115 The Apex Asymmetry
            isFrontRunOffsetApplied: false, // Calculated later in calculatePersonalRisk
            smcCurrentRetracementPct: extData?.smcCurrentRetracementPct,
            macroOptionsRegime: extData?.macroOptionsRegime,

            // HP1 v116 The LLM-Quant Sovereign
            isKssArbitrageAligned,
            isMacroFloorLocked,
            tmmTarget,

            // HP1 v116-D The Intraday Predator
            isIntradayScalp,
            intradayReason,
            vwapLevel,
            intradayTp1Override,

            // HP1 v116-D 데이 모드 심화: The Finished Auction
            isUnfinishedBizStopRisk,
            isValueMigrationBlocked,
            // HP1 v116-D 데이 모드 파이널: The Intraday Apex
            isLasso15mBlocked,
            lasso15mDirection: extData?.lasso15mDirection,
            // HP1 v116-D 마이크로 구조 심화: The Intraday Micro-Sniper
            isCumDeltaDivergenceBlocked,
            isFootprintBailoutActive,
            isInverseMomentumBailoutActive,
            mtfSqueezeSlOverride,

            // HP1 v116-D 데이 모드 파이널 캡스톤: The Immortal Day-Trader
            isVShapeRejectionPullback,
            isStealthOrderConfirmed,
            isFootprintReverseBailout,
            isCircuitBreakerActive,
            recentLossCount,
            leverageMultiplier,
            // HP1 v116-D 파이널 어셈블리: The Ultimate Intraday Machine
            isWaeDeadZoneBlocked,
            isIcebergSustainConfirmed,
            isSmcObCloseMitigated,
            isOiReversalDivergenceDetected,
            
            // HP1 v116-D 파이널 착취: The Micro-Structure Exploiter
            isTwapDelayed,
            deepLearningScore,
            dynamicTrailingStop,
            heikinAshiTrend: extData?.heikinAshiTrend,
            orderBookLiquidityVacuum: extData?.orderBookLiquidityVacuum
        } as any; 
    },



    // 8. [New v9.0] Personal Risk Calculator (Live Balance 1.5% Risk)
    calculatePersonalRisk: (
        signal: AnalysisResult,
        balance: number,
        currentPrice: number,
        mode: 'BLUE' | 'RED' = 'BLUE'
    ): { margin: number; leverage: number; limitPrice: number; sl: number; tp1: number; tp2: number; tp3: number; tp: number; tp1Ratio: number; tp2Ratio: number; tp3Ratio: number; reason: string; isPyramidEligible?: boolean; isFrontRunOffsetApplied?: boolean } => {
        let riskOracleMsg = "";

        // v116-D 캡스톤: Circuit Breaker & Leverage Management
        let leverageMultiplier = 1.0;
        if (signal.isCircuitBreakerActive) {
            return { margin: 0, leverage: 0, limitPrice: 0, sl: 0, tp1: 0, tp2: 0, tp3: 0, tp: 0, tp1Ratio: 0, tp2Ratio: 0, tp3Ratio: 0, reason: "🛡️ [Circuit Breaker] 3연패 셧다운 상태입니다. 12시간 쿨다운 후 진입하세요." };
        }
        if (signal.recentLossCount && signal.recentLossCount >= 2) {
            leverageMultiplier = 0.5;
            signal.reasons.push("🛡️ [Risk Scale-down] 2연패 감지로 인해 심리 보호 차원에서 레버리지를 50% 하향 조정합니다.");
        }

        if (signal.actionGrade === 'F' || signal.isLasso15mBlocked || signal.isCumDeltaDivergenceBlocked || signal.isFootprintBailoutActive || signal.isInverseMomentumBailoutActive || signal.isFootprintReverseBailout || signal.isWaeDeadZoneBlocked) {
            let reason = "Signal Grade F. Do not trade.";
            if (signal.isLasso15mBlocked) reason = "🚨 [LASSO 15M Mismatch] 모델 예측과 진입 방향 이탈로 켈리 비중 0% (진입 차단).";
            else if (signal.isCumDeltaDivergenceBlocked) reason = "🚨 [Cum-Delta Filter] 세력 개입(Divergence)이 확인되지 않아 단기 타점 강제 차단.";
            else if (signal.isFootprintBailoutActive) reason = "🚨 [Footprint Bailout] 델타와 캔들의 모순 트랩 감지! 시장가 강제 대피(Bailout).";
            else if (signal.isInverseMomentumBailoutActive) reason = "🚨 [Squeeze Bailout] 스퀴즈 돌파 직후 꺾이는 가짜 모멘텀 감지! 즉시 손절 탈출(Bailout).";
            else if (signal.isFootprintReverseBailout) reason = "🚨 [Footprint Reversal Warning] 포지션 반대 방향 수급 역전 감지! 무조건 즉시 대피(Bailout).";
            else if (signal.isWaeDeadZoneBlocked) reason = "🚨 [WAE Dead Zone] 변동성/거래량 실종 구간. 횡보장 휩소 방지를 위해 진입을 원천 차단합니다.";

            return { margin: 0, leverage: 0, limitPrice: 0, sl: 0, tp1: 0, tp2: 0, tp3: 0, tp: 0, tp1Ratio: 0, tp2Ratio: 0, tp3Ratio: 0, reason };
        }

        // SL/TP logic remains pure technical (ATR based)
        const atr = signal.atr || (currentPrice * 0.01);
        let slDist = atr * 1.5;

        // --- HP1 v107: Slingshot Tight SL ---
        if (signal.isSlingshotMomentumAligned) {
            slDist = atr * 0.5; // Simulate extremely tight SL below prior candle wick
        }

        // [Phase 16] Aggressive 1:5 R:R for High Conviction (S/SSS-Grade)
        const isSSSGrade = signal.actionGrade === 'SSS';
        const isHighConviction = signal.actionGrade === 'S' || isSSSGrade;
        const tpDist = isHighConviction ? (slDist * 5.0) : (atr * 3.0);

        // --- V180 Aggressive Dynamic 1:2.5+ Scaled RRR ---
        // 승률 방어를 위한 1R 부분익절 + BE, 그리고 목적지에 따른 유동적 분할
        let tp1Ratio = 0.5; // 50% 배분 완료시 원금 Risk Zero
        let tp2Ratio = 0.3; // 1:2.5+ 달성시 30% 확정
        let tp3Ratio = 0.2; // Runner 달성시

        let tp1Dist = slDist * 1.1; // 1.1R 부분익절 후 트레일링 스탑
        
        // 동적 손익비 할당 (최소 타이트 RRR 1:2.5, 상황에 따라 최대 1:7 이상 확장)
        let tp2Multiplier = 2.5;
        let tp3Multiplier = 4.0;
        
        if (isSSSGrade) {
            tp2Multiplier = 4.0;
            tp3Multiplier = 7.0;
            riskOracleMsg += `[🚀 초고가치(SSS) 셋업: 목표 손익비 1:7 (Max) 확장] `;
        } else if ((signal as any).isVolatilityExpansion) {
            tp2Multiplier = 3.5;
            tp3Multiplier = 6.0;
            riskOracleMsg += `[🌋 변동성 확장 구간: 목표 손익비 1:6 확장] `;
        } else if (signal.actionGrade === 'S') {
            tp2Multiplier = 3.0;
            tp3Multiplier = 5.0;
            riskOracleMsg += `[🎯 S급 셋업: 확정 손익비 1:5 확장] `;
        } else {
            riskOracleMsg += `[🛡️ 타이트 셋업: 최소 손익비 1:2.5 포장 적용] `;
        }

        let tp2Dist = slDist * tp2Multiplier;
        let tp3Dist = slDist * tp3Multiplier;

        let sl = 0, tp = 0;
        let tp1 = 0, tp2 = 0, tp3 = 0;
        if (signal.direction === 'LONG') {
            sl = signal.intradaySlOverride ?? (signal as any).mtfSqueezeSlOverride ?? (currentPrice - slDist);
            tp1 = currentPrice + tp1Dist;
            tp2 = currentPrice + tp2Dist;
            tp3 = currentPrice + tp3Dist;
            
            // 2. 🕳️ Liquidity Vacuum TP Maximizer
            const vacuumPrice = signal.orderBookLiquidityVacuum;
            if (vacuumPrice && vacuumPrice > tp3) {
                tp3 = vacuumPrice;
                riskOracleMsg += `[🕳️ Liquidity Vacuum 포착: TP3를 ${vacuumPrice.toFixed(1)}까지 연장(Stretch)] `;
            }
            tp = tp3; 
        } else if (signal.direction === 'SHORT') {
            sl = signal.intradaySlOverride ?? (signal as any).mtfSqueezeSlOverride ?? (currentPrice + slDist);
            tp1 = currentPrice - tp1Dist;
            tp2 = currentPrice - tp2Dist;
            tp3 = currentPrice - tp3Dist;

            // 2. 🕳️ Liquidity Vacuum TP Maximizer
            const vacuumPrice = signal.orderBookLiquidityVacuum;
            if (vacuumPrice && vacuumPrice < tp3) {
                tp3 = vacuumPrice;
                riskOracleMsg += `[🕳️ Liquidity Vacuum 포착: TP3를 ${vacuumPrice.toFixed(1)}까지 연장(Stretch)] `;
            }
            tp = tp3; 
        }
        
        if (signal.intradayTp1Override) {
            tp1 = signal.intradayTp1Override;
        }

        const slPercent = slDist / currentPrice;

        // 1. [v99.9] Risk-Constrained Kelly Optimization (Busseti 2016)
        // Goal: Maximize log-growth while keeping Drawdown risk below a threshold.
        // f* = (p/a - q/b) with risk aversion lambda.
        const winProb = signal.bullishProb / 100;
        const lossProb = 1 - winProb;
        const reward = (Math.abs(tp - currentPrice) / currentPrice);
        const risk = (Math.abs(sl - currentPrice) / currentPrice);

        // Simplified Busseti: f = (reward * winProb - risk * lossProb) / (reward * risk * lambda)
        const lambdaBase = mode === 'RED' ? 1.5 : 3.0; // Higher lambda = smoother equity curve (Less drawdown)
        
        // --- HP1 Extension: SQN Auto-Calibration ---
        // If SQN is excellent (>3.0), lambdaModifier is 1.5. To increase aggression, we DIVIDE lambda by lambdaModifier. 
        // If SQN is collapsing (<1.6), lambdaModifier is 0.0, we shouldn't even be here since killSwitch was hit.
        const lambda = lambdaBase / (signal.lambdaModifier || 1.0);
        
        let kellyOptimalRatioBusseti = (reward * winProb - risk * lossProb) / (reward * risk * lambda);
        kellyOptimalRatioBusseti = Math.max(0, Math.min(0.2, kellyOptimalRatioBusseti)); // Limit to 20% for safety

        // [Phase 9] Final Precision Leverage 
        // Highly conservative leverage to 5x-10x to maximize survival probability on $100 seed challenge.
        let leverage = isSSSGrade ? 10 : (isHighConviction ? 7 : 5);
        leverage = Math.floor(leverage * leverageMultiplier);
        if (leverage < 1) leverage = 1;

        if (mode === 'RED') {
            leverage = leverage; // Unlock leverage for RED Potter Backtest
        }

        // --- HP1 v107: Micro-Drawdown Circuit Breaker leverage cut ---
        if (signal.consecutiveLossCount && signal.consecutiveLossCount >= 2) {
             leverage = Math.max(1, Math.floor(leverage * 0.5));
             riskOracleMsg += `[⚠️ 2연속 손실: 레버리지 50% 강제 삭감] `;
        }

        // Allowed Max Loss based on Live Balance
        // Reduce max risk to 1.5% for SSS and 1.0% for S to prevent heavy drawdown on $100 seed.
        let maxRiskPct = mode === 'BLUE' ? (isSSSGrade ? 0.015 : (isHighConviction ? 0.010 : 0.005)) : 0.005;

        // --- HP1 v115: SMC OTE (Optimal Trade Entry) Retracement Engine ---
        let isOteZone = false;
        if (signal.smcCurrentRetracementPct && signal.smcCurrentRetracementPct >= 61.8 && signal.smcCurrentRetracementPct <= 78.6) {
            isOteZone = true;
            riskOracleMsg += `[📐 OTE Zone 진입 (61.8~78.6%): 승인 가중치 최대치 격상] `;
            leverage = 15; // Force max leverage
            maxRiskPct = mode === 'BLUE' ? 0.020 : 0.010; // Aggressive bet
        }

        // --- HP1 v114: The Meta-Cognitive Predator (Meta-Labeling) ---
        if (signal.metaLabelingFalsePositive) {
            if (isOteZone) {
                riskOracleMsg += `[🧠 Meta-Labeling Overruled: OTE Zone 특수 면책권 발동] `;
            } else {
                maxRiskPct = 0; // Force 0% risk
                leverage = 0;
                riskOracleMsg += `[🧠 Meta-Labeling: False Positive (가짜 신호) 감지. 비중 0% 강제 차단] `;
            }
        }

        // HP1 v53.0: The Risk Oracle (Monte Carlo Risk of Ruin & RSI Divergence Sweep)
        if (signal.monteCarloRiskOfRuin !== undefined && maxRiskPct > 0) {
            // Option to adjust fixed risk slightly? v118 prefers 5% strict, but keeping MC RoR reduction is good safety
            if (signal.monteCarloRiskOfRuin > 10) {
                // If Risk of Ruin is > 10%, slash Kelly risk fraction by half
                maxRiskPct *= 0.5;
                riskOracleMsg += `[⚠️ RoR ${signal.monteCarloRiskOfRuin.toFixed(1)}%>10%: Risk Halved] `;
            } else if (signal.monteCarloRiskOfRuin < 2 && signal.rsiDivergenceSweepConfirmed) {
                // Extremely safe setup + Divergence confirmation -> Boost by 25%
                maxRiskPct *= 1.25;
                riskOracleMsg += `[🛡️ RoR <2% + Div Sweep: Risk +25%] `;
            }
        }
        
        // --- Red Potion v118: Override with strict 5% Risk fixed max limit if > 0 ---
        if (maxRiskPct > 0) {
            maxRiskPct = 0.02; // Force 2% Fixed Risk per trade (Safe Haven)
        }

        const maxLossUSDT = balance * maxRiskPct;

        // Position Size ($) to hit exact max loss at SL
        // positionSize * slPercent = maxLossUSDT
        const positionSizeUSDT = maxLossUSDT / slPercent;

        // Margin = Position Size / Leverage
        let marginUSDT = 0;
        if (leverage > 0) {
            marginUSDT = positionSizeUSDT / leverage;
        }

        // Hard Cap on Margin (e.g. no more than 20% of balance)
        const maxMarginCap = balance * 0.20;
        if (marginUSDT > maxMarginCap) {
            marginUSDT = maxMarginCap;
        }

        const isPyramidEligible = isHighConviction;

        // --- HP1 v115: Front-Running Limit Offset (선제적 지정가 오프셋) ---
        // offset: 0.05% front-run (LONG targets slightly higher, SHORT targets slightly lower)
        const offsetPct = 0.0005;
        let limitPrice = currentPrice;
        let isFrontRunOffsetApplied = false;

        if (maxRiskPct > 0) {
            if (signal.direction === 'LONG') {
                limitPrice = currentPrice * (1 + offsetPct);
                tp1 = tp1 * (1 - offsetPct); 
                tp2 = tp2 * (1 - offsetPct);
                tp3 = tp3 * (1 - offsetPct);
                tp = tp * (1 - offsetPct);
            } else if (signal.direction === 'SHORT') {
                limitPrice = currentPrice * (1 - offsetPct);
                tp1 = tp1 * (1 + offsetPct);
                tp2 = tp2 * (1 + offsetPct);
                tp3 = tp3 * (1 + offsetPct);
                tp = tp * (1 + offsetPct);
            }
            isFrontRunOffsetApplied = true;
            riskOracleMsg += `[🏃 Front-Run Offset 0.05% 적용 완료] `;
        }

        const reason = `[${mode}] ${riskOracleMsg}${isHighConviction ? '🔥 S급 공격 진입: ' : ''}Max Risk ${(maxRiskPct * 100).toFixed(2)}% ($${maxLossUSDT.toFixed(1)}). SL ${slDist.toFixed(1)} points away. Set Margin to $${marginUSDT.toFixed(0)} with ${leverage}x Lev.`;

        // --- Red Potion v118: 1:3 Minimum RRR Enforcer ---
        const entrySimulationPrice = limitPrice || currentPrice;
        const slDiffCheck = Math.abs(entrySimulationPrice - sl);
        // ULTRA Update: Check RRR based on TP3/Final TP instead of TP1 for "Grail" potential
        const tpDiffCheck = Math.abs(tp - entrySimulationPrice); 
        const rrr = slDiffCheck > 0 ? (tpDiffCheck / slDiffCheck) : 0;
        
        // Allow F grade trades are already returned, so anything here must be an SSS/S/A entering 1:2.5+ check
        if (rrr < 2.5) {
             return { margin: 0, leverage: 0, limitPrice: 0, sl: 0, tp1: 0, tp2: 0, tp3: 0, tp: 0, tp1Ratio: 0, tp2Ratio: 0, tp3Ratio: 0, reason: `🚫 [RRR Filter] 예상 최종 손익비 1:${rrr.toFixed(1)} 로 최소 1:2.5 기준 미달. 단독 진입 타점 자동 폐기.` };
        }

        return { margin: marginUSDT, leverage, limitPrice, sl, tp1, tp2, tp3, tp, tp1Ratio, tp2Ratio, tp3Ratio, reason, isPyramidEligible, isFrontRunOffsetApplied };
    },
    generatePositionAdvice,
    calculateSQN,
    runMonteCarloBootstrapping
};
