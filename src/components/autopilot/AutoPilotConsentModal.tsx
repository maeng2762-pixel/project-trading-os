import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/useLanguageStore';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface AutoPilotConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
}

export const AutoPilotConsentModal = ({ isOpen, onClose, onAgree }: AutoPilotConsentModalProps) => {
    const { t } = useLanguageStore();
    const [chk1, setChk1] = useState(false);
    const [chk2, setChk2] = useState(false);

    const isAgreed = chk1 && chk2;

    const handleConfirm = () => {
        if (isAgreed) {
            onAgree();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-950 border-red-900/50 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        {t('autopilot.consent_title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Legal Copy */}
                    <div className="space-y-3 p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-sm text-zinc-300 leading-relaxed">
                        <p>{t('autopilot.consent_p1')}</p>
                        <p>{t('autopilot.consent_p2')}</p>
                        <p className="font-semibold text-rose-300">{t('autopilot.consent_p3')}</p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-1">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={chk1}
                                    onChange={(e) => setChk1(e.target.checked)}
                                />
                                <div className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 peer-checked:bg-red-600 peer-checked:border-red-500 transition-colors flex items-center justify-center">
                                    {chk1 && <CheckIcon />}
                                </div>
                            </div>
                            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors select-none leading-tight">
                                {t('autopilot.consent_chk1')}
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-1">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={chk2}
                                    onChange={(e) => setChk2(e.target.checked)}
                                />
                                <div className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 peer-checked:bg-red-600 peer-checked:border-red-500 transition-colors flex items-center justify-center">
                                    {chk2 && <CheckIcon />}
                                </div>
                            </div>
                            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors select-none leading-tight">
                                {t('autopilot.consent_chk2')}
                            </span>
                        </label>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                        <Button
                            className={`w-full h-12 font-bold text-lg transition-all duration-300 ${isAgreed
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                            onClick={handleConfirm}
                            disabled={!isAgreed}
                        >
                            <ShieldCheck className="w-5 h-5 mr-2" />
                            {t('autopilot.consent_start')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CheckIcon = () => (
    <svg viewBox="0 0 14 10" fill="none" className="w-3 h-3 text-white">
        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
