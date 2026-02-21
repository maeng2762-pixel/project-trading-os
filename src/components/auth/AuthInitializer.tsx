'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTradingStore } from '@/store/useTradingStore';
import { UserService } from '@/services/userService';
import { useCloudSync } from '@/hooks/useCloudSync';

export function AuthInitializer() {
    const init = useAuthStore((state) => state.init);

    // 1. Initialize Auth Listener
    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    // 2. Activate Cloud Sync Hook
    useCloudSync();

    return null;
}
