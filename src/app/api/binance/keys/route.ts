import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/server/encryption';
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
        const { apiKey, apiSecret } = body;

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Encrypt the Secret Key before saving it to the database
        const encryptedSecret = encrypt(apiSecret);

        // Save safely in Firestore in a private secure sub-collection or fields
        await adminDb.collection('users').doc(uid).set({
            binanceApiKey: apiKey,
            binanceApiSecretEncrypted: encryptedSecret,
            apiConnected: true,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API Key Save Error:', error);
        return NextResponse.json({ error: 'Failed to securely save API keys.' }, { status: 500 });
    }
}
