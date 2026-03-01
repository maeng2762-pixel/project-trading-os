import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, ShieldCheck, Power, AlertTriangle, AlertCircle, Activity, Lock, Database } from 'lucide-react';
import { AutoPilotConsentModal } from './AutoPilotConsentModal';
import { ApiKeyForm } from './ApiKeyForm';
import { Button } from '@/components/ui/button';

import { useTradingStore } from '@/store/useTradingStore';

export const AutoPilotDashboard = () => {
    const { t } = useLanguageStore();
    const { user } = useAuthStore();
    const { apiConnected, setApiConnected, tier } = useTradingStore();
    const [isConsentOpen, setIsConsentOpen] = useState(false);
    const [hasConsented, setHasConsented] = useState(apiConnected); // Persist consent if already connected
    const [hasApiKey, setHasApiKey] = useState(apiConnected);
    const [isAutoPilotActive, setIsAutoPilotActive] = useState(apiConnected);
    const [showPanicAlert, setShowPanicAlert] = useState(false);

    // Mock Status for Dashboard
    const emotionBlocks = 18;
    const mddDistance = 3.2; // %
    const timeCapStatus = '14 Days Max'; // Time Cap limit

    // TODO: Load actual DB states

    const handleConsentAgree = () => {
        setHasConsented(true);
        setIsConsentOpen(false);
        // TODO: Save consent state to DB
    };

    const handleSaveApiKey = async (key: string, secret: string) => {
        if (!user) return;
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/binance/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ apiKey: key, apiSecret: secret }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setHasApiKey(true);
                setApiConnected(true);
                setIsAutoPilotActive(true);
            } else {
                throw new Error(data.error || 'Failed to connect API Keys');
            }
        } catch (error: any) {
            console.error("API 연동 에러:", error);
            throw new Error(error.message || '네트워크 오류가 발생했습니다.');
        }
    };

    const handlePanicSwitch = async () => {
        if (confirm("🚨 경고! 모든 포지션을 비상 종료하고 현물 오토파일럿을 즉시 정지하시겠습니까? (Panic Switch)")) {
            setIsAutoPilotActive(false);
            setHasApiKey(false);
            setApiConnected(false);
            setHasConsented(false);

            // Wipe keys from backend
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    await fetch('/api/binance/keys', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    });
                } catch (e) {
                    console.error("Failed to wipe API Keys from backend:", e);
                }
            }

            // Show full-screen panic alert modal
            setShowPanicAlert(true);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <AutoPilotConsentModal
                isOpen={isConsentOpen}
                onClose={() => setIsConsentOpen(false)}
                onAgree={handleConsentAgree}
            />

            {/* Panic Switch Full-Screen Alert */}
            {showPanicAlert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.3)]">
                        <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-3xl font-black text-white px-2">시스템 강제 종료됨</h2>
                        <p className="text-red-200 mt-4 text-lg">
                            패닉 스위치가 가동되었습니다.<br />
                            자동매매가 즉시 중단되고 전액 현금(USDT) 보존 상태로 전환되었습니다.
                        </p>
                        <Button
                            onClick={() => setShowPanicAlert(false)}
                            className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white h-12 text-lg font-bold"
                        >
                            확인
                        </Button>
                    </div>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e3a8a]/50 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                <div className="relative z-10 bg-transparent">
                    <h2 className="text-2xl font-bold flex flex-wrap items-center gap-2 md:gap-3">
                        <ShieldAlert className={`w-8 h-8 shrink-0 ${isAutoPilotActive ? 'text-sky-400' : 'text-zinc-500'}`} />
                        <span className="text-blue-100">Guarded AutoPilot 2.0 <span className="text-xs text-sky-400 font-mono align-top ml-1">(Spot)</span></span>
                        {isAutoPilotActive && (
                            <span className="px-3 py-1 text-xs font-bold bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30 flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                ACTIVE
                            </span>
                        )}
                    </h2>
                    <p className="text-sky-200/50 mt-2 text-sm">자본 통제망이 백그라운드에서 매집 구간과 안전을 감시합니다.</p>
                </div>

                {(!hasConsented || !hasApiKey) ? (
                    tier === 'PRO' ? (
                        <Button
                            id="autopilot-setup-btn"
                            onClick={() => setIsConsentOpen(true)}
                            className="w-full md:w-auto bg-[#1e3a8a]/20 hover:bg-[#1e3a8a]/40 text-sky-200 border border-[#1e3a8a]"
                        >
                            <Lock className="w-4 h-4 mr-2 shrink-0" />
                            <span className="truncate">Setup AutoPilot 2.0</span>
                        </Button>
                    ) : (
                        <Button
                            disabled
                            className="w-full md:w-auto bg-zinc-900 border border-sky-500/20 text-sky-500/50 cursor-not-allowed"
                        >
                            <Lock className="w-4 h-4 mr-2 shrink-0" />
                            <span className="truncate">Upgrade to Pro for AutoPilot 2.0</span>
                        </Button>
                    )
                ) : (
                    <Button
                        onClick={handlePanicSwitch}
                        variant="destructive"
                        className="w-full md:w-auto h-12 px-4 md:px-6 font-bold text-base md:text-lg bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all animate-pulse"
                    >
                        <Power className="w-5 h-5 mr-2 shrink-0" />
                        <span className="truncate">패닉 스위치 (모두 관망)</span>
                    </Button>
                )}
            </div>

            {hasConsented && !hasApiKey && (
                <div className="pt-4">
                    <ApiKeyForm onSave={handleSaveApiKey} onCancel={() => setHasConsented(false)} />
                </div>
            )}

            {/* Defensive Metrics Dashboard */}
            {hasApiKey && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Fakeout & Winter Blocks */}
                        <div className="bg-[#0b1121] border border-[#1e3a8a]/30 rounded-xl p-5 shadow-inner">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa]">Fakeout & Winter Blocks</p>
                                    <h3 className="text-4xl font-black mt-2 text-sky-400">{emotionBlocks}</h3>
                                </div>
                                <div className="p-2 bg-sky-500/10 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                                </div>
                            </div>
                            <p className="text-[10px] text-sky-200/50 mt-4 leading-relaxed">Saved you from Crypto Winter and Volume Fakeouts.</p>
                        </div>

                        {/* MDD Distance */}
                        <div className="bg-[#0b1121] border border-[#1e3a8a]/30 rounded-xl p-5 shadow-inner">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa]">{t('autopilot.mdd_distance')}</p>
                                    <h3 className="text-4xl font-black mt-2 text-emerald-400">{mddDistance}%</h3>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                            <div className="w-full bg-[#1e3a8a]/20 h-1.5 rounded-full mt-4 overflow-hidden border border-[#1e3a8a]/50">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                            </div>
                        </div>

                        {/* Time Cap Horizon */}
                        <div className="bg-[#0b1121] border border-[#1e3a8a]/30 rounded-xl p-5 shadow-inner flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#60a5fa]">Time Cap Horizon</p>
                                    <h3 className="text-2xl font-bold mt-2 text-indigo-300">{timeCapStatus}</h3>
                                </div>
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Database className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>
                            <div className="p-3 bg-[#020617] rounded-lg border border-[#1e3a8a]/50 mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                    <span className="text-[10px] text-sky-300 font-mono">Edge Expiration Monitor</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold">SAFE</span>
                            </div>
                        </div>

                        {/* Live Log Area (Mocked for UI) */}
                        <div className="bg-[#0b1121] border border-[#1e3a8a]/30 rounded-xl p-6 overflow-hidden relative cols-span-1 md:col-span-3 mt-4 shadow-inner">
                            <h3 className="text-xs font-bold text-[#60a5fa] mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <AlertCircle className="w-4 h-4" /> Live Spot Execution Log
                            </h3>
                            <div className="space-y-3 font-mono text-xs pb-6">
                                <div className="flex gap-4 text-zinc-500">
                                    <span className="shrink-0 text-sky-200/30">14:32:05</span>
                                    <span className="text-sky-400/70 font-bold w-20">[CHECK]</span>
                                    <span>Time-Cap Verification: No positions approaching 14-day limit.</span>
                                </div>
                                <div className="flex gap-4 text-zinc-500">
                                    <span className="shrink-0 text-sky-200/30">16:45:12</span>
                                    <span className="text-rose-400/70 font-bold w-20">[FAKEOUT]</span>
                                    <span>SMC Liquidity Sweep missing. HVN buy trigger aborted.</span>
                                </div>
                                <div className="flex gap-4 text-sky-200 bg-[#1e3a8a]/20 p-2 rounded -mx-2 px-2 border border-[#1e3a8a]/50">
                                    <span className="shrink-0">18:00:00</span>
                                    <span className="text-emerald-400 font-bold w-20">[SCANNING]</span>
                                    <span>LSTM: Bull Market Regime active. Scanning for 1D Volume Core.</span>
                                </div>
                            </div>
                            {/* Gradient Fade to hide older logs */}
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
                        </div>
                    </div>
                </>
            )}
        </div >
    );
};
