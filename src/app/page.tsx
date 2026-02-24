'use client';
import { RiskGuard } from '@/components/shield/RiskGuard';
import { BeginnerGuide } from '@/components/guide/BeginnerGuide';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuthStore } from '@/store/useAuthStore';
import { AutoJournal } from '@/components/trading/AutoJournal';
import { TodayPlaybook } from '@/components/intelligence/TodayPlaybook';
import { ShieldCalculator } from '@/components/trading/ShieldCalculator';
import { MarketStatusTags } from '@/components/intelligence/MarketStatusTags';
import { PerformanceLab } from '@/components/gym/PerformanceLab';
import { UniversalJournalModal } from '@/components/gym/UniversalJournalModal';
import { FilePlus } from 'lucide-react';
import { AnalysisLog } from '@/components/intelligence/AnalysisLog';
import { PostMortemModal } from '@/components/trading/PostMortemModal';
import { PricingModal } from '@/components/billing/PricingModal';
import { ProApiConnectionModal } from '@/components/auth/ProApiConnectionModal';
import { InsightPanel } from '@/components/analysis/InsightPanel';
import { Leaderboard } from '@/components/social/Leaderboard';
import { ImpactTracker } from '@/components/analysis/ImpactTracker';
import { WeeklyReport } from '@/components/analysis/WeeklyReport';
import { DailyRitual } from '@/components/dashboard/DailyRitual';
import { ActiveOpsManager } from '@/components/trading/ActiveOpsManager';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { BinanceService } from '@/services/binance';
import { AnalysisEngine, AnalysisResult } from '@/lib/analysis';

import { useEffect, useState } from 'react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationService } from '@/lib/notification';
import { Bell, BellOff, FlaskConical } from 'lucide-react';
import { TrustBadge } from '@/components/dashboard/TrustBadge';
import { RuinGuard } from '@/components/analysis/RuinGuard'; // Optimized for later
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RedPotionArena } from '@/components/gaming/RedPotionArena';

