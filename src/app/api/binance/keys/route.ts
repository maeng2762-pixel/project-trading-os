import { NextResponse } from 'next/server';
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

        const { apiKey, apiSecret } = await req.json();

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ success: false, error: 'Missing keys' }, { status: 400 });
        }

        // Store keys securely in Firestore under the user's document
        // In a real production app, you should ENCRYPT the apiSecret before saving.
        await adminDb.collection('users').doc(uid).set({
            binanceKeys: {
                apiKey,
                apiSecret,
                updatedAt: new Date().toISOString()
            }
        }, { merge: true });

        return NextResponse.json({ success: true, message: 'Keys saved successfully' });
    } catch (error: any) {
        console.error('API Key Save Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { FieldValue } from 'firebase-admin/firestore';

export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Delete the binanceKeys field from the user's document
        await adminDb.collection('users').doc(uid).update({
            binanceKeys: FieldValue.delete()
        });

        return NextResponse.json({ success: true, message: 'Keys deleted successfully' });
    } catch (error: any) {
        console.error('API Key Delete Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
