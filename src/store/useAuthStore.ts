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
            console.warn("Popup login failed, attempting redirect...", error);
            try {
                // Determine if it was closed by user or a real error
                if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                    await signInWithRedirect(auth, googleProvider);
                }
            } catch (fallbackError: any) {
                console.error("Redirect login also failed", fallbackError);
                if (error.code === 'auth/internal-error' || fallbackError.code === 'auth/internal-error') {
                    alert("로그인 환경이 제한되어 있습니다.\n\n사파리/크롬 설정에서 '크로스 사이트 추적 방지' 옵션을 해제하거나, 다른 브라우저 앱을 이용해주세요.");
                } else {
                    alert(`로그인 중 오류가 발생했습니다: ${error.message || fallbackError.message}`);
                }
            }
        }
    },
    logout: async () => {
        useTradingStore.getState().resetStore();
        await signOut(auth);
        set({ user: null });
    },
    init: () => {
        // Handle redirect result to catch errors from the popup fallback
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect login result error:", error);
            if (error.code === 'auth/unauthorized-domain') {
                alert(`[관리자 권한 오류] Vercel 도메인 권한이 Firebase에 없습니다.\n\nFirebase 콘솔에 접속하여 Authentication -> Settings -> Authorized Domains 에 아래 주소를 추가해주세요:\n\n${window.location.hostname}`);
            } else if (error.code === 'auth/internal-error') {
                alert("로그인 세션을 가져올 수 없습니다. 사파리/크롬 설정에서 '크로스 사이트 추적 방지'를 해제해주세요.");
            } else {
                alert(`로그인 리디렉션 처리 중 오류: ${error.message}`);
            }
        });

        // Safe persistence setting on init
        setPersistence(auth, browserLocalPersistence).catch(err => console.warn("Persistence failed", err));

        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                set({ user, loading: false });
                await UserService.initUser(user.uid, user.email);
            } else {
                set({ user: null, loading: false });
            }
        });
        set({ unsubscribe: () => unsub() });
    },
}));
