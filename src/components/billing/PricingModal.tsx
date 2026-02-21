'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useState } from 'react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerReason?: string;
}

export function PricingModal({ isOpen, onClose, triggerReason }: PricingModalProps) {
    const { user } = useAuthStore();
    const { t } = useLanguageStore();
    const [selectedPlan, setSelectedPlan] = useState<'partner' | 'inner'>('partner');

    const handleUpgrade = (plan: string) => {
        // Mock Payment Flow
        window.open('https://buy.stripe.com/test_mock_payment_link', '_blank');
        // In real app, we would redirect to a Checkout Session
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-indigo-900 sm:max-w-4xl p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">

                    {/* Free Plan */}
                    <div className="p-6 flex flex-col border-r border-zinc-900 bg-zinc-950/50">
                        <div className="mb-4">
                            <h3 className="text-zinc-400 font-semibold mb-1">{t('billing.observer_title') || 'Observer'}</h3>
                            <div className="text-2xl font-bold text-white">$0 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-sm text-zinc-400"><Check className="w-4 h-4 mr-2 text-zinc-600" /> {t('billing.observer_desc_1')}</li>
                            <li className="flex items-center text-sm text-zinc-400"><Check className="w-4 h-4 mr-2 text-zinc-600" /> {t('billing.observer_desc_2')}</li>
                            <li className="flex items-center text-sm text-zinc-400 opacity-50"><Check className="w-4 h-4 mr-2 text-zinc-800" /> {t('billing.observer_desc_3')}</li>
                        </ul>
                        <Button variant="ghost" className="w-full text-zinc-500" disabled>{t('billing.current_plan')}</Button>
                    </div>

                    {/* Partner Plan (Recommended) -> Pro ($49) */}
                    <div className="p-6 flex flex-col relative bg-zinc-900 border-x border-indigo-500/30 ring-1 ring-inset ring-indigo-500/20 z-10 transform scale-105 shadow-2xl">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-coral-500" />
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-coral-500 text-white font-bold border-none px-4 animate-pulse">
                                {t('billing.popular')}
                            </Badge>
                        </div>
                        <div className="mb-4 mt-4">
                            <h3 className="text-coral-400 font-bold mb-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 fill-current" /> {t('billing.pro_title')}
                            </h3>
                            <div className="text-4xl font-black text-white">$49 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
                            <p className="text-xs text-zinc-400 mt-1">{t('billing.pro_desc')}</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> <strong>{t('billing.feature_1')}</strong></li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> {t('billing.feature_2')}</li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> {t('billing.feature_3')}</li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> {t('billing.feature_4')}</li>
                        </ul>
                        <Button
                            className="w-full bg-gradient-to-r from-indigo-600 to-coral-600 hover:from-indigo-500 hover:to-coral-500 text-white font-bold h-12 shadow-lg shadow-indigo-500/20 group relative overflow-hidden"
                            onClick={() => handleUpgrade('partner')}
                        >
                            <span className="relative z-10">{t('billing.start_trial')}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>
                        <p className="text-[10px] text-center text-zinc-500 mt-3">{t('billing.cancel_anytime')}</p>
                    </div>

                    {/* Inner Circle -> $999 */}
                    <div className="p-6 flex flex-col border-l border-zinc-900 bg-zinc-950/50">
                        <div className="mb-4">
                            <h3 className="text-amber-400 font-semibold mb-1 flex items-center gap-2">
                                <Star className="w-4 h-4 fill-current" /> {t('billing.inner_title')}
                            </h3>
                            <div className="text-2xl font-bold text-white">$999 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-amber-500" /> {t('billing.inner_feature_1')}</li>
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-amber-500" /> {t('billing.inner_feature_2')}</li>
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-amber-500" /> {t('billing.inner_feature_3')}</li>
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-amber-500" /> {t('billing.inner_feature_4')}</li>
                        </ul>
                        <Button variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900 text-zinc-300" onClick={() => handleUpgrade('inner')}>{t('billing.join_waitlist')}</Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
