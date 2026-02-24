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

    const handleUpgrade = (plan: string) => {
        // Mock Payment Flow
        alert("현재 프로 버전 결제 시스템 연동 중입니다. (Stripe Checkout)");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-indigo-900 sm:max-w-3xl p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">

                    {/* Free Plan */}
                    <div className="p-6 flex flex-col border-r border-zinc-900 bg-zinc-950/50">
                        <div className="mb-4">
                            <h3 className="text-zinc-400 font-semibold mb-1">Free (기본 제공)</h3>
                            <div className="text-2xl font-bold text-white">$0 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-zinc-600" /> 수동 포지션 사이즈 계산기</li>
                            <li className="flex items-center text-sm text-zinc-300"><Check className="w-4 h-4 mr-2 text-zinc-600" /> 기본 시장 분석 및 방향성 추천</li>
                            <li className="flex items-center text-sm text-zinc-500 opacity-50"><Check className="w-4 h-4 mr-2 text-zinc-800" /> <span className="line-through">바이낸스 실시간 잔고 동기화</span></li>
                            <li className="flex items-center text-sm text-zinc-500 opacity-50"><Check className="w-4 h-4 mr-2 text-zinc-800" /> <span className="line-through">전술 복기 일지 & 인텔리전스 통계</span></li>
                            <li className="flex items-center text-sm text-zinc-500 opacity-50"><Check className="w-4 h-4 mr-2 text-zinc-800" /> <span className="line-through">안전벨트 (뇌동매매 방지 알림)</span></li>
                        </ul>
                        <Button variant="ghost" className="w-full text-zinc-500" disabled>현재 사용 중인 플랜</Button>
                    </div>

                    {/* PRO Plan */}
                    <div className="p-6 flex flex-col relative bg-zinc-900 border-x border-indigo-500/30 ring-1 ring-inset ring-indigo-500/20 z-10 transform scale-105 shadow-2xl">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-coral-500" />
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-coral-500 text-white font-bold border-none px-4 animate-pulse">
                                MUST HAVE
                            </Badge>
                        </div>
                        <div className="mb-4 mt-4">
                            <h3 className="text-coral-400 font-bold mb-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 fill-current" /> HP1 PRO
                            </h3>
                            <div className="text-4xl font-black text-white">$29 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
                            <p className="text-xs text-zinc-400 mt-1">강력한 멘탈 코칭과 완전 자동화</p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> <strong>바이낸스 API 실시간 잔고 동기화</strong></li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> <strong>과거 매매 기록 자동 조회 및 일지 작성</strong></li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> 완벽한 메타인지 생존 성적표 (MDD, R:R 계산)</li>
                            <li className="flex items-center text-sm text-white"><Check className="w-4 h-4 mr-2 text-coral-400" /> <strong>안전벨트 (손절 직후 뇌동매매 자동 차단 알림)</strong></li>
                        </ul>
                        <Button
                            className="w-full bg-gradient-to-r from-indigo-600 to-coral-600 hover:from-indigo-500 hover:to-coral-500 text-white font-bold h-12 shadow-lg shadow-indigo-500/20 group relative overflow-hidden"
                            onClick={() => handleUpgrade('PRO')}
                        >
                            <span className="relative z-10">PRO 버전 업그레이드</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>
                        <p className="text-[10px] text-center text-zinc-500 mt-3">언제든지 취소 가능합니다.</p>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
