import { NextResponse } from 'next/server';
import ccxt from 'ccxt';
import { decrypt } from '@/lib/server/encryption';
import { adminDb, adminAuth } from '@/lib/server/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const body = await req.json();
        const { symbol, side, margin, leverage, price } = body;

        if (!symbol || !side || !margin || !leverage || !price) {
            return NextResponse.json({ error: 'Missing required order parameters' }, { status: 400 });
        }

        // 1. Fetch encrypted keys from Firestore
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        const apiKey = userData?.binanceApiKey;
        const encryptedSecret = userData?.binanceApiSecretEncrypted;

        if (!apiKey || !encryptedSecret) {
            return NextResponse.json({ error: 'API keys not found. Please connect Binance.' }, { status: 404 });
        }

        // 2. Decrypt the Secret Key
        let apiSecret;
        try {
            apiSecret = decrypt(encryptedSecret);
        } catch (decErr) {
            console.error("Decryption error:", decErr);
            return NextResponse.json({ error: 'Failed to decrypt API keys. Please reconnect.' }, { status: 401 });
        }

        // 3. Initialize ccxt
        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
            options: {
                defaultType: 'future',
            }
        });

        // 4. Set Leverage
        // Format symbol for CCXT (e.g., 'BTC/USDT')
        const ccxtSymbol = symbol.replace('/', ''); // Sometimes binance requires base/quote or just basequote for setLeverage

        try {
            await exchange.setLeverage(leverage, symbol);
        } catch (levErr: any) {
            console.warn("Set leverage warning (might already be set):", levErr.message);
        }

        // 5. Calculate Quantity (Base Currency)
        // Quantity = (Margin * Leverage) / current price
        const positionValue = margin * leverage;
        const rawQuantity = positionValue / price;

        // Load markets to get precision rules
        await exchange.loadMarkets();
        const market = exchange.market(symbol);

        // Format amount using exchange's precision rules
        const amountToOrder = exchange.amountToPrecision(symbol, rawQuantity);

        // 6. Execute Market Order
        // CCXT createMarketOrder params: (symbol, side, amount)
        const orderSide = side.toLowerCase(); // 'buy' for LONG, 'sell' for SHORT

        const order = await exchange.createMarketOrder(symbol, orderSide, Number(amountToOrder));

        return NextResponse.json({ success: true, orderId: order.id, executedQty: order.filled });
    } catch (error: any) {
        console.error('Binance Order Execution Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to execute order on Binance.' }, { status: 500 });
    }
}
