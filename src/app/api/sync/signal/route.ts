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
            
            if (botToken && chatId) {
                const directionText = signal.direction === 'LONG' ? '📈 매수(LONG)' : '📉 매도(SHORT)';
                const tpValue = signal.basePrice * (1 + (signal.direction === 'LONG' ? signal.baseTargetPct / 100 : -signal.baseTargetPct / 100));
                const slValue = signal.basePrice * (1 + (signal.direction === 'LONG' ? -signal.baseStopLossPct / 100 : signal.baseStopLossPct / 100));
                
                const message = `🔴 [레드포션 마스터 시그널]
방향: ${directionText}
진입가: ${signal.basePrice.toLocaleString(undefined, {maximumFractionDigits: 2})} (권장구간: ${signal.entryZoneMin} ~ ${signal.entryZoneMax})
목표가: ${tpValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
손절가: ${slValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
추천비중(Kelly): ${signal.kellyRiskPct ? signal.kellyRiskPct.toFixed(1) : '3.5'}%
제한시간: 15분`;

                try {
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, text: message })
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
