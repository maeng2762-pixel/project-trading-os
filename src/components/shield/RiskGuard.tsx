'use client';
import React, { ReactNode } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { CooldownOverlay } from './CooldownOverlay';

interface RiskGuardProps {
    children: ReactNode;
}

export const RiskGuard = ({ children }: RiskGuardProps) => {
    const { isLocked } = useTradingStore();

    return (
        <div className="relative min-h-screen w-full bg-zinc-950 text-white overflow-hidden">
            {/* Overlay is always present in DOM but only visible if locked, handling logic inside Overlay if preferred, 
          but here we want to block interactions efficiently. */}
            {isLocked && <CooldownOverlay />}

            {/* Main Content - blurred if locked? Optional visual effect */}
            <div className={`transition-all duration-500 ${isLocked ? 'blur-sm grayscale pointer-events-none' : ''}`}>
                {children}
            </div>
        </div>
    );
};
