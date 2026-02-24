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
    user: { uid: 'mock_uid_123', email: 'pro_user@hp1.os' } as any,
    loading: false,
    unsubscribe: null,
    login: async () => {
        try {
            // Attempt to use Persistence (Local Storage)
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login failed", error);

            // Fallback for In-App Browsers (Kakao, Instagram) restricted storage
            if (error.code === 'auth/web-storage-unsupported' || error.message.includes('sessionStorage') || error.message.includes('storage')) {
                // Try In-Memory Persistence as last resort
                try {
                    await setPersistence(auth, inMemoryPersistence);
                    await signInWithPopup(auth, googleProvider);
                    alert("인앱 브라우저 제한으로 인해 '일회성 로그인'으로 접속되었습니다.\n새로고침 시 로그아웃될 수 있습니다.\n\n원활한 사용을 위해 크롬/사파리에서 열어주세요.");
                    return;
                } catch (fallbackError) {
                    console.error("Fallback failed", fallbackError);
                }

                alert("인앱 브라우저(카카오/인스타)에서는 로그인이 제한될 수 있습니다.\n오른쪽 상단 메뉴(...)를 눌러 '다른 브라우저로 열기'를 선택해주세요.");
            }
            throw error;
        }
    },
    logout: () => { // Removed async/await as signOut doesn't strictly need it to block UI update, but safer to keep async? 
        // Sync is handled by hook teardown.
        // We just need to clear local store.
        useTradingStore.getState().resetStore();
        return signOut(auth).then(() => {
            set({ user: null });
        });
    },
    init: () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                set({ user, loading: false });
                await UserService.initUser(user.uid, user.email);
            } else {
                set({ user: null, loading: false });
            }
        });
    },
}));
