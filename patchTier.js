const fs = require('fs');
const os = require('os');
const path = require('path');

async function main() {
    try {
        const tokenPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
        const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        const token = tokenData.tokens.access_token;

        const response = await fetch(
            'https://firestore.googleapis.com/v1/projects/kelly-trading-os/databases/(default)/documents/users/lV33Nke7Cjhi8lioTFGv6s0A66W2?updateMask.fieldPaths=tier',
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        tier: { stringValue: 'inner_circle' }
                    }
                })
            }
        );

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to update tier: ${response.status} ${err}`);
        }

        console.log("Tier updated successfully via REST!");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
