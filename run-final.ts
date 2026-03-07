
import { BacktestEngine } from './src/lib/server/BacktestV116';

async function main() {
    const engine = new BacktestEngine();
    await engine.run();
}

main().catch(console.error);
