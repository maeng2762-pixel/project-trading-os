import { TradeEngine } from '../src/lib/server/TradeEngine';
import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function executeRealTrade() {
    console.log("🔥 [실전 테스트] 바이낸스 라이브 포지션 진입 시도 중...");
    
    const exchange = new ccxt.binance({ options: { defaultType: 'future' } });
    const ticker = await exchange.fetchTicker('BTC/USDT');
    const currentPrice = ticker.last || 65000;

    const mockSignal = {
        direction: 'LONG', // 'LONG' or 'SHORT'
        basePrice: currentPrice,   
        baseStopLossPct: 1, // 1%
        baseTargetPct: 2.5, // 2.5%
        kellyRiskPct: 1.0,  
        status: 'PENDING'
    };

    // 실전 코드로 TradeEngine을 동작시킵니다.
    const result = await TradeEngine.executeTrade('ADMIN_TEST', mockSignal);
    console.log("\n[결과 리포트] 📊 :", result);
}

executeRealTrade();
