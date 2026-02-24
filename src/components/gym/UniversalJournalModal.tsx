'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, FileUp, Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { PricingModal } from '@/components/billing/PricingModal';

interface UniversalJournalModalProps {
    children: React.ReactNode;
}

export const UniversalJournalModal = ({ children }: UniversalJournalModalProps) => {
    const { tier } = useTradingStore();
    const isPro = tier === 'PRO';
    const [isOpen, setIsOpen] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleSimulatedUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            // Simulate extracting data
        }, 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Freemium Funnel: If not PRO, show upsell modal instead of just saving.
        if (!isPro) {
            setIsOpen(false);
            setShowUpsell(true);
            return;
        }

        // Normally save trade here
        alert('매매 일지가 안전하게 기록되었습니다.');
        setIsOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-indigo-400" />
                            매매 복기 일지 작성
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            거래소 API 연결 없이도 매매 내역을 수동으로 기록하거나 수익률 이미지를 업로드하여 분석받을 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        {/* Auto OCR Upload Mock */}
                        <div className="p-4 border border-dashed border-zinc-700/50 rounded-lg bg-zinc-900/30 text-center space-y-3 cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={handleSimulatedUpload}>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
                                <Camera className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-zinc-300">수익률 이미지 AI 스캔</h4>
                                <p className="text-xs text-zinc-500 mt-1">포지션 종료 화면을 캡처해서 올리면 HP1이 진입가, 수익률을 자동 추출합니다.</p>
                            </div>
                            {isUploading && (
                                <div className="text-xs text-emerald-400 animate-pulse flex items-center justify-center gap-1 mt-2">
                                    <Sparkles className="w-3 h-3" /> AI가 이미지를 분석 중입니다...
                                </div>
                            )}
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-medium uppercase tracking-wider">OR MANUAL ENTRY</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                        </div>

                        {/* Manual entry form */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="side" className="text-xs text-zinc-400">포지션</Label>
                                    <Select defaultValue="long">
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 text-sm">
                                            <SelectValue placeholder="방향" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="long" className="text-emerald-400">Long (매수)</SelectItem>
                                            <SelectItem value="short" className="text-rose-400">Short (매도)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="result" className="text-xs text-zinc-400">손익 결과</Label>
                                    <Select defaultValue="win">
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 text-sm">
                                            <SelectValue placeholder="결과" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="win" className="text-emerald-400">수익 (Take Profit)</SelectItem>
                                            <SelectItem value="loss" className="text-rose-400">손실 (Stop Loss)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pnl" className="text-xs text-zinc-400">실현 손익 (USDT)</Label>
                                <Input id="pnl" type="number" placeholder="예: 150" className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 text-sm placeholder:text-zinc-600" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emotion" className="text-xs text-zinc-400">당시 주요 감정 상태 (가장 중요)</Label>
                                <Select defaultValue="fomo">
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500 text-sm">
                                        <SelectValue placeholder="감정 태그" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="fomo">FOMO (급하게 따라 탐)</SelectItem>
                                        <SelectItem value="bored">대기/지루함 (참지 못하고 진입)</SelectItem>
                                        <SelectItem value="rules">원칙 준수 (계획대로 진입)</SelectItem>
                                        <SelectItem value="revenge">뇌동/복수 매매 (손실 복구 심리)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            기록 저장 및 분석
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Freemium Upsell Trigger Dialog */}
            <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
                <DialogContent className="bg-zinc-950 border-rose-500/50 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-400 text-lg">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            HP1 팩트 폭행 리포트
                        </DialogTitle>
                        <DialogDescription className="text-zinc-300 mt-3 leading-relaxed text-sm bg-rose-950/30 p-4 rounded-lg border border-rose-500/20">
                            <strong>[치명적 위험 감지]</strong><br />
                            방금 제출하신 매매의 손익비는 1:0.8 수준입니다. <br className="mb-2" />
                            손절은 늦고 익절은 빠른 전형적인 <strong>'계좌가 서서히 녹아내리는(Bleeding)'</strong> 패턴입니다. <br className="mb-2" />
                            이 방식이 10번 반복되면 시드의 40%가 확정적으로 증발합니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mt-2">
                        <p className="text-sm text-zinc-400 mb-2">
                            감으로 하는 매매는 통계의 먹잇감이 될 뿐입니다. <br />
                            <strong className="text-indigo-400">HP1 Performance Lab</strong>에서 당신의 치명적 습관을 시각화하고 교정하세요.
                        </p>
                        <ul className="text-xs text-zinc-500 space-y-1.5 mt-3 list-disc list-inside">
                            <li>나의 실제 평균 손익비(RR) 객관적 추적</li>
                            <li>손절 지연으로 파생된 누수 금액 계산</li>
                            <li>특정 감정(FOMO 등) 발현 시 승률 데이터화</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => setShowUpsell(false)}>
                            무시하기
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold border-none" onClick={() => setShowPricing(true)}>
                            Pro 훈련소 열기
                        </Button>
                        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} triggerReason="HP1 Performance Lab" />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
