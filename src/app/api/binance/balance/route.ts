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

        // Initialize CCXT for Binance USD-M Futures
        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
            options: {
                defaultType: 'future', // USD-M Futures
            },
        });

        // 🚨 VERY IMPORTANT: We only FETCH balance. NO execution. 🚨
        const balanceResponse = await exchange.fetchBalance({ type: 'future' });

        // Safely extract USDT total balance
        let usdtBalance = 0;
        if (balanceResponse && balanceResponse.USDT) {
            usdtBalance = balanceResponse.USDT.total || 0;
        } else if (balanceResponse && balanceResponse.info && balanceResponse.info.assets) {
            // Fallback for raw binance response
            const usdtAsset = balanceResponse.info.assets.find((a: any) => a.asset === 'USDT');
            if (usdtAsset) {
                usdtBalance = parseFloat(usdtAsset.marginBalance || usdtAsset.walletBalance || '0');
            }
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
