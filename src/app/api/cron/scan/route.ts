import { NextResponse } from 'next/server';
import ccxt from 'ccxt';
import { adminDb } from '../../../../lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { AnalysisEngine } from '../../../../lib/analysis';

async function sendTelegramAlert(signalId: string, payload: any) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("⚠️ Telegram config missing, cannot send alert.");
        return;
    }

    const message = `🚨 <b>[RED POTION 스나이퍼 포착]</b> 🚨\n\n` +
        `🪙 <b>종목:</b> ${payload.symbol || 'BTC/USDT'}\n` +
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
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        });
        const resJson = await res.json();
        console.log(`[Telegram Cron] Response status: ${res.status}, json:`, resJson);
        if (res.ok) {
            console.log(`[Telegram Cron] 📲 Alert sent for signal ${signalId}`);
        } else {
            console.error(`[Telegram Cron] ❌ Failed to send alert:`, resJson);
        }
    } catch (e) {
        console.error("[Telegram Cron] ❌ Exception in fetch", e);
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Uncomment to enforce security if relying solely on Vercel
            // return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        console.log(`\n[LiveBot Cron] 🔍 Scanning market... (${new Date().toISOString()})`);
        const exchange = new ccxt.binance({ enableRateLimit: true });
        const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
        
        let highestGrade = 'F';
        let triggeredCount = 0;
        
        const limit = 300;
        for (const SYMBOL of SYMBOLS) {
            console.log(`[LiveBot Cron] 📡 Scanning ${SYMBOL}...`);
            const [ohlcv1h, ohlcv4h, ohlcv1d, ohlcv15m, ohlcv5m] = await Promise.all([
                exchange.fetchOHLCV(SYMBOL, '1h', undefined, limit),
                exchange.fetchOHLCV(SYMBOL, '4h', undefined, limit),
                exchange.fetchOHLCV(SYMBOL, '1d', undefined, limit),
                exchange.fetchOHLCV(SYMBOL, '15m', undefined, limit),
                exchange.fetchOHLCV(SYMBOL, '5m', undefined, limit)
            ]);

            const mapCandles = (raw: any[]) => raw.map(c => ({
                time: c[0] as number,
                open: c[1] as number,
                high: c[2] as number,
                low: c[3] as number,
                close: c[4] as number,
                volume: c[5] as number
            }));

            const result = AnalysisEngine.analyze({
                 '1h': mapCandles(ohlcv1h),
                 '4h': mapCandles(ohlcv4h),
                 '1d': mapCandles(ohlcv1d),
                 '15m': mapCandles(ohlcv15m),
                 '5m': mapCandles(ohlcv5m)
            }, {});
            
            console.log(`[LiveBot Cron] ${SYMBOL} Analysis complete. Result Grade: ${result.actionGrade || 'F'}`);

            if (['SSS', 'S', 'A+'].includes(result.actionGrade || 'F')) {
                // Use 15m as base for closer market truth
                const basePrice = ohlcv15m[ohlcv15m.length - 1][4] as number;
                const atr = (result.atr as number) || (basePrice * 0.01);
                
                // --- FAT STOP LOSS BUFFER ---
                // Original ATR was too tight for 15M (often ~0.1-0.2%), hitting stop loss instantly to noise.
                // We add a guaranteed minimum of 0.8% away, and amplify ATR by 1.5x up to 5%.
                let slPct = (atr / basePrice) * 100 * 1.5;
                if (slPct < 0.8) slPct = 0.8; 
                if (slPct > 5.0) slPct = 5.0; // Hard cap
                
                const signalPayload = {
                    uid: 'ADMIN',
                    symbol: SYMBOL,
                    direction: result.direction,
                    basePrice: basePrice,
                    baseStopLossPct: slPct, 
                    baseTargetPct: slPct * 2.5, 
                    kellyRiskPct: Math.min((Number(result.kellyFraction) || 0.01) * 100, 5.0), // Cap at max 5% of seed
                    actionGrade: result.actionGrade,
                    reasoning_plain: result.reasoning_plain,
                    status: 'PENDING',
                    timestamp: FieldValue.serverTimestamp(),
                    cronTriggered: true
                };

                const docRef = await adminDb.collection('signals').add(signalPayload);
                console.log(`[LiveBot Cron] 🎯 ${SYMBOL} Signal Locked! (${result.actionGrade}) | ID: ${docRef.id}`);

                await sendTelegramAlert(docRef.id, signalPayload);
                triggeredCount++;
                
                if (['SSS', 'S', 'A+'].includes(result.actionGrade!) || highestGrade === 'F') {
                    highestGrade = result.actionGrade!;
                }
            }
            // Sleep brief moment to respect exchange rate limit across multiple coins
            await new Promise(r => setTimeout(r, 800));
        }

        return NextResponse.json({ 
            success: true, 
            grade: highestGrade,
            triggered: triggeredCount > 0,
            triggeredCount: triggeredCount
        });
    } catch (e: any) {
        console.error(`[LiveBot Cron] ❌ Error: ${e.message}`);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
