import 'dotenv/config';

async function main() {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
        return;
    }

    const message = "✅ <b>[System Check]</b>\n\nHP1 Trading Bot Telegram Bridge is working perfectly!";
    
    console.log("Sending Telegram test message...");
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        console.log("Telegram Response:", data);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
main();
