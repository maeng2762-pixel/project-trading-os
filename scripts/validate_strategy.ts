
import { BacktestEngine } from '../src/lib/server/Backtest';

async function main() {
    console.log("=== Starting Kelly v6.0 Validation Protocol ===");
    try {
        const engine = new BacktestEngine();
        await engine.run();
    } catch (error) {
        console.error("Backtest Failed:", error);
    }
}

main();
