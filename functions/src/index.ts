import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// @ts-ignore
import ccxt from "ccxt";
import cors from "cors";
import { encrypt, decrypt } from "./encryption";

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const corsHandler = cors({ origin: true });

export const binance_keys = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;

            const { apiKey, apiSecret } = req.body;

            if (!apiKey || !apiSecret) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            const encryptedSecret = encrypt(apiSecret);

            await db.collection('users').doc(uid).set({
                binanceApiKey: apiKey,
                binanceApiSecretEncrypted: encryptedSecret,
                apiConnected: true,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('API Key Save Error:', error);
            res.status(500).json({ error: 'Failed to securely save API keys.' });
        }
    });
});

export const binance_balance = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(idToken);
            const uid = decodedToken.uid;

            const userDoc = await db.collection('users').doc(uid).get();
            if (!userDoc.exists) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const userData = userDoc.data();
            const apiKey = userData?.binanceApiKey;
            const encryptedSecret = userData?.binanceApiSecretEncrypted;

            if (!apiKey || !encryptedSecret) {
                res.status(404).json({ error: 'API keys not found. Please connect Binance.' });
                return;
            }

            let apiSecret;
            try {
                apiSecret = decrypt(encryptedSecret);
            } catch (decErr) {
                console.error("Decryption error:", decErr);
                res.status(401).json({ error: 'Failed to decrypt API keys. Please reconnect.' });
                return;
            }

            const exchange = new ccxt.binance({
                apiKey: apiKey,
                secret: apiSecret,
                enableRateLimit: true,
                options: {
                    defaultType: 'future',
                }
            });

            const balanceResponse = await exchange.fetchBalance({ type: 'future' });
            const usdtBalance = balanceResponse['USDT'];

            if (!usdtBalance) {
                res.status(400).json({ error: 'USDT balance not found in futures account.' });
                return;
            }

            const liveBalance = usdtBalance.free;
            res.status(200).json({ success: true, liveBalance });
        } catch (error: any) {
            console.error('Binance Balance Fetch Error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch balance from Binance.' });
        }
    });
});
