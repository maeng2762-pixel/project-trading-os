import { ShareModal } from './ShareModal';
import { Button } from '@/components/ui/button';
import { Share2, Trophy, Medal, Flame, Target } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';

interface TraderProfile {
    id: string;
    name: string;
    score: number;
    streak: number;
    isCurrentUser?: boolean;
}

export const Leaderboard = () => {
    const { disciplineScore, dailyStreak } = useTradingStore();
    const { t } = useLanguageStore();
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Mock Data for MVP (simulating other users)
    const mockTraders: TraderProfile[] = [
        { id: '1', name: '알파울프', score: 92, streak: 14 },
        { id: '2', name: '젠마스터', score: 88, streak: 45 },
        { id: '3', name: '강철손', score: 85, streak: 7 },
        { id: 'user', name: t('coliseum.you'), score: disciplineScore, streak: dailyStreak, isCurrentUser: true }, // Real Data
        { id: '4', name: '포모왕', score: 45, streak: 0 },
        { id: '5', name: '루키01', score: 62, streak: 2 },
    ];

    // Sort: Score Desc -> Streak Desc
    const sortedTraders = [...mockTraders].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.streak - a.streak;
    });

    const userRank = sortedTraders.findIndex(trader => trader.isCurrentUser) + 1;
    const traderAbove = userRank > 1 ? sortedTraders[userRank - 2] : null;

    return (
        <>
            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                type="SCORE"
                data={{ score: disciplineScore, streak: dailyStreak }}
            />

            <Card className="w-full border-zinc-800 bg-zinc-900 text-white h-full relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                <CardHeader className="pb-3 border-b border-zinc-800/50">
                    <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            {t('coliseum.title')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-zinc-800 text-zinc-500"
                                onClick={() => setIsShareOpen(true)}
                            >
                                <Share2 className="h-3 w-3" />
                            </Button>
                            <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
                                {t('coliseum.top_rank')}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Motivation Banner */}
                    {traderAbove && (
                        <div className="bg-indigo-900/20 border-b border-indigo-500/20 p-3 flex items-center gap-3 text-xs text-indigo-300">
                            <Target className="h-4 w-4 text-indigo-400 shrink-0 animate-pulse" />
                            <span>
                                {t('coliseum.overtake_msg').replace('{name}', traderAbove.name).replace('3', (traderAbove.score - disciplineScore + 1).toString())}
                            </span>
                        </div>
                    )}

                    {/* List */}
                    <div className="divide-y divide-zinc-800/50">
                        {sortedTraders.map((trader, index) => {
                            const rank = index + 1;
                            const isTop3 = rank <= 3;

                            return (
                                <div
                                    key={trader.id}
                                    className={`flex items-center justify-between p-3 ${trader.isCurrentUser ? 'bg-yellow-500/5 border-l-2 border-yellow-500' : 'hover:bg-zinc-800/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 text-center font-mono font-bold ${isTop3 ? 'text-yellow-500' : 'text-zinc-600'}`}>
                                            {rank}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${trader.isCurrentUser ? 'text-white' : 'text-zinc-400'}`}>
                                                {trader.name}
                                            </span>
                                            {trader.isCurrentUser && (
                                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('coliseum.streak')}: {trader.streak}{t('coliseum.streak_day')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Score */}
                                        <div className="text-right">
                                            <div className={`text-sm font-bold font-mono ${trader.score >= 80 ? 'text-green-400' : trader.score < 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {trader.score}
                                            </div>
                                        </div>

                                        {/* PnL Blur (Privacy) */}
                                        <div className="hidden sm:block w-16 h-4 bg-zinc-800/50 rounded blur-sm" title={t('coliseum.hidden')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
