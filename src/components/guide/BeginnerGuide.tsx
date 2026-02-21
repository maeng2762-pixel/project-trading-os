'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/useLanguageStore';
import { BookOpen, ChevronRight, Check, Shield, Gamepad2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BeginnerGuide = () => {
    const { t } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    // Check localStorage on mount
    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('kelly_has_seen_guide_v1');
        if (!hasSeenGuide) {
            // Small delay to not overwhelm user immediately
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpen = () => {
        setStep(0);
        setIsOpen(true);
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('kelly_has_seen_guide_v1', 'true');
    };

    const steps = [
        {
            icon: <Shield className="w-16 h-16 text-indigo-400" />,
            title: t('guide.step1_title'),
            desc: t('guide.step1_desc'),
            color: "from-indigo-500/20 to-blue-500/20"
        },
        {
            icon: <div className="flex gap-4">
                <Gamepad2 className="w-12 h-12 text-emerald-400" />
                <div className="w-px h-12 bg-zinc-700" />
                <Shield className="w-12 h-12 text-indigo-400" />
            </div>,
            title: t('guide.step2_title'),
            desc: t('guide.step2_desc'),
            color: "from-emerald-500/20 to-indigo-500/20"
        },
        {
            icon: <div className="relative">
                <Shield className="w-16 h-16 text-red-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">❄️</span>
                </div>
            </div>,
            title: t('guide.step_shield_title'),
            desc: t('guide.step_shield_desc'),
            color: "from-red-500/20 to-rose-500/20"
        },
        {
            icon: <div className="flex flex-col items-center gap-2">
                <div className="text-4xl">🧠</div>
                <div className="flex gap-1">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded border border-indigo-500/50">S</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/50">A</span>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded border border-zinc-700">F</span>
                </div>
            </div>,
            title: t('guide.step_brain_title'),
            desc: t('guide.step_brain_desc'),
            color: "from-purple-500/20 to-violet-500/20"
        },
        {
            icon: <TrendingUp className="w-16 h-16 text-amber-400" />,
            title: t('guide.step3_title'),
            desc: t('guide.step3_desc'),
            color: "from-amber-500/20 to-orange-500/20"
        },
        {
            icon: <Check className="w-16 h-16 text-green-400" />,
            title: t('guide.step4_title'),
            desc: t('guide.step4_desc'),
            color: "from-green-500/20 to-emerald-500/20"
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    return (
        <>
            {/* Trigger Button (To be placed in Header) */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleOpen}
                className="text-zinc-400 hover:text-white"
                title={t('guide.btn_label')}
            >
                <BookOpen className="w-5 h-5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md p-0 overflow-hidden">
                    <div className={`h-2 w-full bg-gradient-to-r ${currentStep.color} absolute top-0 left-0`} />

                    <div className="p-8 flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="p-6 rounded-full bg-zinc-900/50 border border-zinc-800 shadow-2xl">
                                    {currentStep.icon}
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                        {currentStep.title}
                                    </h2>
                                    <p className="text-zinc-400 leading-relaxed text-sm">
                                        {currentStep.desc}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex gap-1 mt-8 mb-8">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-zinc-800'}`}
                                />
                            ))}
                        </div>

                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-lg shadow-indigo-500/20"
                            onClick={isLastStep ? handleClose : handleNext}
                        >
                            {isLastStep ? t('guide.start_btn') : (
                                <span className="flex items-center gap-2">
                                    {t('guide.next_btn')} <ChevronRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