export default function Home() {
  // @ts-ignore - syncStatus added in store but interface update might be delayed in IDE
  const { balance, liveBalance, apiConnected, setBalance, dailyPnl, dailyStartBalance, disciplineScore, positions, syncStatus, tier } = useTradingStore();
  const { user, loading } = useAuthStore() as unknown as { user: any, loading: boolean };
  const { t } = useLanguageStore();
  const { isEnabled, toggleNotifications, lastNotification, setLastNotification } = useNotificationStore();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [potionMode, setPotionMode] = useState<'BLUE' | 'RED'>('BLUE');
  const [showPotionWarning, setShowPotionWarning] = useState(false);

  // Notification Logic: Watch Analysis & Positions
  useEffect(() => {
    if (!isEnabled || !analysis) return;

    const now = Date.now();
    const COOLDOWN = 60 * 60 * 1000; // 1 Hour for same type alert

    // 1. Observation Mode: Strong Signals (Score > 70)
    if (positions.length === 0) {
      if (analysis.score >= 70) {
        if (!lastNotification['signal'] || now - lastNotification['signal'] > COOLDOWN) {
          NotificationService.send(
            t('noti.signal_title'),
            t('noti.signal_body').replace('{direction}', analysis.direction).replace('{score}', analysis.score.toString())
          );
          setLastNotification('signal');
        }
      }
    }

    // 2. Active Mode: Fatal Reversal
    if (positions.length > 0) {
      // Logic handled inside ActiveOpsManager or here? 
      // Let's watch analysis here for Fatal Reversal as it's cleaner.
      const position = positions[0];
      const isContrary = (position.type === 'LONG' && analysis.direction === 'SHORT') || (position.type === 'SHORT' && analysis.direction === 'LONG');

      if (isContrary && analysis.score >= 60) {
        if (!lastNotification['fatal'] || now - lastNotification['fatal'] > 5 * 60 * 1000) { // 5 min cooldown for fatal
          NotificationService.send(t('noti.fatal_title'), t('noti.fatal_body'));
          setLastNotification('fatal');
        }
      }
    }

  }, [analysis, positions, isEnabled, lastNotification, setLastNotification, t]);


  useEffect(() => {
    setMounted(true);
    // ... existing sentinel code ...
    const runSentinel = async () => {
      const candles = await BinanceService.fetchCandles('BTCUSDT', '1h', 200);
      const result = AnalysisEngine.analyze({ '1h': candles });
      setAnalysis(result);
    };
    runSentinel();

    const interval = setInterval(runSentinel, 60000);
    return () => clearInterval(interval);

  }, []);

  // Fetch Binance Balance
  useEffect(() => {
    if (user && apiConnected) {
      user.getIdToken().then((token: string) => {
        fetch('/api/binance/balance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.liveBalance !== undefined) {
              setBalance(data.liveBalance);
            }
          })
          .catch(err => console.error("Failed to fetch balance:", err));
      });
    }
  }, [user, apiConnected, setBalance]);

  // ... (Admin code same) ...

  if (!mounted) return null;

  const pnlPercent = dailyStartBalance > 0
    ? ((dailyPnl / dailyStartBalance) * 100).toFixed(2)
    : '0.00';
  const isProfit = dailyPnl >= 0;

  const handleUpgradeClick = () => {
    setShowUpsell(false);
    setShowPricing(true);
  };

  const handlePotionSwitch = () => {
    if (potionMode === 'BLUE') {
      setShowPotionWarning(true);
    } else {
      setPotionMode('BLUE');
    }
  };

  const confirmRedPotion = () => {
    if (tier !== 'PRO') {
      setShowPotionWarning(false);
      setShowPricing(true);
      return;
    }
    setPotionMode('RED');
    setShowPotionWarning(false);
  };

  const handleDisconnectApi = async () => {
    if (!window.confirm("API 연결이 되어있습니다. 연결을 끊으시겠습니까?")) return;

    try {
      if (!user) return;
      const idToken = await user.getIdToken();

      const res = await fetch('/api/binance/keys', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (res.ok) {
        useTradingStore.getState().setApiConnected(false);
        alert("API 연결이 성공적으로 해제되었습니다.");
        window.location.reload();
      } else {
        alert("API 연결 해제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };



  return (
    <div className={`min-h-screen ${potionMode === 'RED' ? 'bg-zinc-950 text-rose-50' : 'bg-black text-white'} font-sans selection:bg-indigo-500/30 transition-colors duration-1000 relative overflow-hidden`}>

      {/* Background Gradients */}
      {potionMode === 'RED' ? (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[150px] rounded-full"></div>
          <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-red-800/20 blur-[150px] rounded-full"></div>
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <RiskGuard>
          <PostMortemModal />
          <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
          {/* Modals and Overlays */}

          {/* Potion Warning Dialog */}
          <Dialog open={showPotionWarning} onOpenChange={setShowPotionWarning}>
            <DialogContent className="bg-zinc-950 border-rose-500/50 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-400 text-lg">
                  <span className="text-2xl">🔴</span> 빨간 포션을 마시겠습니까?
                </DialogTitle>
                <DialogDescription className="text-zinc-300 mt-4 leading-relaxed bg-rose-950/20 p-4 rounded-lg border border-rose-500/20">
                  <strong className="text-rose-400 block mb-2">[부작용 주의: 도파민 과다]</strong>
                  Red Potion 모드는 HP1의 생존 우선 원칙을 버리고 <strong>순수 승률 위주의 전술 게임장</strong>으로 입장하는 것을 의미합니다.<br /><br />
                  - 시드의 10% 이하 강제 제한<br />
                  - 일일 3회 진입 제한 (탄탄창 시스템)<br />
                  - 2연속 손실 시 24시간 계정 Lock<br /><br />
                  {tier !== 'PRO' ? (
                    <span className="text-amber-400 font-bold block mt-2">※ 현재 상태는 관람석(FREE)입니다. 통제된 도박장(Red Potion)에 입장하려면 PRO 업그레이드가 필요합니다. 도파민이 필요하신가요?</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">확인 시 메인 테마가 붉게 변하며 전술 매매 UI로 전환됩니다.</span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" className="flex-1 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => setShowPotionWarning(false)}>
                  취소 (이성 유지)
                </Button>
                <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold border-none" onClick={confirmRedPotion}>
                  {tier === 'PRO' ? '수락 (입장)' : 'Pro 업그레이드하고 입장'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <PricingModal
            isOpen={showPricing}
            onClose={() => setShowPricing(false)}
            triggerReason="Red Potion 접근 권한"
          />

          <ProApiConnectionModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
          {/* Header */}
          <header className="border-b border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto">

              {/* Top Row: Brand & Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-zinc-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span className="text-xl font-light tracking-tight text-white">HP1</span>
                    <span className="text-[9px] text-zinc-500 font-mono opacity-80 uppercase tracking-widest ml-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">v13.0</span>
                  </div>
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1 ml-4">
                    Account Survival OS
                  </div>
                </div>



                {/* Behavior Metrics (Primacy Effect) */}
                <div className="flex items-center gap-6 pr-2">
                  {/* Mental Score */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-[0.2em] font-extrabold text-zinc-500 mb-0.5">{t('header.mental')}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🔥</span>
                      <span className="text-2xl font-light text-zinc-200 font-mono tracking-tighter">85</span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-zinc-800/50"></div>

                  {/* Discipline Score */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-[0.2em] font-extrabold text-[#38bdf8] mb-0.5 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">{t('header.discipline')}</span>
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      <span className="text-2xl font-light text-white font-mono tracking-tighter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                        {disciplineScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Controls & Money (Secondary) */}
              <div className="flex items-center justify-between">

                {/* Balance (Demoted) */}
                <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-0.5">TOTAL EQUITY</span>
                    <span className="font-mono text-sm font-light text-zinc-300 drop-shadow-sm">${apiConnected ? liveBalance.toFixed(2) : balance.toFixed(0)}</span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-0.5">{t('header.today')}</span>
                    <span className={`text-sm font-mono font-light drop-shadow-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dailyPnl >= 0 ? '+' : ''}{pnlPercent}%
                    </span>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">

                  {/* Status Indicator (No Layout Shift) */}
                  <div
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#09090b] border border-zinc-800/80 cursor-pointer hover:bg-zinc-900 transition-colors h-7 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
                    onClick={() => {
                      if (user && tier === 'FREE') setIsPricingOpen(true);
                      else if (user && tier === 'PRO' && !apiConnected) setIsApiModalOpen(true);
                      else if (user && tier === 'PRO' && apiConnected) handleDisconnectApi();
                    }}
                  >
                    {user ? (
                      apiConnected ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-[8px] font-extrabold text-emerald-500 tracking-[0.2em] uppercase hidden sm:inline">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                          <span className="text-[8px] font-extrabold text-amber-500 tracking-[0.2em] uppercase hidden sm:inline">Sync API</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span className="text-[8px] font-extrabold text-zinc-500 tracking-[0.2em] uppercase hidden sm:inline">Offline</span>
                      </div>
                    )}
                  </div>

                  <div className="scale-90 sm:scale-100 flex items-center gap-2 sm:gap-3 origin-right">
                    <BeginnerGuide />
                    {/* Potion Toggle (Right) */}
                    <div className="flex items-center bg-[#050505] p-0.5 rounded-full border border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                      <button
                        onClick={() => potionMode !== 'BLUE' && setPotionMode('BLUE')}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500 ease-out flex-shrink-0 ${potionMode === 'BLUE' ? 'bg-[#1e3a8a] shadow-[0_0_20px_rgba(30,58,138,0.5)] border border-[#3b82f6]/30' : 'hover:bg-zinc-900'}`}
                      >
                        <FlaskConical className={`w-3.5 h-3.5 ${potionMode === 'BLUE' ? 'text-[#60a5fa] drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]' : 'text-zinc-600'}`} />
                        <span className={`text-[9px] font-extrabold tracking-[0.2em] hidden sm:inline ${potionMode === 'BLUE' ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-zinc-500'}`}>BLUE</span>
                      </button>
                      <button
                        onClick={handlePotionSwitch}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500 ease-out flex-shrink-0 ${potionMode === 'RED' ? 'bg-[#881337] shadow-[0_0_20px_rgba(136,19,55,0.5)] border border-[#f43f5e]/30' : 'hover:bg-zinc-900'}`}
                      >
                        <FlaskConical className={`w-3.5 h-3.5 ${potionMode === 'RED' ? 'text-[#fb7185] drop-shadow-[0_0_5px_rgba(251,113,133,0.8)]' : 'text-zinc-600'}`} />
                        <span className={`text-[9px] font-extrabold tracking-[0.2em] hidden sm:inline ${potionMode === 'RED' ? 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-zinc-500'}`}>RED</span>
                      </button>
                    </div>
                    {/* Notification */}
                    <button
                      onClick={toggleNotifications}
                      title={isEnabled ? "알림 끄기" : "알림 켜기"}
                      className={`p-1.5 rounded-full transition-all duration-300 shrink-0 border border-transparent ${isEnabled
                        ? 'text-[#60a5fa] bg-[#1e3a8a]/50 border-[#3b82f6]/20 shadow-[0_0_15px_rgba(30,58,138,0.3)]'
                        : 'text-zinc-500 bg-[#09090b] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-zinc-800'}`}
                    >
                      {isEnabled ? <Bell size={14} className="drop-shadow-[0_0_4px_rgba(96,165,250,0.8)]" /> : <BellOff size={14} />}
                    </button>

                    <LanguageToggle />
                  </div>

                  {/* Auth - Minimal */}
                  {user && (
                    <div className="scale-90 origin-right">
                      <AuthButton />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </header>

          {/* ... Rest of JSX same ... */}
          <div className="container mx-auto p-4 mt-6">
            <DailyRitual />
            <TrustBadge />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative min-h-[80vh] mt-8">
              {/* ... Observer Overlay ... */}
              {false && !user && !loading && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/60 flex flex-col items-center justify-start pt-[20vh] text-center">
                  <div className="p-8 rounded-2xl bg-zinc-900/90 border border-indigo-500/50 shadow-2xl max-w-md mx-4 animate-in fade-in zoom-in duration-500">
                    <span className="text-4xl mb-4 block">🔒</span>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('observer.title')}</h2>
                    <p className="text-zinc-300 mb-6 leading-relaxed">
                      {t('observer.desc')}
                    </p>
                    <div className="flex justify-center">
                      <AuthButton />
                    </div>
                  </div>
                </div>
              )}


              {/* ACTIVE OPS MODE */}
              {positions.length > 0 ? (
                <div className="col-span-1 lg:col-span-3 animate-in fade-in zoom-in duration-500">
                  <ActiveOpsManager
                    position={positions[0]}
                    analysis={analysis}
                  />
                </div>
              ) : (
                /* DASHBOARD VIEW */
                <div className="col-span-1 lg:col-span-3 animate-in fade-in zoom-in duration-500 space-y-6">

                  {potionMode === 'RED' ? (
                    <div className="w-full animate-in fade-in zoom-in duration-700">
                      <RedPotionArena />
                    </div>
                  ) : (
                    <>
                      {/* 1. The Brain: Intelligence Board (Top) */}
                      <div className="w-full flex flex-col items-center gap-6 mb-8">
                        <div className="w-full">
                          <TodayPlaybook
                            structuralAnalysis={{
                              currentStructure: "박스 상단 저항 근접",
                              volatility: "수축 → 확장 대기"
                            }}
                            timeframeBriefing={{
                              fourHour: "상승 구조 유지 (Bullish MS)",
                              oneHour: "다이버전스 발생 (Bearish Div)",
                              fifteenMin: "과열 구간 (주의)"
                            }}
                            finalInstruction="눌림 매수만 허용 (추격 매수 금지)"
                          />
                        </div>
                        <MarketStatusTags structure="Higher Low 형성 중" volatility="수축 (안정)" overheating="단기 쿨다운" />
                      </div>

                      {/* 2. Tactical Scenarios & Auto Journal (Bottom Split) */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Scenarios & Calc */}
                        <div className="col-span-1 lg:col-span-1 flex flex-col items-center">
                          <div className="w-full relative">
                            <ShieldCalculator />
                          </div>
                        </div>

                        {/* Right Column - Auto Journal & Logs */}
                        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
                          <div className="flex justify-end">
                            <UniversalJournalModal>
                              <Button variant="outline" className="text-zinc-400 border-zinc-500 hover:text-white hover:bg-zinc-800 h-10 px-4 text-sm font-bold w-full md:w-auto mt-2 shadow-lg shadow-indigo-500/10">
                                <FilePlus className="w-4 h-4 mr-2 text-indigo-400" />
                                HP1 유니버설 매매 복기 시스템 (팩트 폭행 리포트)
                              </Button>
                            </UniversalJournalModal>
                          </div>
                          <AnalysisLog logs={[
                            "단기 추세: <span class='text-emerald-400'>상승 우위 (Higher High)</span>",
                            "유동성 위치: <span class='text-amber-400'>상단 집중 (숏 스퀴즈 유의)</span>",
                            "펀딩비: 중립 균형 상태 유지 중",
                            "종합: <span class='text-emerald-400'>단기 함정 가능성 낮음. 매수 우위 지속.</span>"
                          ]} />
                        </div>
                      </div>

                      {/* 3. The Gym: HP1 Performance Lab (Bottom) */}
                      <PerformanceLab />
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
          {/* ... Footer ... */}
          <footer className="w-full border-t border-zinc-900 bg-zinc-950 p-2 text-center text-[10px] text-zinc-600">
            <p>
              DISCLAIMER: This service is not investment advice. Using this tool does not guarantee profits. All trading involves risk.
            </p>

            {user && (
              <div className="mt-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded flex flex-col items-center gap-1 text-[10px] text-zinc-400 font-mono mb-8">
                <div className="flex gap-4">
                  <span>User: {user.email}</span>
                  <span className={user.uid ? "text-indigo-400" : "text-red-500"}>
                    UID: {user.uid.slice(0, 5)}...{user.uid.slice(-5)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className={positions.length > 0 ? "text-green-400" : "text-zinc-500"}>
                    Active Pos: {positions.length}
                  </span>
                  <span className={syncStatus.includes('✅') ? 'text-green-500' : 'text-amber-500'}>
                    Status: {syncStatus}
                  </span>
                </div>
              </div>
            )}

            {/* v5.0 Manifesto (Fixed Footer) */}
            <div className="mt-12 mb-6 border-t border-zinc-800/50 pt-8 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-500">
              <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-600 uppercase">The HP1 Manifesto</p>
              <p className="text-xs text-zinc-500 mt-2 text-center leading-relaxed">
                "HP1 is not built to make you rich overnight. <br />
                It is built to ensure you survive long enough to become rich."
              </p>
            </div>

            <div className="flex justify-center pb-8">
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs underline hover:text-indigo-400 text-zinc-700"
              >
                Force Reload (v5.0.0)
              </button>
            </div>
          </footer>
        </RiskGuard>
      </div>
    </div>
  );
}
