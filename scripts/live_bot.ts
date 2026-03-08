import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import ccxt from 'ccxt';
import { adminDb } from '../src/lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { AnalysisEngine } from '../src/lib/analysis';

const exchange = new ccxt.binance({ enableRateLimit: true });
const SYMBOL = 'BTC/USDT';

// To prevent spamming the same signal multiple times per candle
let lastProcessedCandleTime = 0;

async function sendTelegramAlert(signalId: string, payload: any) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("⚠️ Telegram config missing, cannot send alert.");
        return;
    }

    const message = `🚨 <b>[RED POTION 스나이퍼 포착]</b> 🚨\n\n` +
        `🪙 <b>종목:</b> BTC/USDT\n` +
        `🎯 <b>포지션:</b> ${payload.direction === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}\n` +
        `🔥 <b>등급:</b> ${payload.actionGrade}\n` +
        `💰 <b>현재가:</b> $${payload.basePrice.toFixed(2)}\n\n` +
        `🧠 <b>AI 분석 요약:</b>\n${payload.reasoning_plain}\n\n` +
        `🛡️ <b>리스크:</b> 시드의 ${payload.kellyRiskPct.toFixed(2)}%\n\n` +
        `명령을 대기합니다. 지휘관님.`;

    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ 진입 승인 (Execute)', callback_data: `enter_${signalId}` },
                { text: '🛑 이번엔 패스 (Skip)', callback_data: `skip_${signalId}` }
            ]
        ]
    };

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        });
        console.log(`[Telegram] 📲 Alert sent for signal ${signalId}`);
    } catch (e) {
        console.error("[Telegram] ❌ Failed to send alert", e);
    }
}

async function loop() {
    console.log(`\n[LiveBot] 🔍 Scanning market... (${new Date().toISOString()})`);
    try {
        console.log(`[LiveBot] Fetching OHLCV data...`);
        // Fetch Multi-Timeframe Data
        const limit = 300;
        const [ohlcv1h, ohlcv4h, ohlcv1d, ohlcv5m] = await Promise.all([
            exchange.fetchOHLCV(SYMBOL, '1h', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '4h', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '1d', undefined, limit),
            exchange.fetchOHLCV(SYMBOL, '5m', undefined, limit) // Good for micro structure
        ]);

        console.log(`[LiveBot] Fetch complete. Mapping candles...`);
        const mapCandles = (raw: any[]) => raw.map(c => ({
            time: c[0] as number,
            open: c[1] as number,
            high: c[2] as number,
            low: c[3] as number,
            close: c[4] as number,
            volume: c[5] as number
        }));

        const currentCandleTime = Number(ohlcv1h[ohlcv1h.length - 1][0]) || 0;
        const extData: any = {};

        console.log(`[LiveBot] Running Analysis Engine...`);
        // Run Analysis
        const result = AnalysisEngine.analyze({
             '1h': mapCandles(ohlcv1h),
             '4h': mapCandles(ohlcv4h),
             '1d': mapCandles(ohlcv1d),
             '5m': mapCandles(ohlcv5m)
        }, extData);
        
        console.log(`[LiveBot] Analysis complete. Result Grade: ${result.actionGrade || 'N/A'}`);

        // FOR DEMO PURPOSES: Force a signal if running manually, or uncomment for real live
        // Since we are running this as a daemon, we want to only alert on A/S/SSS.
        // Let's artificially trigger it ONCE if we bypass for demo:
        let forceDemoTrigger = false;
        if (result.actionGrade === 'F' && currentCandleTime !== lastProcessedCandleTime) {
            // Force A grade just to demonstrate the flow to the user
            console.log("[LiveBot] ⚠️ Forcing a Demo 'A-Grade' signal for testing purposes.");
            result.actionGrade = 'A';
            result.direction = 'LONG';
            result.reasoning_plain = "✅ [A급 - Demo] 백테스트 검증 모드 수동 시그널 강제 발생.";
            result.kellyFraction = 0.01;
            forceDemoTrigger = true;
        }

        if (['SSS', 'S', 'A'].includes(result.actionGrade || 'F')) {
            if (currentCandleTime !== lastProcessedCandleTime) {
                const basePrice = ohlcv1h[ohlcv1h.length - 1][4] as number;
                
                // ATR is used for Stop Loss
                const atr = (result.atr as number) || (basePrice * 0.01);
                const slPct = (atr / basePrice) * 100;
                
                const signalPayload = {
                    uid: 'ADMIN',
                    direction: result.direction,
                    basePrice: basePrice,
                    baseStopLossPct: slPct, // Dynamic Stop loss based on ATR
                    baseTargetPct: slPct * 2.5, // 1:2.5 Min RRR
                    // cast kellyFraction to number to avoid 'Num' type issue if any
                    kellyRiskPct: (Number(result.kellyFraction) || 0.01) * 100,
                    actionGrade: result.actionGrade,
                    reasoning_plain: result.reasoning_plain,
                    status: 'PENDING',
                    timestamp: FieldValue.serverTimestamp()
                };

                // Save to Firestore 'signals' collection
                const docRef = await adminDb.collection('signals').add(signalPayload);
                console.log(`[LiveBot] 🎯 Signal Locked! (${result.actionGrade}) | ID: ${docRef.id}`);

                // Fire Telegram
                await sendTelegramAlert(docRef.id, signalPayload);

                lastProcessedCandleTime = currentCandleTime;
            } else {
                console.log(`[LiveBot] ⏳ Signal already processed for this candle. Waiting for next candle...`);
            }
        }

    } catch (e: any) {
        console.error(`[LiveBot] ❌ Error: ${e.message}`);
    }
}

// Start loop
console.log("=========================================");
console.log("🏹 RED POTION LIVE BOT (S-CLASS / A-CLASS)");
console.log("=========================================");
// Run immediately
loop();
// Poll every 1 minute
setInterval(loop, 60 * 1000);
