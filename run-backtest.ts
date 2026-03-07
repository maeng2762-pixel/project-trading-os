import { BacktestEngine } from './src/lib/server/Backtest';

async function main() {
    const engine = new BacktestEngine();
    await engine.run();
}

main().catch(console.error);
