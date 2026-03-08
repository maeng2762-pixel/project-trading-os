import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkLiveBalance() {
    try {
        console.log("🔐 [Live Connection] Starting Binance Live API Check...");
        const exchange = new ccxt.binance({
            apiKey: process.env.BINANCE_API_KEY,
            secret: process.env.BINANCE_API_SECRET,
            options: { defaultType: 'future' },
            enableRateLimit: true
        });

        const balance = await exchange.fetchBalance();
        const freeBalances = balance.free as any;
        const usdt = freeBalances?.USDT || 0;
        console.log(`\n✅ [Live Connection] Success! Connected to Binance Futures.`);
        console.log(`💰 Available Real Margin (USDT): $${Number(usdt).toFixed(2)}`);
        
    } catch (e: any) {
        console.error("❌ Live Connection Failed:", e.message);
    }
}

checkLiveBalance();
