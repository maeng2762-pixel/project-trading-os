import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { MockBroadcastProvider } from '@/lib/ai/provider';

// Mock server-side provider to represent the "Cloud Backend AI"
const backendProvider = new MockBroadcastProvider();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { uid, livePrice } = body;

        // Generate signal centrally on the server
        const signal = await backendProvider.generateMasterSignal(livePrice || 65000);

        // Strict Unix Timestamp from Server
        const serverTimestamp = Date.now();
        signal.timestamp = serverTimestamp;

        // Push to Single Source of Truth DB => OmniSync Protocol
        if (uid && !signal.isRejected) {
            await adminDb.collection('users').doc(uid).collection('omniSync').doc('state').set({
                masterSignal: signal,
                lastUpdatedServerTime: serverTimestamp,
                // We only update the signal here, use merge to not overwrite user modes
            }, { merge: true });
        }

        // HP1 Extension - Telegram Dispatcher
        if (!signal.isRejected) {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;
            
            // Generate a unique ID for this signal to handle Telegram callbacks
            const signalId = `sig_${Date.now()}`;
            
            // Save signal centrally for callback handling
            await adminDb.collection('signals').doc(signalId).set({
                ...signal,
                uid: uid || 'ADMIN', // Ensure we have a reference to the trader
                createdAt: serverTimestamp,
                status: 'PENDING'
            });

            if (botToken && chatId) {
                const directionEmoji = signal.direction === 'LONG' ? '📈' : '📉';
                const directionText = signal.direction === 'LONG' ? '매수(LONG)' : '매도(SHORT)';
                const tpValue = signal.basePrice * (1 + (signal.direction === 'LONG' ? (signal.baseTargetPct || 2) / 100 : -(signal.baseTargetPct || 2) / 100));
                const slValue = signal.basePrice * (1 + (signal.direction === 'LONG' ? -(signal.baseStopLossPct || 1) / 100 : (signal.baseStopLossPct || 1) / 100));
                
                const message = `🔴 <b>[Red Potion v120 Master Signal]</b> 포착! 🔴\n\n` +
                              `🎯 <b>타겟</b>: BTCUSDT (Binance Futures)\n` +
                              `⚔️ <b>방향</b>: ${directionEmoji} <b>${directionText}</b>\n` +
                              `📌 <b>진입가(Entry)</b>: ${signal.basePrice.toLocaleString(undefined, {maximumFractionDigits: 2})} (권장: ${signal.entryZoneMin} ~ ${signal.entryZoneMax})\n` +
                              `${signal.isCompressZone ? `⚡️ <b>[컴프레스 존]</b>: S성급 에너지 응축 구역 확인\n` : ''}` +
                              `🚀 <b>목표가(TP)</b>: ${tpValue.toLocaleString(undefined, {maximumFractionDigits: 2})}\n` +
                              `🛑 <b>손절가(SL)</b>: ${slValue.toLocaleString(undefined, {maximumFractionDigits: 2})}\n\n` +
                              `🔬 <b>[Institutional Analyst]</b>\n` +
                              `- <b>배경</b>: Institutional Liquidity Sweep & CVD Exhaustion 감지\n` +
                              `${signal.compressZoneDetails ? `- <b>상태</b>: ${signal.compressZoneDetails}\n` : ''}` +
                              `- <b>켈리비중</b>: ${signal.kellyRiskPct ? signal.kellyRiskPct.toFixed(1) : '3.5'}%\n` +
                              `- <b>전략</b>: Red Potion v120 Predator Sniper\n\n` +
                              `👇 <b>[지휘관 행동 강령]</b>\n` +
                              `"지금 즉시 진입하여 기관의 수급에 올라타십시오."\n\n` +
                              `⏱️ <b>제한시간</b>: 15분 이내 진입 요망`;

                const inlineKeyboard = {
                    inline_keyboard: [
                        [
                            { text: "🚀 진입하기 (Enter)", callback_data: `enter_${signalId}` },
                            { text: "🛑 보류하기 (Skip)", callback_data: `skip_${signalId}` }
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
                            reply_markup: inlineKeyboard
                        })
                    });
                } catch (e) {
                    console.error("Telegram Dispatch Error:", e);
                }
            }
        }

        return NextResponse.json({ success: true, signal, timestamp: serverTimestamp });
    } catch (error: any) {
        console.error("Omni-Sync Backend Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
