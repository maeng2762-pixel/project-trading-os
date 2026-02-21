'use client';
import React, { useEffect, useState } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CooldownOverlay = () => {
    const { isLocked, lockReason, lockEndTime, unlock, isAdmin } = useTradingStore();
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!isLocked || !lockEndTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = lockEndTime - now;

            if (diff <= 0) {
                unlock();
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLocked, lockEndTime, unlock]);

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-full max-w-md border-red-500 bg-zinc-950 text-white shadow-2xl shadow-red-500/20">
                <CardHeader className="flex flex-col items-center gap-4 pb-2 text-center">
                    <div className="rounded-full bg-red-500/20 p-4 ring-2 ring-red-500/50">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-100">트레이딩 잠금 (Trading Locked)</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4 text-zinc-400">
                        자본 보호를 위해 쉴드가 가동되었습니다.<br />
                        (The shield has been activated to protect your capital.)
                    </p>

                    <div className="mb-6 rounded-lg bg-red-950/30 p-4 border border-red-900/50">
                        <p className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-1">원인 (Reason)</p>
                        <p className="text-lg font-medium text-white">{lockReason}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-zinc-500">남은 쿨다운 (Cooldown Remaining)</p>
                        <p className="text-3xl font-mono font-bold text-red-500 tabular-nums">
                            {timeLeft || 'Calculating...'}
                        </p>
                    </div>

                    <p className="mt-8 text-xs text-zinc-600">
                        "시장은 내일도 열립니다. 하지만 손실을 쫓다 보면 당신의 자본은 내일 없을지도 모릅니다."
                    </p>

                    {isAdmin && (
                        <div className="mt-6 border-t border-red-900/50 pt-4">
                            <p className="text-xs text-red-400 mb-2">관리자 권한으로 강제 해제 가능</p>
                            <Button
                                variant="destructive"
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={unlock}
                            >
                                🔓 관리자 권한으로 해제 (Force Unlock)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
