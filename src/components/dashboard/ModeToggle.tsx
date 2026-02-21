import { useTradingStore } from '@/store/useTradingStore';
import { Shield, Gamepad2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const ModeToggle = () => {
    const { currentMode, setMode, isLocked, lockReason } = useTradingStore();

    return (
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/10">
            {/* Capital Mode Button */}
            <button
                onClick={() => setMode('CAPITAL')}
                className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    currentMode === 'CAPITAL'
                        ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/50"
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                {currentMode === 'CAPITAL' && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-indigo-500/10 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Capital</span>
                {isLocked && currentMode === 'CAPITAL' && <Lock className="w-3 h-3 text-red-400 ml-1" />}
            </button>

            {/* Tactical Mode Button */}
            <button
                onClick={() => setMode('TACTICAL')}
                className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    currentMode === 'TACTICAL'
                        ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50"
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                {currentMode === 'TACTICAL' && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-emerald-500/10 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tactical</span>
            </button>
        </div>
    );
};
