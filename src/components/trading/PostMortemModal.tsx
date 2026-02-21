'use client';
import React, { useState } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const PostMortemModal = () => {
    const { isReviewPending, pendingReviewTradeId, submitReview, tradeHistory } = useTradingStore();
    const { t } = useLanguageStore();
    const [emotion, setEmotion] = useState<string>('calm');
    const [followedAI, setFollowedAI] = useState<string>('yes');
    const [mistake, setMistake] = useState<string>('no');

    if (!isReviewPending || !pendingReviewTradeId) return null;

    const trade = tradeHistory.find(t => t.id === pendingReviewTradeId);
    if (!trade) return null;

    const isWin = trade.pnl >= 0;

    const handleSubmit = () => {
        // Mistake Logic: User admits "Yes" to mistake OR "No" to following AI
        // If "Followed AI" = No, is it a mistake? Usually yes.
        // Let's pass 'mistake' boolean based on user input.
        const isMistake = mistake === 'yes' || followedAI === 'no';
        submitReview(pendingReviewTradeId, emotion, isMistake);
    };

    // One-Line Coach Logic
    const getCoachFeedback = () => {
        if (mistake === 'yes') return "원칙을 어긴 대가는 큽니다. 같은 실수를 반복하지 마십시오.";
        if (isWin) return "잘했습니다. 하지만 수익보다 중요한 것은 '과정'입니다.";
        return "확률 48% 구간에서의 진입은 장기적으로 불리한 도박이었습니다."; // Default generic as per prompt example
    };

    return (
        <Dialog open={isReviewPending} onOpenChange={() => { }}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Brain className="h-6 w-6 text-indigo-400" />
                        매매 복기 성적표 (The Mirror)
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        직후의 감정과 행동을 기록하십시오. 거짓은 허용되지 않습니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* 1. PnL Summary */}
                    <div className={`text-center p-4 rounded-lg bg-opacity-20 ${isWin ? 'bg-green-500' : 'bg-red-500'}`}>
                        <div className="text-2xl font-black font-mono">
                            {isWin ? '+' : ''}{trade.pnl.toFixed(2)} USDT
                        </div>
                        <div className="text-xs opacity-70 uppercase tracking-widest mt-1">
                            {isWin ? 'PROFIT SECURED' : 'LOSS REALIZED'}
                        </div>
                    </div>

                    {/* 2. AI Compliance */}
                    <div className="space-y-3">
                        <Label>✅ AI 조언을 따랐습니까?</Label>
                        <RadioGroup value={followedAI} onValueChange={setFollowedAI} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="fa-yes" className="border-green-500 text-green-500" />
                                <Label htmlFor="fa-yes">네 (Yes)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="fa-no" className="border-red-500 text-red-500" />
                                <Label htmlFor="fa-no">아니오 (No)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* 3. Rule Compliance */}
                    <div className="space-y-3">
                        <Label>🛑 손절/익절 원칙을 어겼습니까?</Label>
                        <RadioGroup value={mistake} onValueChange={setMistake} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="m-no" className="border-green-500 text-green-500" />
                                <Label htmlFor="m-no">아니오 (지켰음)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="m-yes" className="border-red-500 text-red-500" />
                                <Label htmlFor="m-yes">네 (어겼음)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* 4. Emotion */}
                    <div className="space-y-3">
                        <Label className="flex justify-between">
                            <span>🌡️ 당시 감정 상태</span>
                            <span className="text-zinc-400 capitalize">{t(`emotion.${emotion}` as any) || emotion}</span>
                        </Label>
                        <div className="flex gap-2 justify-center">
                            {['calm', 'greed', 'fear', 'anger', 'bored'].map((em) => (
                                <Button
                                    key={em}
                                    variant={emotion === em ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEmotion(em)}
                                    className={`text-xs ${emotion === em ? 'bg-indigo-600' : 'border-zinc-700 text-zinc-500'}`}
                                >
                                    {t(`emotion.${em}` as any)?.split('/')[0] || em}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* One-Line Coach */}
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800 flex items-start gap-2">
                        <Brain className="h-5 w-5 text-zinc-500 mt-1 shrink-0" />
                        <p className="text-sm text-zinc-300 italic">
                            "{getCoachFeedback()}"
                        </p>
                    </div>

                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500">
                        성적표 제출 (Submit Audit)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
