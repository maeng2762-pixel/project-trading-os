import { AnalysisEngine } from './src/lib/analysis';

// Create realistic-looking candles (mock data)
const baseTime = Date.now() - 50 * 60 * 1000;
const generateCandles = (count: number, intervalMinutes: number, volatility: number = 500) => {
    return Array.from({ length: count }, (_, i) => {
        const basePrice = 50000;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = basePrice + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.abs(Math.random() * volatility * 0.5);
        const low = Math.min(open, close) - Math.abs(Math.random() * volatility * 0.5);
        return {
            timestamp: baseTime + i * intervalMinutes * 60 * 1000,
            open, high, low, close,
            volume: 1000 + Math.random() * 500
        };
    });
};

const candlesStrong = {
    '5m': generateCandles(200, 5, 2000), // > 0.02 ratio for HIGH_VOL
    '15m': generateCandles(200, 15, 2000),
    '1h': generateCandles(200, 60, 2000),
    '4h': generateCandles(200, 240, 2000)
};

const candlesFlat = {
    '5m': generateCandles(200, 5, 150), // Over 0.15% atr but under 0.02 for range
    '15m': generateCandles(200, 15, 150),
    '1h': generateCandles(200, 60, 150),
    '4h': generateCandles(200, 240, 150)
};

// ==========================================
// 1. 하락장/변동성 폭발 숏 폭격 테스트
// ==========================================
console.log("=== 1. 하락장(변동성 폭발) 숏 시그널 테스트 ===");
const extDataShort = {
    rsi: 25, // 극단적 숏 (원래는 투심 공포 락다운 대상)
    macroOptionsRegime: 'BEARISH',
    isVolatilityExpansion: true, // 시장 체제 상관없이 강제 진입권 부여
    volumeClusterFirstTouch: true, // 전략 단독 조건 충족 (A급)
    fundingRate: -0.001, // 팝업창 공포 (원래 숏 차단이지만 리미터 해제 테스트)
};

const resultShort = AnalysisEngine.analyze(candlesStrong as any, extDataShort as any);
const shortKelly = resultShort.kellyFraction || 0;
console.log(`[하락장 숏] 타점등급: ${resultShort.actionGrade}`);
console.log(`[하락장 숏] 추천비중: ${(shortKelly * 100).toFixed(0)}%`);
console.log(`[하락장 숏] 베어/불: ${resultShort.bearishProb}% vs ${resultShort.bullishProb}%`);
console.log(`[하락장 숏] 근거요약:`, resultShort.reasons.slice(0, 3));


console.log("\n=== 2. 횡보장 손익비 스캘핑 테스트 ===");
const extDataRange = {
    rsi: 38,
    macroOptionsRegime: 'STABLE', // => 횡보장 (RANGE/LOW_VOL) 유도
    isVolatilityExpansion: false,
    volumeClusterFirstTouch: true, // A급 타점 제공
    isCompressZone: true,
    isEqhEqlLiquiditySweep: true, // SSS급 기본 조건 추가 (유동성 스윕)
    // 유저의 요구: 횡보장이어도 "좋은 타점"이면 F로 무시하지 말고 쏴달라.
    // 현재 코드에서는 RANGE 락이 걸려있음. 이를 뚫는지 확인해야 함.
    sqn: 2.5 // Add mock SQN to avoid kill switch 
};

const resultRange = AnalysisEngine.analyze(candlesFlat as any, extDataRange as any);
const rangeKelly = resultRange.kellyFraction || 0;
console.log(`[횡보장] 타점등급: ${resultRange.actionGrade}`);
console.log(`[횡보장] 추천비중: ${(rangeKelly * 100).toFixed(0)}%`);
console.log(`[횡보장] 베어/불: ${resultRange.bearishProb}% vs ${resultRange.bullishProb}%`);
console.log(`[횡보장] 최종방향: ${resultRange.direction}`);
console.log(`[횡보장] 근거요약:`, resultRange.reasons.slice(0, 3));
