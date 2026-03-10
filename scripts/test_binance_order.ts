import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.vercel.prod' });

async function run() {
    try {
        const apiKey = process.env.BINANCE_API_KEY;
        let apiSecret = process.env.BINANCE_API_SECRET;

        if (apiSecret && apiSecret.includes('\\n')) {
            apiSecret = apiSecret.replace(/\\n/g, '\n');
        }

        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            options: { defaultType: 'future' },
            enableRateLimit: true
        });

        await exchange.loadMarkets();
        const symbol = 'BTC/USDT';

        const ticker = await exchange.fetchTicker(symbol);
        const entryPrice = ticker.last || 60000;
        
        let qty = 110 / entryPrice;
        let balance = 0;

        const exchangeBalance = await exchange.fetchBalance({ type: 'future' });
        if (exchangeBalance.free && (exchangeBalance.free as any)['USDT']) {
            balance = (exchangeBalance.free as any)['USDT'];
        }

        console.log("Balance:", balance);
        
        // Match logic
        let formattedQty = Number(exchange.amountToPrecision(symbol, qty));
        if (formattedQty * entryPrice < 101) {
            formattedQty += 0.001; 
            formattedQty = Number(exchange.amountToPrecision(symbol, formattedQty));
        }
        qty = formattedQty;

        let leverage = Math.ceil((qty * entryPrice) / balance);
        // Force minimum leverage of 2 to be safe for fees
        if (leverage < 2) leverage = 2;
        if (leverage > 20) leverage = 20;

        console.log(`Risk Profile: Qty=${qty}, entryPrice=${entryPrice}, Leverage=${leverage}x, Notional=${(qty * entryPrice).toFixed(2)} USDT`);

        await exchange.setLeverage(leverage, symbol);
        console.log("Leverage set successfully");
        
        const side = 'buy';
        
        console.log("Placing market order...");
        const order = await exchange.createMarketOrder(symbol, side, qty);
        console.log("Order placed:", order.id);
        
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}
run();
