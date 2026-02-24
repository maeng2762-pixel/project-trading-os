const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function check() {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', 'maeng2762@gmail.com').get();
    if (snapshot.empty) {
        console.log("User not found.");
        return;
    }
    const userData = snapshot.docs[0].data();
    if (userData.binanceKeys && userData.binanceKeys.apiKey) {
        console.log("API IS CONNECTED! Key exists.");
    } else {
        console.log("API NOT CONNECTED! No keys found.");
    }
}
check();
