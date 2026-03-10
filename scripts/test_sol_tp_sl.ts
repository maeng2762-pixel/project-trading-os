import 'dotenv/config';
import ccxt from 'ccxt';

async function main() {
    process.env.BINANCE_API_SECRET = process.env.BINANCE_API_SECRET?.replace(/\\n/g, '\n');
    console.log("Loading CCXT...");
    const exchange = new ccxt.binance({
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_API_SECRET,
        enableRateLimit: true,
        options: {
            defaultType: 'future',
            adjustForTimeDifference: true,
            recvWindow: 60000,
        }
    });

    try {
        const symbol = 'SOL/USDT';
        console.log(`Loading markets for ${symbol}...`);
        await exchange.loadMarkets();
        
        const market = exchange.market(symbol);
        
        const side = 'buy';
        const qtyRaw = 20 / 140; // Approx 20$ / 140$ = 0.1428
        const qty = parseFloat(exchange.amountToPrecision(symbol, qtyRaw));
        const stopLossPriceRaw = 135.123456;
        const stopLossPrice = parseFloat(exchange.priceToPrecision(symbol, stopLossPriceRaw));
        const tpPriceRaw = 150.987654;
        const tpPrice = parseFloat(exchange.priceToPrecision(symbol, tpPriceRaw));
        
        console.log(`[TEST] Conditional orders for ${symbol}. Qty: ${qty}, SL: ${stopLossPrice}, TP: ${tpPrice}`);
        
        const tpSide = side === 'buy' ? 'sell' : 'buy';
        
        console.log("-> Sending TP...");
        try {
            await exchange.createOrder(symbol, 'limit', tpSide, qty, tpPrice, { reduceOnly: true });
            console.log("TP Success");
        } catch(e: any) { console.error("TP Error:", e.name, e.message); }
        
        console.log("-> Sending SL...");
        try {
            await exchange.createOrder(symbol, 'stop_market', tpSide, qty, undefined, { 
                stopPrice: stopLossPrice, 
                reduceOnly: true 
            });
            console.log("SL Success");
        } catch(e: any) { console.error("SL Error:", e.name, e.message); }

    } catch (e: any) {
        console.error('Fatal Error:', e);
    }
}
main();
