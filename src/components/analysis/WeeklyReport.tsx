'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, PiggyBank } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';

export const WeeklyReport = () => {
    const { resistedImpulses, tradeHistory } = useTradingStore();
    const { t } = useLanguageStore();

    // 1. Calculate Money Saved (from Resisted Impulses)
    const resistedCount = resistedImpulses.length;
    const totalSaved = resistedImpulses.reduce((sum, impulse) => sum + impulse.amountSaved, 0);

    // 2. Calculate "Avoided Losses" (Hypothetical: 2% risk per avoided trade)
    // If amountSaved wasn't explicit, we could estimate: count * (avg_risk)
    // But since we track amountSaved directly in store (as risk size), we use that.

    // 3. AI Compliance (Simple metric for now)
    // Count 'GOOD_LOSS' and 'NORMAL_WIN' vs 'BAD_WIN' and 'NORMAL_LOSS' with mistakes
    const complianceTrades = tradeHistory.filter(t => t.auditResult === 'GOOD_LOSS' || (t.auditResult === 'NORMAL_WIN' && !t.mistake));
    const complianceRate = tradeHistory.length > 0
        ? Math.round((complianceTrades.length / tradeHistory.length) * 100)
        : 100;

    return (
        <Card className="w-full bg-indigo-950/20 border-indigo-900/50 text-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('metrics.weekly_title')}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Money Saved Highlight */}
                <div className="bg-indigo-900/40 p-4 rounded-lg border border-indigo-800/50 flex items-center justify-between">
                    <div>
                        <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider mb-1">
                            {t('metrics.money_saved')}
                        </p>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            ${totalSaved.toLocaleString()}
                            <span className="text-[10px] text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-800">
                                +{resistedCount * 3} XP
                            </span>
                        </div>
                    </div>
                    <PiggyBank className="h-8 w-8 text-indigo-400 opacity-80" />
                </div>

                {/* Text Summary */}
                <div className="text-xs text-indigo-200/80 leading-relaxed px-1">
                    {t('metrics.saved_msg')
                        .replace('{count}', resistedCount.toString())
                        .replace('{amount}', totalSaved.toLocaleString())}
                </div>

                {/* Compliance Stats (Mini) */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-center">
                        <div className="text-[10px] text-zinc-500">{t('metrics.resisted')}</div>
                        <div className="text-lg font-bold text-zinc-300">{resistedCount} {t('metrics.times')}</div>
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800 text-center">
                        <div className="text-[10px] text-zinc-500">{t('metrics.compliance')}</div>
                        <div className={`text-lg font-bold ${complianceRate >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {complianceRate}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
