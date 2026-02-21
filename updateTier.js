const admin = require('firebase-admin');

// Ensure we fall back to Google Application Default Credentials
admin.initializeApp({
    projectId: 'kelly-trading-os',
});

async function main() {
    const db = admin.firestore();
    try {
        const docRef = db.collection('users').doc('lV33Nke7Cjhi8lioTFGv6s0A66W2');
        await docRef.update({ tier: 'inner_circle' });
        console.log("Tier updated successfully to 'inner_circle'!");
        process.exit(0);
    } catch (error) {
        console.error("Failed to update tier:", error);
        process.exit(1);
    }
}

main();
