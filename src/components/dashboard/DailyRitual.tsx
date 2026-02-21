'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles, Quote } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useState, useEffect } from 'react';

export const DailyRitual = () => {
    const { pledge, lastPledgeTime } = useTradingStore();
    const { t } = useLanguageStore();
    const [hasPledgedToday, setHasPledgedToday] = useState(false);
    const [quote, setQuote] = useState('');

    useEffect(() => {
        if (lastPledgeTime) {
            const now = Date.now();
            // If pledged within last 18 hours, consider it "done for today"
            if (now - lastPledgeTime < 18 * 60 * 60 * 1000) {
                setHasPledgedToday(true);
            } else {
                setHasPledgedToday(false);
            }
        }
    }, [lastPledgeTime]);

    const handlePledge = () => {
        pledge();
        setHasPledgedToday(true);
        // Show random quote immediately
        const randomQuote = t('ritual.quotes').split('|')[Math.floor(Math.random() * t('ritual.quotes').split('|').length)];
        setQuote(randomQuote);
    };

    if (hasPledgedToday) {
        return (
            <Card className="w-full bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-500/30 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-sm">
                            <ShieldCheck className="w-5 h-5" />
                            {t('ritual.active_title')}
                        </div>
                        <p className="text-lg text-emerald-100 italic font-medium max-w-2xl">
                            "{quote || t('ritual.default_quote')}"
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {t('ritual.bonus_applied')}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-gradient-to-r from-zinc-900 to-zinc-950 border-amber-500/30 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                        {t('ritual.title')}
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-lg">
                        {t('ritual.desc')}
                    </p>
                </div>

                <Button
                    size="lg"
                    onClick={handlePledge}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105"
                >
                    {t('ritual.btn_pledge')}
                </Button>
            </CardContent>
        </Card>
    );
};
