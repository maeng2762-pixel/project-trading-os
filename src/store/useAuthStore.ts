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
            // Attempt 1: Popup (Best UX)
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.warn("Popup login failed, checking environment...", error);

            // Access blocked or Internal Error (common in Safari ITP / Chrome 3P Cookie block)
            if (error.code === 'auth/internal-error' || error.code === 'auth/network-request-failed') {
                // To avoid infinite loops, check if we've already tried redirecting in this session
                const redirectAttempted = sessionStorage.getItem('hp1_redirect_attempted');

                if (!redirectAttempted) {
                    sessionStorage.setItem('hp1_redirect_attempted', 'true');
                    console.info("Switching to Redirect mode due to environment restrictions...");
                    // Optional: alert the user or just do it. Let's do it for "Seamless" but with a small delay or info.
                    await signInWithRedirect(auth, googleProvider);
                    return;
                }
            }

            // If we reached here, it means popup failed AND either redirect already failed or it's a different error
            if (error.code === 'auth/popup-blocked') {
                alert("팝업이 차단되었습니다. 브라우저 설정에서 팝업 차단을 해제하거나 리다이렉트 모드를 시도해주세요.");
            } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                alert("로그인 환경이 제한되어 있습니다.\n\n사파리/크롬 설정에서 '크로스 사이트 추적 방지' 옵션을 해제하거나, 시크릿 모드가 아닌 일반 모드에서 시도해주세요.");
            }
        }
    },
    logout: async () => {
        useTradingStore.getState().resetStore();
        await signOut(auth);
        set({ user: null });
    },
    init: async () => {
        set({ loading: true });

        // Explicitly set persistence
        try {
            await setPersistence(auth, browserLocalPersistence);
        } catch (e) {
            console.error("Persistence error:", e);
        }

        // Handle redirect result and WAIT for it to prevent flash of login screen/loops
        try {
            const result = await getRedirectResult(auth);
            if (result?.user) {
                // Successful redirect login
                sessionStorage.removeItem('hp1_redirect_attempted');
            }
        } catch (error) {
            console.error("Redirect result error:", error);
            // Don't alert here to avoid annoying loops, just log it.
        }

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
