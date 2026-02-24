import { NextResponse } from 'next/server';
import ccxt from 'ccxt';
import { adminAuth, adminDb } from '@/lib/server/firebaseAdmin';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Fetch API keys
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ success: false, error: 'User API keys not found.' }, { status: 404 });
        }

        const data = userDoc.data();
        const apiKey = data?.binanceKeys?.apiKey;
        const apiSecret = data?.binanceKeys?.apiSecret;

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ success: false, error: 'API Keys not configured.' }, { status: 404 });
        }

        // Initialize CCXT
        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
            options: {
                defaultType: 'future',
            },
        });

        // Fetch recent trades (MyTrades)
        // Note: fetchMyTrades usually requires a symbol. If we want all trades, 
        // we might have to fetch per symbol, or use fetchClosedOrders if Binance allows it without symbol.
        // For MVP, we will fetch BTC/USDT history as it's the main pair.
        const symbol = 'BTC/USDT';
        let limit = 50; // Fetch last 50 trades

        const trades = await exchange.fetchMyTrades(symbol, undefined, limit);

        // Map CCXT trades to our app's Trade structure
        const formattedTrades = trades.map(t => ({
            id: t.id,
            orderId: t.order,
            timestamp: t.timestamp,
            datetime: t.datetime,
            symbol: t.symbol,
            side: t.side, // 'buy' or 'sell'
            price: t.price,
            amount: t.amount,
            cost: t.cost, // Total value
            fee: t.fee,
            realizedPnl: t.info?.realizedPnl ? parseFloat(t.info.realizedPnl) : 0, // Binance specific
            marginAsset: t.info?.marginAsset,
        }));

        // Grouping trades into "Positions" (Entry + Exit) is complex on the fly.
        // For the Auto-Journal MVP, we will just return the raw executed trades 
        // that have a realizedPnl (meaning they were closing trades).
        const closingTrades = formattedTrades.filter(t => t.realizedPnl !== 0);

        return NextResponse.json({
            success: true,
            history: closingTrades.reverse(), // Newest first
            rawTradesCount: trades.length
        });

    } catch (error: any) {
        console.error('Binance History API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch history'
        }, { status: 500 });
    }
}
