'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTradingStore } from '@/store/useTradingStore';

interface ProApiConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProApiConnectionModal({ isOpen, onClose }: ProApiConnectionModalProps) {
    const { user } = useAuthStore();
    const setApiConnected = useTradingStore((state) => state.setApiConnected);

    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!apiKey || !apiSecret) {
            setError('API Key와 Secret을 모두 입력해주세요.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            if (!user) throw new Error("로그인이 필요합니다.");
            const idToken = await user.getIdToken();

            const res = await fetch('/api/binance/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ apiKey, apiSecret })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setApiConnected(true);
                alert("✅ 바이낸스 API가 성공적으로 연결되었습니다!");
                onClose();
                window.location.reload(); // Refresh to load live balance
            } else {
                throw new Error(data.error || 'API 연결에 실패했습니다.');
            }
        } catch (err: any) {
            console.error("API 연동 에러:", err);
            setError(err.message || "네트워크 오류가 발생했습니다.");
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-indigo-900/50 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-400">
                        <KeyRound className="w-5 h-5" />
                        PRO API 동기화 설정
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 text-amber-200/90 text-sm">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                        <p>
                            HP1은 고객님의 자산을 보호하기 위해 <strong>&#39;읽기 전용(Read-Only)&#39;</strong> 권한만 허용된 API Key를 요구합니다. 바이낸스 API 발급 시 &#39;Enable Trading&#39; 체크를 반드시 <strong>해제</strong>해주세요.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-400">API Key</label>
                            <Input
                                type="text"
                                placeholder="Binance API Key 입력"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-400">API Secret</label>
                            <Input
                                type="password"
                                placeholder="Binance API Secret 입력"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-2 rounded">
                                {error}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {isConnecting ? '연결 중...' : '안전하게 동기화 시작'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
