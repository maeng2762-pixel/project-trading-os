'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore'; // Import
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

export const InsightPanel = () => {
    const { tradeHistory } = useTradingStore();
    const { t } = useLanguageStore(); // Import

    const insights = useMemo(() => {
        if (tradeHistory.length < 3) return [];

        const stats: Record<string, { count: number; wins: number; totalPnl: number }> = {};
        const timeStats: Record<string, { count: number; wins: number }> = {};

        tradeHistory.forEach(t => {
            // Emotion Stats
            if (t.emotion) {
                if (!stats[t.emotion]) stats[t.emotion] = { count: 0, wins: 0, totalPnl: 0 };
                stats[t.emotion].count++;
                if (t.pnl > 0) stats[t.emotion].wins++;
                stats[t.emotion].totalPnl += t.pnl;
            }

            // Time Stats (Simple "Late Night" check)
            const hour = new Date(t.timestamp).getHours();
            let timeKey = "Day";
            if (hour >= 0 && hour < 6) timeKey = "Late Night (0-6h)";
            else if (hour >= 6 && hour < 12) timeKey = "Morning (6-12h)";
            else if (hour >= 12 && hour < 18) timeKey = "Afternoon (12-18h)";
            else timeKey = "Evening (18-24h)";

            if (!timeStats[timeKey]) timeStats[timeKey] = { count: 0, wins: 0 };
            timeStats[timeKey].count++;
            if (t.pnl > 0) timeStats[timeKey].wins++;
        });

        const results: { type: 'danger' | 'warning'; text: string }[] = [];

        const getTranslatedTime = (key: string) => {
            if (key.includes("Late")) return t('insight.time_late');
            if (key.includes("Morning")) return t('insight.time_morning');
            if (key.includes("Afternoon")) return t('insight.time_afternoon');
            if (key.includes("Evening")) return t('insight.time_evening');
            return t('insight.default_time');
        };

        const getTranslatedEmotion = (key: string) => {
            // Map backend/store emotion keys to translation keys if needed. 
            // Assuming store keys match 'emotion.x' format or are simple strings.
            // Let's try to map simple English keys to our translation keys prefix.
            // Actually, the store saves 'Greed', 'Fear' etc. based on Modal selection?
            // Let's assume standard keys for now or pass raw if custom.
            // Quick Mapping:
            const map: Record<string, string> = {
                'Calm': t('emotion.calm'),
                'Greed': t('emotion.greed'),
                'Fear': t('emotion.fear'),
                'Anger': t('emotion.anger'),
                'Bored': t('emotion.bored')
            };
            return map[key] || key;
        };

        // Analyze Emotions
        Object.entries(stats).forEach(([emotion, data]) => {
            const winRate = (data.wins / data.count) * 100;
            if (data.count >= 2) { // Min sample
                const emotionLabel = getTranslatedEmotion(emotion);
                if (winRate < 40) {
                    results.push({
                        type: 'danger',
                        text: t('insight.warn_emotion_winrate')
                            .replace('{emotion}', emotionLabel)
                            .replace('{rate}', winRate.toFixed(0))
                    });
                } else if (data.totalPnl < 0) {
                    results.push({
                        type: 'warning',
                        text: t('insight.warn_emotion_cost')
                            .replace('{emotion}', emotionLabel)
                            .replace('{cost}', Math.abs(data.totalPnl).toFixed(0))
                    });
                }
            }
        });

        // Analyze Time
        Object.entries(timeStats).forEach(([time, data]) => {
            const winRate = (data.wins / data.count) * 100;
            if (data.count >= 3 && winRate < 35) {
                const timeLabel = getTranslatedTime(time);
                results.push({
                    type: 'danger',
                    text: t('insight.warn_time_winrate')
                        .replace('{time}', timeLabel)
                        .replace('{rate}', winRate.toFixed(0))
                });
            }
        });

        return results;
    }, [tradeHistory, t]);

    if (insights.length === 0) return null;

    return (
        <Card className="w-full border-zinc-800 bg-zinc-900/50 mt-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    {t('insight.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`p-3 rounded border text-sm flex items-start gap-3 ${insight.type === 'danger' ? 'bg-red-950/20 border-red-900/50 text-red-400' : 'bg-yellow-950/20 border-yellow-900/50 text-yellow-400'}`}>
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>{insight.text}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
