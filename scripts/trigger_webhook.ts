import { TradeEngine } from '../src/lib/server/TradeEngine';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function executeRealTrade() {
    console.log("🔥 [실전 테스트] 바이낸스 라이브 포지션 진입 시도 중...");
    const mockSignal = {
        direction: 'LONG', // 'LONG' or 'SHORT'
        basePrice: 90000,   // Mock entry, not really used for Market Order but used for TP/SL 
        baseStopLossPct: 1, // 1%
        baseTargetPct: 2.5, // 2.5%
        kellyRiskPct: 1.0,  // 1% of the $250 balance ($2.5 risk) -> 10x leverage = $25 
        status: 'PENDING'
    };

    // 실전 코드로 TradeEngine을 동작시킵니다.
    // DRY_RUN이 false(또는 환경변수 미설정)이므로 진짜 들어갑니다!
    const result = await TradeEngine.executeTrade('ADMIN_TEST', mockSignal);
    console.log("\n[결과 리포트] 📊 :", result);
}

executeRealTrade();
