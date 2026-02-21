export type Language = 'ko' | 'en';

export const translations = {
    ko: {
        // Dashboard
        "dashboard.balance": "총 자산",
        "dashboard.daily_pnl": "일일 손익",
        "dashboard.discipline_score": "규율 점수",
        "dashboard.command_center": "전술 지휘소",
        "dashboard.trading_log": "매매 로그",
        "dashboard.recent_activity": "최근 활동",

        // Auth
        "auth.login_btn": "로그인 / 회원가입",
        "auth.logout": "로그아웃",

        // Observer Mode
        "observer.title": "관찰자 모드 (Observer Mode)",
        "observer.desc": "실시간 AI 신호와 매매 가드를 사용하려면 로그인이 필요합니다.",
        "observer.login": "로그인하고 시작하기",

        // Trade Entry
        "entry.price": "진입가",
        "entry.amount": "금액 (USDT)",
        "entry.sl": "손절가 (SL)",
        "entry.tp": "익절가 (TP)",
        "entry.long": "롱 (매수)",
        "entry.short": "숏 (매도)",
        "entry.execute": "체결",
        "entry.calculating": "계산 중...",
        "entry.required_reason": "진입 사유를 선택해야 합니다.",
        "entry.rec_size": "권장 비중",

        // Modals
        "modal.reason_title": "왜 진입합니까?",
        "modal.reason_trend": "추세 추종 (Trend)",
        "modal.reason_reversal": "역추세/반전 (Reversal)",
        "modal.reason_news": "뉴스/재료 (News)",
        "modal.reason_emotional": "뇌동매매 (Emotional)",

        "modal.feedback_title": "매매 복기 (The Mirror)",
        "modal.feedback_desc": "자신을 속이지 마십시오. 감정을 기록하고 원칙 준수 여부를 판단하십시오.",
        "modal.emotion_label": "당신의 감정은?",
        "modal.mistake_label": "원칙을 어겼습니까?",
        "modal.mistake_hint": "솔직해지세요. 감시자는 알고 있습니다.",
        "modal.mistake_yes": "네, 실수했습니다",
        "modal.mistake_no": "아니오, 원칙대로 했습니다",
        "modal.submit_audit": "감사 제출",
        "modal.ready": "준비됨",
        "modal.select_emotion": "감정 선택 필요",
        "common.cancel": "취소",

        // Emotions
        "emotion.calm": "평온함",
        "emotion.greed": "탐욕/흥분",
        "emotion.fear": "공포/불안",
        "emotion.anger": "분노/복수심",
        "emotion.bored": "지루함/심심함",

        // Insight
        "insight.title": "행동 분석 리포트",

        // Coliseum (Leaderboard)
        "coliseum.title": "규율의 전당 (The Coliseum)",
        "coliseum.rank": "순위",
        "coliseum.trader": "트레이더",
        "coliseum.score": "규율 점수",
        "coliseum.streak": "연속 생존",
        "coliseum.hidden": "비공개",
        "coliseum.you": "나",
        "coliseum.overtake_msg": "3점만 더 올리면 {name}님을 추월할 수 있습니다!",
        "coliseum.streak_day": "일",
        "coliseum.top_rank": "상위 5%",

        // Metrics
        "metrics.impact_title": "행동 변화 지표",
        "metrics.compliance": "AI 조언 준수율",
        "metrics.sl_adherence": "손절 원칙 준수율",
        "metrics.compliance_desc": "AI의 리스크 평가를 따르고 '나쁜 수익'을 피한 비율입니다.",
        "metrics.sl_desc": "손실 발생 시 계획된 손절가를 철저히 지킨 비율입니다.",
        "metrics.money_saved": "방어한 자산",
        "metrics.weekly_title": "주간 규율 성적표",
        "metrics.resisted": "뇌동매매 방어",
        "metrics.times": "회",
        "metrics.saved_msg": "이번 주, {count}번의 뇌동매매를 참아 약 ${amount}의 손실을 방어했습니다.",

        // Sentinel
        "sentinel.scanning": "BTC/USDT 실시간 감시 중...",
        "sentinel.activated": "감시자 모듈 활성화됨",

        // Dashboard Tabs
        "dashboard.metrics": "성과 지표",
        "dashboard.social": "소셜 랭킹",

        // Share (Megaphone)
        "share.modal_title": "이 순간을 기록하세요",
        "share.modal_desc": "당신의 규율과 성과를 세상에 알리세요.",
        "share.impulse_title": "방어한 잠재 손실",
        "share.score_title": "현재 규율 점수",
        "share.saved_msg": "AI 코치가 {count}번의 뇌동매매를 막았습니다.",
        "share.join_us": "지금 바로 규율 있는 매매를 시작하세요.",
        "share.btn_copy": "텍스트 복사",
        "share.btn_download": "이미지 저장",
        "share.copy_text": "오늘 나는 감정을 이기고 원칙을 지켰다. 💎 규율 점수: {score}점 | 방어한 금액: ${saved} #TradingOS #DebtHero",

        // Daily Ritual
        "ritual.title": "전투 준비 태세 (Mental Armor)",
        "ritual.desc": "매매를 시작하기 전, 감정을 통제하고 원칙을 지킬 것을 맹세하십시오.",
        "ritual.btn_pledge": "규율 준수 서약 (+5점)",
        "ritual.active_title": "정신 무장 완료",
        "ritual.bonus_applied": "규율 보너스 적용됨",
        "ritual.default_quote": "시장은 인내심 없는 자의 돈을 인내심 있는 자에게 옮기는 기계다. - 워렌 버핏",
        "ritual.quotes": "투자는 IQ 160이 IQ 130을 이기는 게임이 아니다. - 워렌 버핏|잃지 않는 것이 가장 중요하다. - 조지 소로스|감정을 배제하고 기계처럼 매매하라.|복리야말로 세계 8번째 불가사의다. - 아인슈타인|공포를 사서 환희에 팔아라.",

        // Insight Panel
        "insight.time_late": "심야 (00-06시)",
        "insight.time_morning": "오전 (06-12시)",
        "insight.time_afternoon": "오후 (12-18시)",
        "insight.time_evening": "저녁 (18-24시)",
        "insight.warn_emotion_winrate": "'{emotion}' 상태일 때 승률이 {rate}%에 불과합니다. 매매를 쉬세요.",
        "insight.warn_emotion_cost": "'{emotion}' 상태의 매매로 총 ${cost}의 손실을 입었습니다.",
        "insight.warn_time_winrate": "{time} 시간대 매매 승률이 {rate}%입니다. 차라리 주무세요.",
        "insight.default_time": "일반",

        // Active Ops
        "ops.entry": "진입가",
        "ops.target": "목표가",
        "ops.distance": "목표까지 거리",
        "ops.protocol": "Active Ops 프로토콜",
        "ops.fatal": "치명적 경고 (FATAL)",
        "ops.advice_hold": "데이터 수신 중... 포지션 유지.",
        "ops.btn_close_now": "🚨 즉시 청산 (Close Now)",
        "ops.btn_tp_current": "현재가로 익절 설정",
        "ops.btn_manual": "수동 청산 (Exit)",
        "ops.sleep_active": "슬립 모드 가동 중 (Sleep Mode)",
        "ops.sleep_desc": "AI가 24시간 시장을 감시합니다. '치명적 반전'이 감지되면 자동으로 포지션을 종료하여 자본을 보호합니다. 편안히 쉬십시오.",
        "ops.sleep_btn_on": "슬립 모드 켜짐",
        "ops.sleep_btn_off": "슬립 모드 켜기",

        // Notifications
        "noti.enable": "알림 켜기",
        "noti.enabled": "알림 켜짐",
        "noti.signal_title": "🔭 포착된 기회",
        "noti.signal_body": "강한 {direction} 신호가 감지되었습니다. (점수: {score}점)",
        "noti.fatal_title": "🚨 치명적 반전 경고",
        "noti.fatal_body": "즉시 포지션을 확인하십시오! AI가 위험을 감지했습니다.",
        "noti.tp_title": "💰 익절 목표 달성",
        "noti.tp_body": "축하합니다! 목표가에 도달했습니다.",
        "noti.sl_title": "🛡️ 손절 방어 발동",
        "noti.sl_body": "자산을 보호하기 위해 손절했습니다. 다음 기회를 노리세요.",

        // v2.0 Header
        "header.mental": "멘탈 (Mental)",
        "header.discipline": "규율 (Discipline)",
        "header.balance": "총 자산",
        "header.today": "금일 수익",

        // v2.0 Signal Card
        "signal.bullish_bias": "상승 우위 (BULL)",
        "signal.bearish_bias": "하락 우위 (BEAR)",
        "signal.neutral": "관망 (NEUTRAL)",
        "signal.confidence": "신뢰도",
        "signal.bullish": "상승",
        "signal.bearish": "하락",
        "signal.vol_risk": "변동성 / 위험",
        "signal.risk_high": "높음",
        "signal.risk_medium": "보통",
        "signal.risk_low": "낮음",
        "signal.rec_size": "권장 비중",
        "signal.max_lev": "최대 레버리지",
        "signal.safety_cap": "Safety Cap: 리스크 관리 (최대 20% 제한)",
        "signal.why": "분석 근거 확인하기",

        // v3.0 Entry
        "entry.auto_set": "AI 자동 설정",
        "entry.auto_set_toast": "리스크 최적화 완료: 자산의 1.4%만 베팅합니다.",

        // v3.0 Survival
        "survival.title": "생존 확률",
        "survival.desc": "파산 면역 점수 (Naval's Score)",

        // Billing
        "billing.observer_title": "옵저버 (Observer)",
        "billing.observer_desc_1": "실시간 시장 감시",
        "billing.observer_desc_2": "기본 차트 제공",
        "billing.observer_desc_3": "AI 신호 미제공",
        "billing.current_plan": "현재 이용 중",

        "billing.pro_title": "프로 (Pro)",
        "billing.pro_desc": "확실한 우위를 원하는 트레이더를 위해.",
        "billing.popular": "가장 인기",
        "billing.feature_1": "무제한 AI 신호 (Unlimited)",
        "billing.feature_2": "리스크 가드 (파산 방어)",
        "billing.feature_3": "매매 복기 & 감사 (Audit)",
        "billing.feature_4": "포지션 최적화 계산기",
        "billing.start_trial": "7일 무료 체험 시작",
        "billing.cancel_anytime": "언제든 취소 가능합니다.",

        "billing.inner_title": "이너 서클 (Inner Circle)",
        "billing.inner_feature_1": "📜 The Alpha Report (월간 전략)",
        "billing.inner_feature_2": "⚔️ The War Room (비공개 디스코드)",
        "billing.inner_feature_3": "💎 Early Access (베타 알고리즘)",
        "billing.inner_feature_4": "1:1 Strategy Concierge",
        "billing.join_waitlist": "대기 명단 등록 ($999/평생)",

        // Trust Score & Ruin (v5.0)
        "trust.title": "Kelly's 실전 투자 현황",
        "trust.subtitle": "100% 투명한 실시간 계좌 공개",
        "trust.verified": "실시간 검증됨",
        "trust.live": "LIVE: 공식 계좌",
        "trust.saved": "방어한 손실금",
        "trust.winrate": "30일 승률",
        "trust.rr": "손익비 (R:R)",
        "trust.mdd": "최대 낙폭 (MDD)",

        "ruin.title": "파산 확률 (Prob. of Ruin)",
        "ruin.safe": "안전 (Safe)",
        "ruin.danger": "위험 (High Risk)",
        "ruin.critical": "파산 직전 (Critical)",

        // v7.0 Risk Engine
        "risk.tactical_training": "전술 모드: 훈련용 바퀴 장착 (Max 5%, 1x)",
        "risk.tactical_positive_ev": "전술 모드: 훈련이라도 수익성이 있는 자리(Positive EV)여야 합니다.",
        "risk.capital_negative": "자본 모드: 엣지가 없습니다 (Kelly ≤ 0)",
        "risk.capital_risky": "자본 모드: {grade}등급은 너무 위험합니다.",
        "risk.capital_safe": "자본 모드: {grade}등급 (Half-Kelly {size}%, {lev}x)",
        "entry.auto_set_blocked": "⚠️ 자동 설정 차단됨",

        // v7.0 Beginner Guide
        "guide.btn_label": "초보자 가이드",
        "guide.step1_title": "Kelly는 리딩방이 아닙니다.",
        "guide.step1_desc": "Kelly는 당신에게 '무엇을 사라'고 말하는 봇이 아니라, 당신이 '감정에 휘둘려 돈을 잃지 않게' 막아주는 AI 리스크 관리 코치입니다.",
        "guide.step2_title": "두 개의 자아를 분리하세요.",
        "guide.step2_desc": "매매가 하고 시플 땐 '전술 모드(Tactical)'에서 소액으로 즐기세요. 진짜 자산을 불릴 땐 '자본 모드(Capital)'에서 신중하게 접근하세요.",
        "guide.step3_title": "돈보다 점수를 버세요.",
        "guide.step3_desc": "수익금(PnL)은 잊으세요. 규율을 지키고 원칙대로 매매하면 올라가는 '생존 점수(Survival Score)'가 당신의 진짜 실력입니다.",

        "guide.step_shield_title": "절대 원칙: 셧다운 제도",
        "guide.step_shield_desc": "연속으로 3번 손절하면 '뇌동매매'로 간주하여 24시간 동안 매매가 강제로 차단됩니다. 멘탈 점수가 60점 미만이어도 매매 버튼이 잠깁니다. 이것은 벌칙이 아니라 당신을 보호하는 안전장치입니다.",

        "guide.step_brain_title": "AI 등급 (S~F급)",
        "guide.step_brain_desc": "AI가 모든 상황을 분석해 등급을 매깁니다. S급과 A급은 강력 추천, B급은 소액 진입입니다. C급 이하는 '관망'하세요. 수수료도 못 건지는 자리입니다.",

        "guide.step4_title": "준비 되셨나요?",
        "guide.step4_desc": "처음에는 '전술 모드'로 시작됩니다. AI가 제안하는 리스크 관리를 경험해보세요. 행운을 빕니다!",
        "guide.next_btn": "다음",
        "guide.start_btn": "시작하기",

        // v8.0 Guarded AutoPilot
        "autopilot.title": "Guarded AutoPilot",
        "autopilot.subtitle": "감정 차단 모드",
        "autopilot.status_safe": "안전 (Safe)",
        "autopilot.status_cooldown": "냉각 중 (Cooldown)",
        "autopilot.status_vacation": "시스템 휴식 (Vacation)",
        "autopilot.mdd_distance": "MDD 5% 도달까지 남은 안전거리",
        "autopilot.emotion_blocks": "이번 주 AI가 차단한 감정적 매매 횟수",
        "autopilot.runway": "현재 계좌 최대 생존 기간(Runway)",
        "autopilot.kill_switch": "패닉 스위치 (모두 종료)",

        "autopilot.consent_title": "⚠️ 이 기능은 투자 일임이 아닙니다.",
        "autopilot.consent_p1": "Kelly는 당신에게 돈을 벌어주는 마법의 봇이 아닙니다.",
        "autopilot.consent_p2": "이 기능은 당신이 설정한 원칙을 감정 없이 '대리 실행' 해주는 API 연동 도구일 뿐입니다.",
        "autopilot.consent_p3": "Kelly는 생존 확률이 유리할 때만 거래를 돕습니다. (Capital Mode + A급 이상 신호 강제 진행)",
        "autopilot.consent_chk1": "한 달에 -8%의 손실이 발생할 수도 있는 극단적 보수적 전략임에 동의하십니까?",
        "autopilot.consent_chk2": "원금 손실의 책임은 전적으로 본인에게 있음을 동의하십니까?",
        "autopilot.consent_start": "내 API 키 연결하기"
    },
    en: {
        // ... existing english keys ...
        "dashboard.metrics": "Metrics",
        "dashboard.social": "Social",

        // Auth
        "auth.login_btn": "Login / Sign up",
        "auth.logout": "Log out",

        // Observer Mode
        "observer.title": "Observer Mode",
        "observer.desc": "Sign in to access real-time AI signals and execute trades with Kelly's Guard.",
        "observer.login": "Login to Start",

        // Sentinel
        "sentinel.scanning": "Scanning BTC/USDT...",
        "sentinel.activated": "Sentinel Module Activated",

        // Share (Megaphone)
        "share.modal_title": "Capture the Moment",
        "share.modal_desc": "Share your discipline and performance with the world.",
        "share.impulse_title": "Potential Loss Prevented",
        "share.score_title": "Current Discipline Score",
        "share.saved_msg": "AI Coach resisted {count} impulsive trades.",
        "share.join_us": "Start disciplined trading now.",
        "share.btn_copy": "Copy Text",
        "share.btn_download": "Save Image",
        "share.copy_text": "I defeated emotion and kept my rules today. 💎 Discipline Score: {score} | Money Saved: ${saved} #TradingOS #DebtHero",

        // Daily Ritual
        "ritual.title": "Mental Armor Protocol",
        "ritual.desc": "Before you trade, swear to control your emotions and follow your rules.",
        "ritual.btn_pledge": "I Pledge Discipline (+5 XP)",
        "ritual.active_title": "Mental Armor Active",
        "ritual.bonus_applied": "Discipline Bonus Applied",
        "ritual.default_quote": "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
        "ritual.quotes": "Investing is not a game where the guy with the 160 IQ beats the guy with 130 IQ. - Warren Buffett|It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong. - George Soros|Exclude emotions and trade like a machine.|Compound interest is the eighth wonder of the world. - Einstein|Be fearful when others are greedy and greedy when others are fearful.",

        // Active Ops
        "ops.entry": "Entry",
        "ops.target": "Target",
        "ops.distance": "Distance to Target",
        "ops.protocol": "Active Ops Protocol",
        "ops.fatal": "FATAL WARNING",
        "ops.advice_hold": "Market data unavailable. Hold position.",
        "ops.btn_close_now": "🚨 Close Position Now",
        "ops.btn_tp_current": "Set TP to Current",
        "ops.btn_manual": "Manual Close (Exit)",
        "ops.sleep_active": "Sleep Mode is Active",
        "ops.sleep_desc": "AI is monitoring the market 24/7. If a FATAL REVERSAL occurs, the system will automatically attempt to close the position to protect your capital. Rest easy.",
        "ops.sleep_btn_on": "SLEEP MODE ON",
        "ops.sleep_btn_off": "ACTIVATE SLEEP MODE",

        // Notifications
        "noti.enable": "Enable Noti",
        "noti.enabled": "Noti On",
        "noti.signal_title": "🔭 Opportunity Detected",
        "noti.signal_body": "Strong {direction} signal detected. (Score: {score})",
        "noti.fatal_title": "🚨 FATAL REVERSAL",
        "noti.fatal_body": "Check your position immediately! High risk detected.",
        "noti.tp_title": "💰 Take Profit Hit",
        "noti.tp_body": "Target Reached! Nice trade.",
        "noti.sl_title": "🛡️ Stop Loss Triggered",
        "noti.sl_body": "Position closed to protect capital. Wait for next opportunity.",

        // v2.0 Header
        "header.mental": "Mental",
        "header.discipline": "Discipline",
        "header.balance": "Balance",
        "header.today": "Today",

        // v2.0 Signal Card
        "signal.bullish_bias": "BULLISH BIAS",
        "signal.bearish_bias": "BEARISH BIAS",
        "signal.neutral": "NEUTRAL (WAIT)",
        "signal.confidence": "Confidence",
        "signal.bullish": "Bullish",
        "signal.bearish": "Bearish",
        "signal.vol_risk": "Vol / Risk",
        "signal.risk_high": "HIGH",
        "signal.risk_medium": "MEDIUM",
        "signal.risk_low": "LOW",
        "signal.rec_size": "Rec. Size",
        "signal.max_lev": "Max Lev",
        "signal.safety_cap": "Safety Cap Active: Restricted to max 20% risk.",
        "signal.why": "Why? (Analysis Logic)",

        // v3.0 Entry
        "entry.auto_set": "AI Auto-Set",
        "entry.auto_set_toast": "Risk Optimized: Betting only 1.4% of balance.",

        // v3.0 Survival
        "survival.title": "Survival Score",
        "survival.desc": "Durable Score (Naval's Score)",

        // Billing
        "billing.observer_title": "Observer",
        "billing.observer_desc_1": "Market Monitoring",
        "billing.observer_desc_2": "Basic Charts",
        "billing.observer_desc_3": "No AI Signals",
        "coliseum.top_rank": "Top 5%",
        "billing.current_plan": "Current Plan",

        "billing.pro_title": "Pro",
        "billing.pro_desc": "For serious traders needing an edge.",
        "billing.popular": "MOST POPULAR",
        "billing.feature_1": "Unlimited AI Signals",
        "billing.feature_2": "Risk Guard Protection",
        "billing.feature_3": "Trade Journal & Audit",
        "billing.feature_4": "Position Sizing Calc",
        "billing.start_trial": "Start 7-Day Free Trial",
        "billing.cancel_anytime": "Cancel anytime. No questions asked.",

        "billing.inner_title": "Inner Circle",
        "billing.inner_feature_1": "Everything in Pro",
        "billing.inner_feature_2": "1:1 Strategy Concierge",
        "billing.inner_feature_3": "Private Discord Access",
        "billing.inner_feature_4": "Early Beta Features",
        "billing.join_waitlist": "Join Waitlist",

        // Modals - Feedback (English)
        "modal.feedback_title": "Trade Audit (The Mirror)",
        "modal.feedback_desc": "Do not deceive yourself. Record your emotions and judge your discipline.",
        "modal.emotion_label": "Your Emotion?",
        "modal.mistake_label": "Did you break rules?",
        "modal.mistake_yes": "Yes, I made a mistake",
        "modal.mistake_no": "No, followed rules",
        "modal.submit_audit": "Submit Audit",

        // Emotions
        "emotion.calm": "Calm",
        "emotion.greed": "Greed/Excited",
        "emotion.fear": "Fear/Anxious",
        "emotion.anger": "Anger/Revenge",
        "emotion.bored": "Boredom",

        // v7.0 Risk Engine
        "risk.tactical_training": "Tactical Mode: Training Wheels On (Max 5%, 1x)",
        "risk.tactical_positive_ev": "Tactical Mode: Even training requires Positive EV.",
        "risk.capital_negative": "Capital Mode: Negative Edge (Kelly <= 0)",
        "risk.capital_risky": "Capital Mode: {grade}-Grade is too risky.",
        "risk.capital_safe": "Capital Mode: {grade}-Grade (Half-Kelly {size}%, {lev}x)",
        "entry.auto_set_blocked": "⚠️ Auto-Set Blocked",

        // v7.0 Beginner Guide
        "guide.btn_label": "Beginner Guide",
        "guide.step1_title": "Kelly is NOT a Signal Bot.",
        "guide.step1_desc": "Kelly is an AI Risk Coach designed to prevent you from losing money due to emotions, not just tell you what to buy.",
        "guide.step2_title": "Separate Your Ego.",
        "guide.step2_desc": "Use 'Tactical Mode' for fun and practice with small amounts. Use 'Capital Mode' for serious wealth accumulation.",
        "guide.step3_title": "Earn Score, Not Just Money.",
        "guide.step3_desc": "Forget PnL. Focus on your 'Survival Score', which rises when you follow discipline and rules. That is your true skill.",

        "guide.step_shield_title": "The Iron Rule: Circuit Breaker",
        "guide.step_shield_desc": "3 consecutive losses = 24h Lockout. Mental Score < 60 = Buttons Disabled. This is not a punishment; it is a shield to protect your capital from emotional trading.",

        "guide.step_brain_title": "AI Grades (S~F)",
        "guide.step_brain_desc": "AI grades every setup. S/A are strong buys. B is moderate (half size). C/F means 'Stay Away' - the expected value doesn't even cover fees.",

        "guide.step4_title": "Are You Ready?",
        "guide.step4_desc": "You will start in 'Tactical Mode'. Experience the AI risk management now. Good luck!",
        "guide.next_btn": "Next",
        "guide.start_btn": "Let's Start",

        // v8.0 Guarded AutoPilot
        "autopilot.title": "Guarded AutoPilot",
        "autopilot.subtitle": "Emotion Block Mode",
        "autopilot.status_safe": "Safe",
        "autopilot.status_cooldown": "Cooldown",
        "autopilot.status_vacation": "System Vacation",
        "autopilot.mdd_distance": "Safe Distance to 5% MDD Stop",
        "autopilot.emotion_blocks": "Emotional Trades Blocked by AI this week",
        "autopilot.runway": "Current Account Max Runway",
        "autopilot.kill_switch": "PANIC SWITCH (CLOSE ALL)",

        "autopilot.consent_title": "⚠️ This is NOT an Investment Firm.",
        "autopilot.consent_p1": "Kelly is not a magic bot guaranteed to make you rich.",
        "autopilot.consent_p2": "This tool simply 'executes' your rules via API without emotion.",
        "autopilot.consent_p3": "Kelly trades only when survival odds are favorable. (Capital Mode + Grade A+ only)",
        "autopilot.consent_chk1": "Do you agree to this extreme conservative strategy that could yield a -8% monthly loss?",
        "autopilot.consent_chk2": "Do you agree that all risk of principal loss lies entirely with you?",
        "autopilot.consent_start": "Connect MY API Key"
    }
};
