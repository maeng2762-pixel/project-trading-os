import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const payload = {
        direction: 'SHORT',
        actionGrade: 'A',
        basePrice: 65123,
        reasoning_plain: '✅ [A급] S급 부재 중 단독 조건 충족 (Volume Cluster / Stacked Imbalance 지지).',
        kellyRiskPct: 10,
    };
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
                { text: '✅ 진입 승인 (Execute)', callback_data: `enter_JdhH1a0mVSRo68q1qfSO` },
                { text: '🛑 이번엔 패스 (Skip)', callback_data: `skip_JdhH1a0mVSRo68q1qfSO` }
            ]
        ]
    };

    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: keyboard
        })
    });
    console.log(await res.json());
}
run();
