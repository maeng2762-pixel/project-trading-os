import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.vercel.prod' });

async function run() {
    try {
        const apiKey = process.env.BINANCE_API_KEY;
        let apiSecret = process.env.BINANCE_API_SECRET;

        console.log("Original Secret Length:", apiSecret?.length);

        if (apiSecret && apiSecret.includes('\\n')) {
            apiSecret = apiSecret.replace(/\\n/g, '\n');
            console.log("Secret had escaped newlines. Converted.");
        }
        
        console.log("Secret Starts with:", apiSecret?.substring(0, 30));
        console.log("Secret Ends with:", apiSecret?.substring(apiSecret.length - 30));

        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            options: { defaultType: 'future' },
            enableRateLimit: true
        });

        console.log("Fetching balance...");
        const balance = await exchange.fetchBalance({ type: 'future' });
        console.log("SUCCESS! Balance:", balance.USDT?.free || 0);
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}
run();
