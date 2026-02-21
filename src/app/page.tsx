'use client';
import { RiskGuard } from '@/components/shield/RiskGuard';
import { BeginnerGuide } from '@/components/guide/BeginnerGuide';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuthStore } from '@/store/useAuthStore';
import { TradeEntryCard } from '@/components/trading/TradeEntryCard';
import { PositionList } from '@/components/trading/PositionList';
import { SignalCard } from '@/components/analysis/SignalCard';
import { PostMortemModal } from '@/components/trading/PostMortemModal';
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
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { useEffect, useState } from 'react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationService } from '@/lib/notification';
import { Bell, BellOff } from 'lucide-react';
import { TrustBadge } from '@/components/dashboard/TrustBadge';
import { RuinGuard } from '@/components/analysis/RuinGuard'; // Optimized for later
import { AutoPilotDashboard } from '@/components/autopilot/AutoPilotDashboard';
import { Button } from '@/components/ui/button';

export default function Home() {
  // @ts-ignore - syncStatus added in store but interface update might be delayed in IDE
  const { balance, liveBalance, apiConnected, setBalance, dailyPnl, dailyStartBalance, disciplineScore, positions, syncStatus, tier } = useTradingStore();
  const { user, loading } = useAuthStore() as unknown as { user: any, loading: boolean };
  const { t } = useLanguageStore();
  const { isEnabled, toggleNotifications, lastNotification, setLastNotification } = useNotificationStore(); // Notification Store
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [mounted, setMounted] = useState(false);

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

    // Polling Analysis every 1 minute
    const interval = setInterval(runSentinel, 60000);
    return () => clearInterval(interval);

  }, []);

  // Live Balance Fetching
  useEffect(() => {
    if (!user || !apiConnected) return;

    const fetchBalance = async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/binance/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ uid: user.uid }),
        });
        const data = await res.json();
        if (res.ok && data.success && typeof data.liveBalance === 'number') {
          setBalance(data.liveBalance);
        } else if (res.status === 404 || res.status === 401) {
          // If API keys are invalid or deleted
          useTradingStore.getState().setApiConnected(false);
        }
      } catch (err) {
        console.error("Failed to fetch live balance:", err);
      }
    };

    fetchBalance();
    const balanceInterval = setInterval(fetchBalance, 60000); // every 1 min
    return () => clearInterval(balanceInterval);
  }, [user, apiConnected, setBalance]);

  // ... (Admin code same) ...

  if (!mounted) return null;

  const pnlPercent = ((dailyPnl / dailyStartBalance) * 100).toFixed(2);
  const isProfit = dailyPnl >= 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans">
      <RiskGuard>
        <PostMortemModal />
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto">

            {/* Top Row: Brand & Status */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold tracking-tighter bg-gradient-to-r from-indigo-400 to-coral-400 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-xl">🛡️</span> Kelly <span className="text-[10px] text-indigo-300 font-mono opacity-70">v9.0</span>
              </h1>

              {/* Behavior Metrics (Primacy Effect) */}
              <div className="flex items-center gap-4">
                {/* Mental Score */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-zinc-500 tracking-wider">{t('header.mental')}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🔥</span>
                    <span className="text-lg font-black text-white">85</span>
                  </div>
                </div>

                {/* Discipline Score */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase text-zinc-500 tracking-wider font-bold text-amber-500/80">{t('header.discipline')}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">🛡️</span>
                    <span className="text-lg font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                      {disciplineScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Controls & Money (Secondary) */}
            <div className="flex items-center justify-between">

              {/* Balance (Demoted) */}
              <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-zinc-600">TOTAL EQUITY</span>
                  <span className="font-mono text-xs text-zinc-400">${apiConnected ? liveBalance.toFixed(2) : balance.toFixed(0)}</span>
                </div>
                <div className="h-4 w-[1px] bg-zinc-800"></div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-zinc-600">{t('header.today')}</span>
                  <span className={`text-xs font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyPnl >= 0 ? '+' : ''}{pnlPercent}%
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {user && !apiConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 sm:px-3 text-[10px] border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 shrink-0"
                    onClick={() => {
                      document.getElementById('autopilot-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    🚀 <span className="hidden sm:inline ml-1">Binance API </span>연결
                  </Button>
                )}

                <div className="scale-90 sm:scale-100 flex items-center gap-1.5 sm:gap-3 origin-right">
                  <BeginnerGuide />
                  <ModeToggle />
                  {/* Notification */}
                  <button
                    onClick={toggleNotifications}
                    title={isEnabled ? "알림 끄기" : "알림 켜기"}
                    className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${isEnabled
                      ? 'text-indigo-400 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                      : 'text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    {isEnabled ? <Bell size={16} /> : <BellOff size={16} />}
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

          {/* AutoPilot Dashboard / API Connection Section */}
          {user && (tier === 'inner_circle' || !apiConnected) && (
            <div className="mt-8 mb-8" id="autopilot-section">
              <AutoPilotDashboard />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative min-h-[80vh]">
            {/* ... Observer Overlay ... */}
            {!user && !loading && (
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

            {/* API Connection Lock (Onboarding Funnel) */}
            {user && !apiConnected && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-zinc-950/60 flex flex-col items-center justify-start pt-[20vh] text-center">
                <div className="p-8 rounded-2xl bg-zinc-900/90 border border-amber-500/50 shadow-2xl max-w-md mx-4 animate-in fade-in zoom-in duration-500">
                  <span className="text-4xl mb-4 block">🔒</span>
                  <h2 className="text-2xl font-bold text-white mb-2">실계좌 연동 필요</h2>
                  <p className="text-zinc-300 mb-6 leading-relaxed text-sm">
                    Kelly의 분석은 당신의 실제 자산 규모와 변동성에 맞춰 계산됩니다. 바이낸스 API를 연결하여 당신만의 생존 공식을 확인하세요.
                  </p>
                  <div className="flex justify-center">
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                      onClick={() => {
                        const section = document.getElementById('autopilot-section');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => {
                          document.getElementById('autopilot-setup-btn')?.click();
                        }, 200);
                      }}
                    >
                      🚀 API 연결하기
                    </Button>
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
              /* ... Dashboard View ... */
              <>
                <div className={`space-y-4 ${(!user || !apiConnected) ? 'blur-sm select-none' : ''}`}>
                  <SignalCard analysis={analysis} />
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">{t('dashboard.command_center')}</h2>
                  <TradeEntryCard analysis={analysis} />
                  <PositionList />
                </div>

                <div className="space-y-4">
                  <Tabs defaultValue="metrics" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="metrics">{t('dashboard.metrics')}</TabsTrigger>
                      <TabsTrigger value="social">{t('dashboard.social')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="metrics" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImpactTracker />
                        <WeeklyReport />
                      </div>
                    </TabsContent>
                    <TabsContent value="social" className="space-y-4 mt-4">
                      <Leaderboard />
                    </TabsContent>
                  </Tabs>
                </div>
              </>
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
          <div className="py-8 text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity duration-700 border-t border-zinc-900/50 mt-4 pt-8">
            <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-600 uppercase">The Kelly Manifesto</p>
            <p className="text-xs font-serif italic text-zinc-400 max-w-md mx-auto leading-relaxed">
              "Kelly is not built to make you rich overnight. <br />
              It is built to keep you in the game."
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
    </main >
  );
}
