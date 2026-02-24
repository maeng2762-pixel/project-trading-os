/**
 * HP1 v17.0: Pluggable AI Provider Interface
 * Zero Marginal Cost Architecture
 * 
 * Defines the contract for AI providers to allow seamless swapping
 * between expensive commercial APIs (ChatGPT) and cost-free 
 * locally hosted Open Source models (Llama 3, Mistral, etc.).
 */

export interface MasterSignal {
    direction: 'LONG' | 'SHORT';
    baseStopLossPct: number;    // e.g., 1.2
    baseTargetPct: number;      // e.g., 2.8
    confidenceScore: number;    // 0-100
    narrative: string;          // 1-sentence reasoning
    timestamp: number;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async generateMasterSignal(marketData?: unknown): Promise<MasterSignal> {
        // Simulates server taking 15 minutes to process, but returning instantly here for UX
        const isLong = Math.random() > 0.5;
        // Generate realistic but aggressive R:R
        const slPct = 0.5 + Math.random() * 1.5; // 0.5% to 2.0%
        const tpPct = slPct * (1.5 + Math.random() * 3.5); // 1.5R to 5.0R

        return {
            direction: isLong ? 'LONG' : 'SHORT',
            baseStopLossPct: Number(slPct.toFixed(2)),
            baseTargetPct: Number(tpPct.toFixed(2)),
            confidenceScore: Math.floor(60 + Math.random() * 35), // 60-95
            narrative: isLong
                ? "Demand zone accumulation detected with trapped short sellers."
                : "Supply zone distribution pattern active, momentum failing.",
            timestamp: Date.now()
        };
    }
}
