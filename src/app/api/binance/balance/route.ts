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

        // 3. Initialize ccxt and fetch balance
        const exchange = new ccxt.binance({
            apiKey: apiKey,
            secret: apiSecret,
            enableRateLimit: true,
            options: {
                defaultType: 'future', // We need futures margin/balance usually for this OS
            }
        });

        // 4. Fetch the available balance
        // Note: For USD-M Futures, use fetchBalance({ type: 'future' }) or similar.
        const balanceResponse = await exchange.fetchBalance({ type: 'future' });

        let liveBalance = 0;

        // Try to get USDT total from CCXT parsed data
        const usdtBalance = balanceResponse['USDT'];
        if (usdtBalance && usdtBalance.total !== undefined) {
            liveBalance = usdtBalance.total;
        }

        // Fallback: If parsed total is 0 or undefined, try analyzing the raw info object from Binance
        if (liveBalance === 0 && balanceResponse.info) {
            // Binance fapi/v2/account usually has totalWalletBalance or assets array
            if (balanceResponse.info.totalWalletBalance) {
                liveBalance = parseFloat(balanceResponse.info.totalWalletBalance);
            } else if (Array.isArray(balanceResponse.info.assets)) {
                const usdtAsset = balanceResponse.info.assets.find((a: any) => a.asset === 'USDT');
                if (usdtAsset && usdtAsset.walletBalance) {
                    liveBalance = parseFloat(usdtAsset.walletBalance);
                }
            }
        }

        console.log(`[Balance Fetch] UID: ${uid} | Detected Live Balance: $${liveBalance}`);

        return NextResponse.json({ success: true, liveBalance });
    } catch (error: any) {
        console.error('Binance Balance Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch balance from Binance.' }, { status: 500 });
    }
}
