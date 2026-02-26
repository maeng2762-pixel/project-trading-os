/**
 * HP1 v17.0: Pluggable AI Provider Interface
 * Zero Marginal Cost Architecture
 * 
 * Defines the contract for AI providers to allow seamless swapping
 * between expensive commercial APIs (ChatGPT) and cost-free 
 * locally hosted Open Source models (Llama 3, Mistral, etc.).
 */

export interface MasterSignal {
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    baseStopLossPct: number;    // e.g., 1.2
    baseTargetPct: number;      // e.g., 2.8
    confidenceScore: number;    // 0-100
    narrative: string;          // 1-sentence reasoning
    timestamp: number;
    basePrice: number;          // Standard base price representing signal broadcast
    entryZoneMin: number;       // The lower bound for the optimal entry zone
    entryZoneMax: number;       // The upper bound for the optimal entry zone
    isRejected?: boolean;       // High Edge Guard rejection flag
    rejectReason?: string;      // Reason for rejection

    // --- HP1 v20.0 Smart Money Features ---
    smcConfluence?: string[];   // e.g. ["Liquidity Sweep", "FVG", "Order Block"]
    isSqueezeActive?: boolean;  // Volatility Squeeze status
    kellyRiskPct?: number;      // 0.0 to 100.0 (percentage of seed)
}


export interface AIProvider {
    /**
     * Initializes the provider with necessary credentials or endpoints.
     */
    init(config: Record<string, string>): void;

    /**
     * Analyzes current market data and broadcasts ONE master signal
     * to all connected clients.
     */
    generateMasterSignal(marketData?: unknown): Promise<MasterSignal>;
}

// Mock Implementation for Frontend Dev (RedPotionArena 1-to-Many Simulation)
export class MockBroadcastProvider implements AIProvider {
    init() {
        console.log('[Mock AI] Initialized broadcast provider.');
    }

    async generateMasterSignal(currentPrice?: number): Promise<MasterSignal> {
        // Mock market price at broadcast time
        const basePrice = (currentPrice !== undefined && currentPrice > 0) ? currentPrice : 65000 + (Math.random() * 1000 - 500);

        // 1. Volatility Squeeze Filter (ATR-based Adaptive BB)
        const isSqueezeActive = Math.random() > 0.15; // 85% chance of valid squeeze to keep demo playable

        if (!isSqueezeActive) {
            return {
                direction: 'NEUTRAL',
                baseStopLossPct: 0,
                baseTargetPct: 0,
                confidenceScore: 0,
                narrative: "⚠️ 현재 시장은 엣지(Edge)가 없는 무작위 구간입니다. 에너지가 응축(Squeeze)될 때까지 대기하십시오.",
                timestamp: Date.now(),
                basePrice: Math.round(basePrice),
                entryZoneMin: 0,
                entryZoneMax: 0,
                isRejected: true,
                rejectReason: "⚠️ [Volatility Filter] 밴드 폭(Bandwidth) 팽창 중. 에너지가 응축(Squeeze)될 때까지 대기하십시오.",
                isSqueezeActive: false,
                smcConfluence: [],
                kellyRiskPct: 0
            };
        }

        const isLong = Math.random() > 0.5;

        // Simulate both Pullback and Breakout scenarios randomly
        const isBreakoutSetup = Math.random() > 0.5;
        let entryBase = basePrice;
        if (isBreakoutSetup) {
            // Entry is ahead of current price
            entryBase = isLong ? basePrice * (1 + 0.001 + Math.random() * 0.003) : basePrice * (1 - 0.001 - Math.random() * 0.003);
        } else {
            // Entry is behind current price (pullback)
            entryBase = isLong ? basePrice * (1 - 0.002 - Math.random() * 0.005) : basePrice * (1 + 0.002 + Math.random() * 0.005);
        }

        // Generate realistic R:R
        const slPct = 0.5 + Math.random() * 1.5; // 0.5% to 2.0%
        const tpPct = slPct * (0.8 + Math.random() * 3.5); // 0.8R to 4.3R
        const predictedRr = tpPct / slPct;
        const distanceToEntry = Math.abs((entryBase - basePrice) / basePrice * 100);

        // Sanity Check
        const isTooClose = distanceToEntry < 0.05; // Less than 0.05% distance
        const whipsawRisk = Math.random() > 0.85; // 15% chance of whipsaw detected
        const isRejected = predictedRr < 2.0 || isTooClose || whipsawRisk;

        let rejectReason = "⚠️ 현재 강력한 엣지(High R:R) 구간이 아닙니다. 자본을 지키며 관망하십시오.";
        if (isTooClose || whipsawRisk) {
            rejectReason = "⚠️ 현재 변동성으로 인해 타점 신뢰도가 낮아 시그널을 취소합니다.";
        }

        // 2. SMC Engine: Confluence 
        const smcConfluence = ["💎 Liquidity Sweep (유동성 사냥)", "⬛ FVG (공정가치갭)", "🧱 Order Block (기관 집중구역)"];
        const confidenceScoreNum = isRejected ? 0 : Math.floor(65 + Math.random() * 30); // 65-95

        // 3. Risk-Constrained Kelly Position Sizing
        let kellyRiskPct = 0;
        if (!isRejected) {
            const winProb = confidenceScoreNum / 100;
            // Kelly Formula: fraction = W - ((1 - W) / R)
            let kellyFraction = winProb - ((1 - winProb) / predictedRr);
            if (kellyFraction < 0) kellyFraction = 0; // Negative edge fallback

            // Bisection algorithm simulated for Max Drawdown Constraint
            const MAX_DRAWDOWN_RISK = 0.05; // Maximum 5% risk per trade logic lock-in
            kellyRiskPct = kellyFraction * 0.5 * 100; // Half-Kelly default
            if (kellyRiskPct > (MAX_DRAWDOWN_RISK * 100)) {
                kellyRiskPct = MAX_DRAWDOWN_RISK * 100; // Risk-Constraint Cap
            }
            if (kellyRiskPct < 1.0) kellyRiskPct = 1.0; // Min 1.0%
            kellyRiskPct = Number(kellyRiskPct.toFixed(1));
        }

        return {
            direction: isLong ? 'LONG' : 'SHORT',
            baseStopLossPct: isRejected ? 0 : Number(slPct.toFixed(2)),
            baseTargetPct: isRejected ? 0 : Number(tpPct.toFixed(2)),
            confidenceScore: confidenceScoreNum,
            narrative: isRejected
                ? rejectReason
                : (isLong
                    ? "Smart Money 수요존 구조 돌파 및 풀백(Re-test) 감지. 저격 지점 생성 완료."
                    : "Smart Money 공급존 블록(Order Block) 거부 감지. 숏 엣지 포착."),
            timestamp: Date.now(),
            basePrice: Math.round(basePrice),
            entryZoneMin: Math.round(isLong ? entryBase * 0.999 : entryBase * 0.999),
            entryZoneMax: Math.round(isLong ? entryBase * 1.001 : entryBase * 1.001),
            isRejected,
            rejectReason,
            isSqueezeActive: true,
            smcConfluence,
            kellyRiskPct
        };
    }
}
