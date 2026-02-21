'use client';
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TradeFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        pnl: number;
        feedback: string;
        scoreChange: number;
    } | null;
}

export const TradeFeedbackModal = ({ isOpen, onClose, data }: TradeFeedbackModalProps) => {
    if (!data) return null;

    const isGood = data.scoreChange > 0;
    const isProfit = data.pnl >= 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader className="items-center text-center">
                    <div className={`p-3 rounded-full mb-2 ${isGood ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                        {isGood ? (
                            <Trophy className="h-8 w-8 text-yellow-500" />
                        ) : (
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">
                        {isGood ? 'Keep it up!' : 'Discipline Check'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4 text-center">
                    <div className="space-y-1">
                        <p className="text-sm text-zinc-400">Result</p>
                        <p className={`text-2xl font-mono font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                            {isProfit ? '+' : ''}{data.pnl.toFixed(2)} USDT
                        </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isGood ? 'bg-zinc-900 border-zinc-800' : 'bg-red-950/20 border-red-900/50'}`}>
                        <p className="font-medium text-lg mb-1">{data.feedback}</p>
                        <p className={`text-sm font-bold ${isGood ? 'text-yellow-500' : 'text-red-500'}`}>
                            {data.scoreChange > 0 ? '+' : ''}{data.scoreChange} XP
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                        Acknowledge
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
