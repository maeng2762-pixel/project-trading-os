import { TradeEngine } from '../src/lib/server/TradeEngine';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load keys

async function runTestTrade() {
    const mockSignal = {
        direction: 'LONG',
        basePrice: 90000,
        baseStopLossPct: 1, // 1%
        baseTargetPct: 2.5, // 2.5%
        kellyRiskPct: 1.0, // 1% risk of account
        status: 'EXECUTING'
    };

    console.log("🚀 Running Testnet Execution...");
    const result = await TradeEngine.executeTrade('TEST_ADMIN', mockSignal);
    console.log("\n[Test Result] 📊", result);
}

runTestTrade();
