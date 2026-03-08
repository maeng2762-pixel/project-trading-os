import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { TradeEngine } from '@/lib/server/TradeEngine';

/**
 * Telegram Webhook Handler: Handles button callbacks for Live Trading (Enter/Skip)
 */
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        
        // Telegram Callback Query Handle
        if (payload.callback_query) {
            const query = payload.callback_query;
            const data = query.data || "";
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            
            // 0. STOP SPINNER ASAP
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: query.id })
            });

            const parts = data.split('_');
            const action = parts[0];
            const signalId = parts.slice(1).join('_');
            
            if (action === 'enter') {
                console.log(`[Telegram-Live] ⚔️ User requested ENTRY for Signal: ${signalId}`);
                
                // 1. Fetch Signal Data
                const signalSnap = await adminDb.collection('signals').doc(signalId).get();
                if (!signalSnap.exists) {
                    await sendTelegramResponse(chatId, "❌ 시그널 정보를 찾을 수 없습니다. (만료됨)");
                    return NextResponse.json({ ok: true });
                }
                
                const signal = signalSnap.data();
                if (!signal) {
                    await sendTelegramResponse(chatId, "❌ 시그널 정보를 찾을 수 없습니다.");
                    return NextResponse.json({ ok: true });
                }
                if (signal.status !== 'PENDING' && signal.status !== 'FAILED') {
                    await sendTelegramResponse(chatId, `⚠️ 이미 처리된 시그널입니다. (${signal.status})`);
                    return NextResponse.json({ ok: true });
                }
                
                // 2. Identify User & API Keys
                const uid = signal.uid || 'ADMIN';
                
                // 3. Mark Signal as EXECUTING
                await adminDb.collection('signals').doc(signalId).update({ status: 'EXECUTING' });
                
                // Update message to show we're working on it
                await editTelegramMessage(chatId, messageId, `⚙️ <b>[Binance Connect]</b> 주문을 거래소로 전송 중입니다...`);
                
                // 4. Fire the Trade Engine! 🚀
                const result = await TradeEngine.executeTrade(uid, signal);
                
                if (result.success && result.orderId && result.details) {
                    await adminDb.collection('signals').doc(signalId).update({ 
                        status: 'COMPLETED',
                        orderId: result.orderId,
                        executionDetails: result.details
                    });
                    
                    const successMsg = `✅ <b>[실전매매 진입 성공!]</b> 🚀\n\n` +
                                     `🎯 <b>오더ID</b>: <code>${result.orderId}</code>\n` +
                                     `💰 <b>진입수량</b>: ${result.details.qty.toFixed(4)} BTC\n` +
                                     `⚖️ <b>레버리지</b>: ${result.details.leverage}x\n\n` +
                                     `🛡️ TP/SL 자동 설정 완료. 성투하십시오 지휘관!`;
                                     
                    await editTelegramMessage(chatId, messageId, successMsg);
                } else {
                    await adminDb.collection('signals').doc(signalId).update({ status: 'FAILED', error: result.error });
                    await editTelegramMessage(chatId, messageId, `❌ <b>[주문 실패]</b>\n원인: ${result.error}`);
                }
                
            } else if (action === 'skip') {
                console.log(`[Telegram-Live] 🛑 User skipped signal: ${signalId}`);
                await adminDb.collection('signals').doc(signalId).update({ status: 'SKIPPED' });
                await editTelegramMessage(chatId, messageId, `🛑 <b>[전투 제외]</b> 이번 포지션은 보류되었습니다. 다음 기회를 기다립니다.`);
            }
            
            return NextResponse.json({ ok: true });
        }
        
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Telegram Webhook Error:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

async function sendTelegramResponse(chatId: number, text: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
}

async function editTelegramMessage(chatId: number, messageId: number, text: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' })
    });
}
