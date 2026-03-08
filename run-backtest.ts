import { BacktestEngine } from './src/lib/server/Backtest';

async function main() {
    const engine = new BacktestEngine();
    
    const daysToTest = [7, 15, 30, 50, 100];
    
    for (const days of daysToTest) {
        await engine.run(days);
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

main().catch(console.error);
