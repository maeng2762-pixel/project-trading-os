import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
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
