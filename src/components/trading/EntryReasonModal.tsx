'use client';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCcw, Newspaper, BrainCircuit } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTradingStore } from '@/store/useTradingStore'; // Import
import { useState } from 'react';

export type EntryReason = 'Trend' | 'Reversal' | 'News' | 'Emotional';

interface EntryReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const EntryReasonModal = ({ isOpen, onClose, onConfirm, riskAmount }: EntryReasonModalProps & { riskAmount: number }) => {
    const { t } = useLanguageStore(); // Import
    const { recordImpulseResistance } = useTradingStore();
    const [reason, setReason] = useState<EntryReason | null>(null);

    const handleConfirm = () => {
        if (!reason) {
            alert(t('entry.required_reason'));
            return;
        }
        onConfirm(reason);
        setReason(null);
    };

    const handleCancel = () => {
        // Did user select 'Emotional' but then cancelled? That's a win!
        if (reason === 'Emotional') {
            recordImpulseResistance(riskAmount);
            alert(`🚫 ${t('metrics.resisted')} +3 XP! ($${riskAmount} Saved)`);
        }
        onClose();
        setReason(null);
    };

    const reasons: { value: EntryReason; label: string; icon: string }[] = [
        { value: 'Trend', label: t('modal.reason_trend'), icon: '📈' },
        { value: 'Reversal', label: t('modal.reason_reversal'), icon: '📉' },
        { value: 'News', label: t('modal.reason_news'), icon: '📰' },
        { value: 'Emotional', label: t('modal.reason_emotional'), icon: '🔥' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{t('modal.reason_title')}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {reasons.map((r) => (
                        <Button
                            type="button"
                            key={r.value}
                            variant={reason === r.value ? "default" : "outline"}
                            className={`h-24 flex flex-col gap-2 ${reason === r.value ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-950 border-zinc-700 hover:bg-zinc-800'}`}
                            onClick={() => setReason(r.value)}
                        >
                            <span className="text-2xl">{r.icon}</span>
                            <span className="text-xs">{r.label}</span>
                        </Button>
                    ))}
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={handleCancel} className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                        {t('common.cancel')}
                    </Button>
                    <Button type="button" onClick={handleConfirm} disabled={!reason} className="bg-green-600 hover:bg-green-700 ml-auto">
                        {t('entry.execute')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
