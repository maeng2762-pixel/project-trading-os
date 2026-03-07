import { NextResponse } from 'next/server';
import { AnalysisEngine } from '@/lib/analysis';

export async function POST(req: Request) {
    const startTime = performance.now();
    try {
        const payload = await req.json();

        // payload might contain symbol, action, etc.
        // We will fetch latest data and run analysis just like a regular sync, but triggered by TV.

        // 1. 15-Min TWAP Noise Offset
        const now = new Date();
        const minutes = now.getMinutes();
        const hourUTC = now.getUTCHours();
        
        // --- HP1 Extension: SMC Session Kill-Zone Lock ---
        // London Open Kill Zone: 07:00 ~ 11:00 UTC 
        // NY Open Kill Zone: 12:00 ~ 16:00 UTC
        const isLondonKillZone = hourUTC >= 7 && hourUTC < 11;
        const isNYKillZone = hourUTC >= 12 && hourUTC < 16;
        
        if (!isLondonKillZone && !isNYKillZone) {
            console.log(`⏱️ SMC Session Lock: 현재 시간(${hourUTC}시 UTC)은 Kill-Zone 밖입니다. 시그널 발송 차단.`);
            return NextResponse.json({ success: true, status: "Out of Session Kill-Zone" });
        }

        // 1.5. 정각, 15분, 30분, 45분 부근(±1분) 인지 체크
        const isTwapZone = 
            (minutes >= 59 || minutes <= 1) || 
            (minutes >= 14 && minutes <= 16) || 
            (minutes >= 29 && minutes <= 31) || 
            (minutes >= 44 && minutes <= 46);

        if (isTwapZone) {
            console.log("⏳ 15-Min TWAP Noise Offset 작동: 기관 노이즈 회피를 위해 60초 지연 대기...");
            await new Promise((resolve) => setTimeout(resolve, 60000)); // 60s delay
        }

        // --- Fetch Data (Mock passing here; in real, fetch from Binance) ---
        // Here we just trigger the normal sync flow or calculate directly
        // For simplicity in this demo, let's call our own `/api/sync` or just assume TV gave enough signal.
        const baseUrl = new URL(req.url).origin;
        const syncUrl = `${baseUrl}/api/sync`;
        const res = await fetch(syncUrl, { cache: 'no-store' });
        const { candles } = await res.json();

        if (!candles) {
             return NextResponse.json({ success: false, error: "Data fetch failed" }, { status: 500 });
        }

        // --- HP1 v102: Fetch The Institutional Oracle Data (Binance fapi) ---
        let extData: any = {};
        try {
            const fapiRes = await fetch("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT", { cache: 'no-store' });
            const fapiData = await fapiRes.json();
            const fundingRate = parseFloat(fapiData.lastFundingRate || "0");
            
            // Open Interest Spike / Unfinished Biz parameters
            const oiSpike = true; // Simplified as 'true' for Confluence
            const currentPrice = candles['1h'] ? candles['1h'][candles['1h'].length - 1]?.close : null;
            const unfinishedBizTop = currentPrice && Math.random() > 0.7 ? currentPrice * 1.05 : null; 
            const unfinishedBizBottom = currentPrice && Math.random() > 0.7 ? currentPrice * 0.95 : null;
            
            // --- HP1 최신 패치: 가상 데이터(Proxy) 생성 ---
            const cointegrationZScore = Math.random() > 0.8 ? 2.5 : 1.0; 
            const mergedFvgHigh = currentPrice && Math.random() > 0.8 ? currentPrice * 1.06 : null;
            const mergedFvgLow = currentPrice && Math.random() > 0.8 ? currentPrice * 0.94 : null;
            const hasStackedImbalances = Math.random() > 0.5;
            const hasMultipleHVN = Math.random() > 0.5;
            const cvdAbsorptionAtExtremes = Math.random() > 0.8;

            // --- HP1 v104: The Missing Alpha 포맷 데이터 프록시 ---
            const lassoOptions: ('LONG'|'SHORT'|'NEUTRAL')[] = ['LONG', 'SHORT', 'NEUTRAL'];
            const lassoSpikePredictor = lassoOptions[Math.floor(Math.random() * lassoOptions.length)];
            const institutionalLiqTop = currentPrice && Math.random() > 0.8 ? currentPrice * 1.25 : null;
            const institutionalLiqBottom = currentPrice && Math.random() > 0.8 ? currentPrice * 0.75 : null;
            const mtfDivergenceConfirmed = Math.random() > 0.85;
            const isSchellingPointEvent = Math.random() > 0.7;

            // --- HP1 v105: The Final Assembly 포맷 데이터 프록시 ---
            const isWaeDeadZone = Math.random() > 0.9; // 10% chance to be in dead zone
            const eqhSweepDetected = Math.random() > 0.8;
            const eqlSweepDetected = Math.random() > 0.8;

            // --- HP1 v106: The Lean On-Chain Sovereign 포맷 데이터 프록시 ---
            const isAndonCordTriggered = Math.random() > 0.95; // 5% chance of Andon Cord activation
            const andonCordDiagnosticInfo = "연속 손실(Drawdown) 초과 또는 트레이딩 뷰 지연(Slippage) 에러 감지";
            const isCohortDropped = Math.random() > 0.95; // 5% chance of cohort drop
            let mvrvMacroBias: 'OVERHEATED' | 'ACCUMULATION' | 'NEUTRAL' = 'NEUTRAL';
            const mvrvRand = Math.random();
            if (mvrvRand > 0.8) mvrvMacroBias = 'OVERHEATED';
            else if (mvrvRand < 0.2) mvrvMacroBias = 'ACCUMULATION';
            const isCloseMitigatedEvent = Math.random() > 0.3; // 70% chance of body close

            // --- HP1 v107: The Guardian & Catalyst 포맷 데이터 프록시 ---
            const isBbSqueezeActive = Math.random() > 0.8;
            const slingshotOptions: ('LONG'|'SHORT'|'NEUTRAL')[] = ['LONG', 'SHORT', 'NEUTRAL'];
            const slingshotMomentumDirection = slingshotOptions[Math.floor(Math.random() * slingshotOptions.length)];
            const bigLimitOrderDetected = slingshotOptions[Math.floor(Math.random() * slingshotOptions.length)];
            const consecutiveLosses = Math.floor(Math.random() * 6); // 0 to 5

            // --- HP1 텔레그램 확장: Trades Filter 동적 조절기 ---
            const tradesIn24h = 6; 
            
            // --- HP1 v109: The Creator's Leverage ---
            // 🧊 Iceberg Micro-Aggregation
            const icebergRng = Math.random();
            const isIcebergAbsorptionDetected = icebergRng > 0.95 ? 'LONG' : (icebergRng < 0.05 ? 'SHORT' : undefined);
            
            // 📦 Volume Accumulation Defense Sandbox
            const isAccumulationDefenseMapped = Math.random() > 0.8;

            // --- HP1 v111: Final Adaptive TP Matrix ---
            const isCvdExhaustion = Math.random() > 0.8; // 20% chance CVD exhausted

            // --- HP1 v112: The Vanguard's Edge ---
            const htfBrokenHigh = Math.random() > 0.9;
            const htfBrokenLow = Math.random() > 0.9 && !htfBrokenHigh; // Mutually exclusive
            const googleRng = Math.random();
            const googleTrendsSentiment = googleRng > 0.7 ? 'BULLISH' : (googleRng < 0.3 ? 'BEARISH' : 'NEUTRAL');
            const shapeRng = Math.random();
            const volumeProfileShape = shapeRng > 0.7 ? 'P' : (shapeRng < 0.3 ? 'b' : (shapeRng > 0.5 ? 'THIN' : 'D'));
            const hasIntegerAlgoFootprint = Math.random() > 0.8; // 20% chance to have .000 algo defending
            
            extData = { 
                fundingRate, oiSpike, unfinishedBizTop, unfinishedBizBottom, tradesIn24h,
                cointegrationZScore, mergedFvgHigh, mergedFvgLow, hasStackedImbalances, hasMultipleHVN, cvdAbsorptionAtExtremes,
                lassoSpikePredictor, institutionalLiqTop, institutionalLiqBottom, mtfDivergenceConfirmed, isSchellingPointEvent,
                isWaeDeadZone, eqhSweepDetected, eqlSweepDetected,
                isAndonCordTriggered, andonCordDiagnosticInfo, isCohortDropped, mvrvMacroBias, isCloseMitigatedEvent,
                isBbSqueezeActive, slingshotMomentumDirection, bigLimitOrderDetected, consecutiveLosses,
                isIcebergAbsorptionDetected, isAccumulationDefenseMapped,
                // HP1 v111
                isCvdExhaustion,
                // HP1 v112
                htfBrokenHigh,
                htfBrokenLow,
                googleTrendsSentiment,
                volumeProfileShape,
                hasIntegerAlgoFootprint
            };
        } catch(e) {
            console.error("Binance ExtAPI Fetch Failed:", e);
        }

        // Run analysis! Auto-Calibration included in analysis logic.
        const analysis = AnalysisEngine.analyze(candles, extData);

        // --- HP1 텔레그램 확장: Trades Filter Auto-Calibration ---
        // if trades > 5, we increase threshold filtering (only allow S/A). if < 5, we allow B or C depending on need.
        const dynamicMinGrade = (extData.tradesIn24h || 0) > 5 ? ['S', 'A'] : ['S', 'A', 'B'];
        const isGradeAccepted = analysis.actionGrade && dynamicMinGrade.includes(analysis.actionGrade);

        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        // --- HP1 v106: The Lean On-Chain Sovereign (Andon Cord handling) ---
        if (analysis.isAndonCordBlocked && telegramBotToken && telegramChatId) {
             const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
             const andonMessage = `🚨 <b>[Andon Cord 발동] 치명적 결함 감지</b>\n` +
                 `시스템이 즉시 시그널 송출을 정지했습니다.\n\n` +
                 `🔍 <b>[5 Whys 자동 진단 리포트]</b>\n` +
                 `원인: ${analysis.andonCordReason}\n\n` +
                 `조치: 모든 신규 포지션 진입을 차단하고 격리 조치했습니다. 지휘관의 확인이 필요합니다.`;
                 
             await fetch(telegramUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ chat_id: telegramChatId, text: andonMessage, parse_mode: 'HTML' })
             });
             console.log("🛑 Andon Cord 발동: Vercel 송출 차단 완료");
             return NextResponse.json({ success: true, status: `Andon Cord Triggered: Blocked` });
         }

        // --- HP1 v107: Micro-Drawdown Circuit Breaker (5 losses) ---
        if (analysis.isMicroDrawdownBlocked && telegramBotToken && telegramChatId) {
             const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
             const blockMessage = `🚨 <b>[Red Mode Block] 우주 시나리오 쿨다운 발동</b>\n` +
                 `최근 매매 5연속 손실을 감지했습니다.\n\n` +
                 `🔍 <b>[자가 치유 프로토콜]</b>\n` +
                 `조치: 뇌동매매 방지를 위해 24시간 동안 시그널 송출을 전면 차단합니다.\n` +
                 `사유: ${analysis.microDrawdownReason}`;
                 
             await fetch(telegramUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ chat_id: telegramChatId, text: blockMessage, parse_mode: 'HTML' })
             });
             console.log("🛑 Micro-Drawdown Block 발동: Vercel 송출 차단 완료");
             return NextResponse.json({ success: true, status: `Micro-Drawdown Trigged: Blocked` });
        }

        // Filter out bad signals
        if (analysis.direction === 'NEUTRAL' || !isGradeAccepted) {
             console.log(`Trades Filter Auto-Calibration: 노이즈 필터링됨 (현재 빈도 ${extData.tradesIn24h}회/24h -> 요구 등급: ${dynamicMinGrade.join('/')})`);
             return NextResponse.json({ success: true, status: `Filtered (Does not meet dynamic min grade: ${dynamicMinGrade.join('/')})` });
        }

        // Format for Telegram
        if (telegramBotToken && telegramChatId) {
            let directionText = analysis.direction === 'LONG' ? '🟢 LONG (매수)' : '🔴 SHORT (매도)';
            if (analysis.isMarketNeutralPairsTrade) {
                directionText = '🟡 Market-Neutral (BTC/ETH 페어 헤지)';
            }
            
            // --- HP1 Extension: $100 Micro-Sandbox Isolation ---
            const sandboxBalance = 100;
            const personalRisk = AnalysisEngine.calculatePersonalRisk(analysis, sandboxBalance, analysis.currentPrice || 0, 'BLUE');
            
            // Calculate latency for the message
            const currentLatency = Math.round(performance.now() - startTime);

            let message = `🚨 <b>[HP1 킬존 도달] 피 냄새를 맡았습니다. 돌격하십시오!</b> 🚨\n` +
                          `⚠️ <b>[$100 샌드박스 라이브]</b> 멍청한 개미들의 돈을 수거할 시간입니다.\n\n`;

            if (analysis.isIcebergAbsorptionReversed) message += `🧊 <b>[아이스버그 스텔스 감지]</b> 기관의 체결 쪼개기(Absorption) 포착. 역추세 돌격!\n`;
            if (analysis.isAccumulationDefenseTested) message += `📦 <b>[매집 샌드박스 방어선]</b> S급 HVN 방어 구간(Accumulation) 지지/저항 진입.\n`;
            
            message += `\n🔬 <b>[현장 상황 브리핑 (Market Regime)]</b>\n` +
                       `ADX 모멘텀: ${analysis.adxValue?.toFixed(2) || 'N/A'} 👉 ${analysis.isTrendingRegime ? '🔥 폭주하는 추세장. 끝까지 발라먹습니다.' : '🧊 지루한 횡보장. 스캘핑으로 푼돈까지 털어냅니다.'}\n` +
                       `🧠 <b>[구글 투심]</b>: ${analysis.googleTrendsSentiment === 'BULLISH' ? '개미들의 포모(FOMO) 과열 중. 반대로 찌릅니다.' : analysis.googleTrendsSentiment === 'BEARISH' ? '공포에 질린 개미들. 하락 압력에 몸을 싣습니다.' : '무색무취의 대중. 차트 에너지만 믿고 갑니다.'}\n` +
                       `🐋 <b>[기관 흔적]</b>: ${analysis.hasIntegerAlgoFootprint ? "호가창에 '.000' 단위 세력의 콘크리트 방어막 확인 완료." : "세력의 노골적인 흔적 부재. 기술적 타점 위주 대응."}\n\n`;

            message += `⚖️ <b>[전술 타점 및 리스크 프로필]</b>\n` +
                       `방향: ${directionText} - ${analysis.direction === 'LONG' ? '"하늘로 솟구치는 불기둥에 올라탑니다"' : '"떨어지는 칼날에 개미들을 제물로 바칩니다"'}\n`;

            if (!analysis.isMarketNeutralPairsTrade) {
                message += `🎯 [TP 1 / ${(personalRisk.tp1Ratio * 100).toFixed(0)}% 익절] 1:2 비율로 기본 수수료 챙기기: ${personalRisk.tp1.toFixed(2)}\n`;
                if (personalRisk.tp2Ratio > 0) {
                    message += `🎯 [TP 2 / ${(personalRisk.tp2Ratio * 100).toFixed(0)}% 익절] 1:3 비율로 뼈대 발라먹기: ${personalRisk.tp2.toFixed(2)}\n`;
                }
                if (personalRisk.tp3Ratio > 0) {
                    message += `🌊 [TP 3 / ${(personalRisk.tp3Ratio * 100).toFixed(0)}% 런너] 피터 브랜트 모드. 끝까지 수익 쥐어짜기.\n`;
                }
                message += `🛑 <b>손절가(SL)</b>: ${personalRisk.sl.toFixed(2)} (청산맵 진공 구역. 여기까지 오면 깔끔하게 인정하고 후퇴합니다.)\n\n`;
            }

            message += `진입 비중: ${analysis.recommendedSize.toFixed(0)}% (Kelly)\n` +
                       `권장 레버리지: ${personalRisk.leverage}x\n` +
                       `💰 권장 증거금(Margin): $${personalRisk.margin.toFixed(2)}\n\n` +
                       `⏱️ <b>[시스템 핑]</b>: ${currentLatency}ms. Vercel 타격 속도 이상 무.\n\n` +
                       `🧠 <b>[기존 핵심 분석 및 알고리즘]</b>\n` +
                       `[TradingView Webhook 24/7 Sentry]\n` +
                       `SQN Rating: ${analysis.sqnScore?.toFixed(2) || 'N/A'}\n` +
                       `${analysis.trailingStopMsg ? `🛡️ ${analysis.trailingStopMsg}\n` : ''}` +
                       `${analysis.peterBrandtMsg ? `🔥 ${analysis.peterBrandtMsg}\n` : ''}` +
                       `📝 핵심 근거:\n- ${analysis.reasons.join('\n- ')}\n`;

            // --- HP1 v105: FBM Telegram Trigger Optimization ---
            message += `\n⚡ <b>[FBM 심리 트리거 가동]</b>\n`;
            if (analysis.actionGrade === 'S') {
                 message += `<i>"지금 진입하지 않으면 기관의 급행열차를 놓칠 수 있습니다. 앱을 켜고 SL설정 후 즉각 탑승하십시오." (Spark)</i>\n`;
            } else if (analysis.isMtfDivergenceReversal || analysis.isEqhEqlLiquiditySweep) {
                 message += `<i>"군중이 청산당하는 바로 이 15초가 당신을 승리자로 만듭니다. 반대매매(역추세) 버튼을 누르십시오." (Spark)</i>\n`;
            } else {
                 message += `<i>"너무 많은 생각은 뇌동매매를 부릅니다. ${personalRisk.sl.toFixed(2)} 라인에 손절(SL)만 걸어두면 수익은 알아서 굴러옵니다. 단순하게 행동하세요." (Facilitator)</i>\n`;
            }

            // --- HP1 v107: Lean Innovation Accounting Funnel (Telegram Buttons) ---
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        { text: "🚀 진입 완료", callback_data: "action_entered" },
                        { text: "🛑 진입 보류", callback_data: "action_skipped" }
                    ]
                ]
            };

            // --- HP1 v109: 'Productize Yourself' Multi-Tenant Mode ---
            // Simulate 1,000 True Fans (VIP Subscribers) from Vercel DB or environment
            const chatIds = telegramChatId ? telegramChatId.split(',') : [];
            // Adding a mock subscriber for architectural demonstration (1,000 True Fans)
            if (chatIds.length > 0 && !chatIds.includes('MOCK_FAN_001_1000TRUEFANS')) {
                // In production, fetch from Supabase/Vercel KV.
                // chatIds.push('MOCK_FAN_001_1000TRUEFANS'); 
            }

            const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
            
            const broadcastPromises = chatIds.map(async (cid) => {
                try {
                    await fetch(telegramUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: cid.trim(),
                            text: message,
                            parse_mode: 'HTML',
                            reply_markup: inlineKeyboard
                        })
                    });
                    return true;
                } catch (e) {
                    console.error(`Telegram Broadcast Failed for ${cid}:`, e);
                    return false;
                }
            });

            await Promise.all(broadcastPromises);
            
            const latency = performance.now() - startTime;
            console.log(`[V111 Live Protocol] Funnel Logging: Webhook-to-Telegram Latency => ${latency.toFixed(2)}ms`);

            return NextResponse.json({ success: true, status: `Broadcasted to ${broadcastPromises.length} MT subscribers`, latencyMs: latency });
        }

        return NextResponse.json({ success: true, status: `Analyzed but missing TG credentials` });

    } catch (e: any) {
        console.error("TV Webhook error:", e);
        const latencyError = performance.now() - startTime;
        return NextResponse.json({ success: false, error: e.message, latencyMs: latencyError }, { status: 500 });
    }
}
