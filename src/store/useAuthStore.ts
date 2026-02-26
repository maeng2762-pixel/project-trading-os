import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
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
            console.error("Login failed", error);
            if (error.code === 'auth/internal-error') {
                alert("로그인 중 내부 오류가 발생했습니다.\n\n1. 브라우저의 '쿠키 허용' 설정을 확인해주세요.\n2. 팝업 차단이 되어있을 수 있으니 해제해주세요.\n3. 계속 발생할 경우 '시크릿 창'에서 시도해보세요.");
            }
            throw error;
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
