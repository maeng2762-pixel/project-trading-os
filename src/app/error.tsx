'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AuditLogger } from '@/lib/audit';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        AuditLogger.log('SYSTEM_ERROR', {
            message: error.message,
            digest: error.digest
        }, 'SYSTEM');
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-rose-500 font-mono p-4 text-center">
            <ShieldAlert className="w-16 h-16 mb-6 opacity-80 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest">치명적 시스템 오류 (Fatal System Error)</h2>
            <p className="text-zinc-400 mb-8 max-w-md text-sm">
                보안 정책에 따라 상세 오류 내역은 노출되지 않습니다. 관리자에게 문의하세요.
                <br /><br />
                Error Digest: {error.digest || 'UNKNOWN'}
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-rose-900/40 border border-rose-500/50 hover:bg-rose-900/60 rounded text-white font-bold tracking-wider transition-all"
            >
                시스템 재시동 (REBOOT)
            </button>
        </div>
    );
}
