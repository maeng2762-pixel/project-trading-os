import { NextResponse } from 'next/server';
import ccxt from 'ccxt';
import { adminAuth, adminDb } from '@/lib/server/firebaseAdmin';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Fetch user's API keys from Firestore
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

        // Initialize CCXT for Binance
        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
        });

        // 🚨 VERY IMPORTANT: We only FETCH balance. NO execution. 🚨
        let usdtBalance = 0;

        // Helper to extract USDT from CCXT balance object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractUsdt = (bal: any) => {
            if (!bal) return 0;
            if (bal.USDT) return bal.USDT.total || 0;
            if (bal.info && bal.info.assets) {
                // Fallback for raw binance futures response
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usdtAsset = bal.info.assets.find((a: any) => a.asset === 'USDT');
                if (usdtAsset) {
                    return parseFloat(usdtAsset.marginBalance || usdtAsset.walletBalance || '0');
                }
            }
            if (bal.info && bal.info.balances) {
                // Fallback for raw binance spot response
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usdtAsset = bal.info.balances.find((a: any) => a.asset === 'USDT');
                if (usdtAsset) {
                    return parseFloat(usdtAsset.free || '0') + parseFloat(usdtAsset.locked || '0');
                }
            }
            return 0;
        };

        try {
            const spotBalance = await exchange.fetchBalance({ type: 'spot' });
            usdtBalance += extractUsdt(spotBalance);
        } catch (e) {
            console.warn("Binance Spot Balance fetch warning:", e);
        }

        try {
            const futureBalance = await exchange.fetchBalance({ type: 'future' });
            usdtBalance += extractUsdt(futureBalance);
        } catch (e) {
            console.warn("Binance Future Balance fetch warning:", e);
        }

        return NextResponse.json({
            success: true,
            liveBalance: usdtBalance
        });

    } catch (error: any) {
        console.error('Binance Balance API Error:', error);

        let errorMessage = error.message || 'Unknown CCXT Error';
        if (errorMessage.includes('Invalid API-key')) errorMessage = "유효하지 않은 API 키입니다. (삭제되었거나 만료됨)";
        if (errorMessage.includes('ip restrict')) errorMessage = "API 키의 IP 제한 옵션을 해제해주시거나, Edge 브라우저/VPN을 꺼주세요.";
        if (errorMessage.includes('Margin restriction')) errorMessage = "선물(Futures) 거래 권한이 비활성화된 API 키입니다. (Read-Only라도 선물 계정 활성화 필요)";

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}
