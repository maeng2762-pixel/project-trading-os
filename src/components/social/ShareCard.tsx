'use client';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import QRCode from 'react-qr-code';
import { Trophy, ShieldCheck, Flame } from 'lucide-react';

interface ShareCardProps {
    type: 'IMPULSE' | 'SCORE' | 'WEEKLY';
    data?: {
        savedAmount?: number;
        impulseCount?: number;
        score?: number;
        streak?: number;
    };
    elementId?: string;
}

export const ShareCard = ({ type, data, elementId = 'share-card' }: ShareCardProps) => {
    const { t } = useLanguageStore();
    const { disciplineScore, dailyStreak, resistedImpulses } = useTradingStore();

    // Default data if not provided
    const score = data?.score ?? disciplineScore;
    const streak = data?.streak ?? dailyStreak;
    const saved = data?.savedAmount ?? resistedImpulses.reduce((acc, curr) => acc + curr.amountSaved, 0);
    const count = data?.impulseCount ?? resistedImpulses.length;

    return (
        <div
            id={elementId}
            className="w-[400px] h-[600px] bg-zinc-950 relative overflow-hidden flex flex-col items-center justify-between p-8 border-4 border-amber-500/50"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.15) 0%, rgba(9, 9, 11, 1) 70%)'
            }}
        >
            {/* Cyberpunk Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="text-center z-10 mt-4">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    ANTIGRAVITY <span className="text-amber-500">OS</span>
                </h2>
                <div className="w-16 h-1 bg-amber-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_#f59e0b]" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 z-10">

                {/* Dynamic Statistic based on Type */}
                {type === 'IMPULSE' && (
                    <div className="text-center space-y-2">
                        <ShieldCheck className="w-16 h-16 text-green-400 mx-auto drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                        <h3 className="text-zinc-400 text-sm uppercase tracking-widest">{t('share.impulse_title')}</h3>
                        <div className="text-5xl font-black text-white tabular-nums">
                            ${saved.toLocaleString()}
                        </div>
                        <p className="text-amber-400 text-lg font-bold">
                            {t('share.saved_msg').replace('{count}', count.toString())}
                        </p>
                    </div>
                )}

                {(type === 'SCORE' || type === 'WEEKLY') && (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" />
                            <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-amber-400">
                                Top 5%
                            </div>
                        </div>
                        <div>
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{t('share.score_title')}</h3>
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-amber-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
                                {score}
                            </div>
                        </div>
                    </div>
                )}

                {/* Secondary Stat */}
                <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                        <div className="text-left">
                            <div className="text-[10px] text-zinc-500 uppercase">{t('coliseum.streak')}</div>
                            <div className="text-xl font-bold text-white">{streak} {t('coliseum.streak_day')}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase">Risk Protocol</div>
                        <div className="text-xs font-mono text-green-400">ACTIVE</div>
                    </div>
                </div>

            </div>

            {/* Footer / QR */}
            <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-zinc-800/50 z-10">
                <div className="text-left">
                    <p className="text-[10px] text-zinc-500 mb-1">{t('share.join_us')}</p>
                    <p className="text-xs font-bold text-white">#DebtHero #TradingOS</p>
                </div>
                <div className="bg-white p-2 rounded-lg">
                    <QRCode value="https://antigravity-os.vercel.app" size={64} />
                </div>
            </div>
        </div>
    );
};
