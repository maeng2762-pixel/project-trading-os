'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, ShieldAlert, Target } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';

export const ImpactTracker = () => {
    const { tradeHistory, resistedImpulses } = useTradingStore();
    const { t } = useLanguageStore();

    // 1. Insight Compliance Rate
    // Measures how often user followed "Good" signals vs "Bad" entries
    // For MVP: We look at auditResult. 'NORMAL_WIN' & 'GOOD_LOSS' = Compliant. 'BAD_WIN' = Non-Compliant.
    const compliantTrades = tradeHistory.filter(t => t.auditResult !== 'BAD_WIN');
    const complianceRate = tradeHistory.length > 0
        ? Math.round((compliantTrades.length / tradeHistory.length) * 100)
        : 100;

    // 2. Stop-Loss Adherence
    // Measures 'GOOD_LOSS' (Adhered) vs 'NORMAL_LOSS' (Maybe adhered) vs 'BAD_WIN' (Likely ignored risk)
    // Strictly: GOOD_LOSS / (GOOD_LOSS + Bad Exits)
    const adheredLosses = tradeHistory.filter(t => t.auditResult === 'GOOD_LOSS');
    const allLosses = tradeHistory.filter(t => t.pnl < 0);
    const adherenceRate = allLosses.length > 0
        ? Math.round((adheredLosses.length / allLosses.length) * 100)
        : 100; // Default to 100 if no losses yet

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-500" />
                    {t('metrics.impact_title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Metric 1: Insight Compliance */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4" /> {t('metrics.compliance')}
                        </span>
                        <span className={`font-bold ${complianceRate >= 80 ? 'text-green-400' : 'text-yellow-500'}`}>
                            {complianceRate}%
                        </span>
                    </div>
                    <Progress value={complianceRate} className="h-2 bg-zinc-800" />
                    <p className="text-xs text-zinc-500">
                        {t('metrics.compliance_desc')}
                    </p>
                </div>

                {/* Metric 2: Stop-Loss Adherence */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> {t('metrics.sl_adherence')}
                        </span>
                        <span className={`font-bold ${adherenceRate >= 90 ? 'text-green-400' : 'text-red-500'}`}>
                            {adherenceRate}%
                        </span>
                    </div>
                    <Progress value={adherenceRate} className="h-2 bg-zinc-800" />
                    <p className="text-xs text-zinc-500">
                        {t('metrics.sl_desc')}
                    </p>
                </div>

                {/* Metric 3: The Vault (Money Saved) */}
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 text-sm flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-green-500" /> {t('metrics.money_saved')}
                        </span>
                        <span className="text-2xl font-black text-green-400 font-mono">
                            ${resistedImpulses.reduce((acc, curr) => acc + curr.amountSaved, 0).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                        {t('metrics.saved_msg')
                            .replace('{count}', resistedImpulses.length.toString())
                            .replace('{amount}', resistedImpulses.reduce((acc, curr) => acc + curr.amountSaved, 0).toLocaleString())
                        }
                    </p>
                </div>

            </CardContent>
        </Card>
    );
};
