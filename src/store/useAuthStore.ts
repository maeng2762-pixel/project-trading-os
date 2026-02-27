import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { UserService } from '@/services/userService';
import { useTradingStore } from './useTradingStore';

interface AuthState {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;

    logout: () => Promise<void>;
    init: () => void;
    unsubscribe: (() => void) | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    unsubscribe: null,
    login: async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Popup login failed:", error);
            if (error.code === 'auth/popup-blocked') {
                alert("팝업이 차단되었습니다. 브라우저 설정에서 팝업 차단을 해제하고 다시 시도해주세요.");
            } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                if (error.code === 'auth/internal-error') {
                    alert("로그인 환경이 제한되어 있습니다.\n\n사파리/크롬 설정에서 '크로스 사이트 추적 방지' 옵션을 해제하거나, 다른 브라우저 앱을 이용해주세요.");
                } else {
                    alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
                }
            }
        }
    },
    logout: async () => {
        useTradingStore.getState().resetStore();
        await signOut(auth);
        set({ user: null });
    },
    init: async () => {
        // Explicitly set persistence to support multi-device concurrent sessions robustly
        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (e) {
            console.error("Failed to set local persistence, falling back to in-memory:", e);
        }

        // Handle redirect result silently to avoid infinite alert loops on Safari/Mobile
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect login result error:", error);
        });

        // Background Silent Refresh Interval (48h support / refreshing token every 30m)
        let tokenRefreshInterval: NodeJS.Timeout | null = null;

        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Initial session token refresh to guarantee validity
                await user.getIdToken(true).catch(() => { });

                set({ user, loading: false });
                await UserService.initUser(user.uid, user.email);

                // Setup Silent Refresh (Refresh token every 30 minutes to sustain 48-hour continuous use)
                if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
                tokenRefreshInterval = setInterval(async () => {
                    try {
                        const currentUser = auth.currentUser;
                        if (currentUser) {
                            await currentUser.getIdToken(true); // Force refresh token
                            console.debug("[Auth] Background silent refresh executed.");
                        }
                    } catch (e) {
                        console.error("[Auth] Silent refresh failed", e);
                    }
                }, 1000 * 60 * 30); // 30 minutes

            } else {
                if (tokenRefreshInterval) {
                    clearInterval(tokenRefreshInterval);
                    tokenRefreshInterval = null;
                }
                set({ user: null, loading: false });
            }
        });

        set({
            unsubscribe: () => {
                if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
                unsub();
            }
        });
    },
}));
