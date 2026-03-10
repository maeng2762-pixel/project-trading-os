import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { adminDb } from '../src/lib/server/firebaseAdmin';

async function run() {
    const snapshot = await adminDb.collection('signals')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
    
    console.log(`Found ${snapshot.docs.length} recent signals in Firebase:`);
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.actionGrade} ${data.direction} at ${data.timestamp?.toDate().toISOString()}`);
    });
}
run();
