import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Key, Lock, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';

interface ApiKeyFormProps {
    onSave: (apiKey: string, apiSecret: string) => Promise<void>;
    onCancel: () => void;
}

export const ApiKeyForm = ({ onSave, onCancel }: ApiKeyFormProps) => {
    const { t } = useLanguageStore();
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!apiKey || !apiSecret) {
            setError('API Key와 Secret을 모두 입력해주세요.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await onSave(apiKey, apiSecret);
        } catch (err: any) {
            setError(err.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Connect Binance API</h3>
                    <p className="text-xs text-zinc-400">Guarded AutoPilot 활성화를 위한 필수 정보입니다.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <Key className="w-4 h-4 text-zinc-500" />
                        API Key
                    </label>
                    <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Binance API Key"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        API Secret
                    </label>
                    <input
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Binance API Secret"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 leading-relaxed border border-zinc-700/50">
                    <p className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                        <Lock className="w-3 h-3" /> 강력한 보안 원칙
                    </p>
                    Kelly는 사용자의 <b>출금(Withdrawal) 권한</b>을 절대 요구하지 않습니다.<br />
                    오직 <b>'읽기(Read)'</b> 및 <b>'선물 거래(Futures Trading)'</b> 권한만 허용해 주세요. <br />
                    (입력된 Secret Key는 최고 수준의 양방향 암호화인 AES-256으로 DB에 안전하게 보관됩니다.)
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 text-zinc-400 hover:text-white"
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        취소
                    </Button>
                    <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : '저장 및 연결'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
