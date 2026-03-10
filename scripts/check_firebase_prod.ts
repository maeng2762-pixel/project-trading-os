import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
    let firebaseCert;
    try {
        firebaseCert = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
        return;
    }

    if (!getApps().length) {
        initializeApp({
            credential: cert(firebaseCert),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
    }

    const db = getFirestore();
    console.log("Fetching recent signals...");
    const snapshot = await db.collection('signals')
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get();

    if (snapshot.empty) {
        console.log("No signals found.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date();
        console.log(`[${date.toISOString()}] ${data.symbol} - Grade: ${data.actionGrade} - Dir: ${data.direction} - CRON: ${data.cronTriggered} - ID: ${doc.id}`);
    });
}
main();
