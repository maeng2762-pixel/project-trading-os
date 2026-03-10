import { adminDb } from '../src/lib/server/firebaseAdmin';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const snapshot = await adminDb.collection('signals')
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get();
    
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`\n\n=== Signal: ${doc.id} ===`);
        console.log(data.reasoning_plain);
    });
}
run();
