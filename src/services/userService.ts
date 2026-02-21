import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { TradingState } from '@/store/useTradingStore';

export const UserService = {
    // Save entire state (or partial) to Firestore
    saveUserData: async (userId: string, data: Partial<TradingState>) => {
        try {
            const userRef = doc(db, 'users', userId);
            // We only save specific fields to avoid overwriting everything or large payloads
            const payload = {
                disciplineScore: data.disciplineScore,
                balance: data.balance,
                dailyPnl: data.dailyPnl,
                dailyStartBalance: data.dailyStartBalance,
                positions: data.positions,

                tradeHistory: data.tradeHistory,
                resistedImpulses: data.resistedImpulses,
                dailyStreak: data.dailyStreak,
                consecutiveLosses: data.consecutiveLosses,
                lastPledgeTime: data.lastPledgeTime,
                isLocked: data.isLocked,
                lockReason: data.lockReason,
                lockEndTime: data.lockEndTime,
                tier: data.tier || 'observer',
                lastUpdated: new Date().toISOString(),
            };
            await setDoc(userRef, payload, { merge: true });
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error; // Propagate error to caller
        }
    },

    // Load data from Firestore
    loadUserData: async (userId: string): Promise<Partial<TradingState> | null> => {
        try {
            const userRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.email === 'maeng2762@gmail.com') {
                    data.tier = 'inner_circle';
                }
                data.apiConnected = !!data.binanceApiKey;
                return data as Partial<TradingState>;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            return null;
        }
    },

    // Initialize new user if needed
    initUser: async (userId: string, email: string | null) => {
        try {
            const userRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    email,
                    joinedAt: new Date().toISOString(),
                    tier: 'observer', // Default tier
                    disciplineScore: 50,
                });
            }
        } catch (error) {
            console.error("Error initializing user:", error);
        }
    }
    ,

    // Real-time Subscription
    subscribeToUserData: (userId: string, callback: (data: Partial<TradingState> | null) => void) => {
        const userRef = doc(db, 'users', userId);
        return onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.email === 'maeng2762@gmail.com') {
                    data.tier = 'inner_circle';
                }
                data.apiConnected = !!data.binanceApiKey;
                callback(data as Partial<TradingState>);
            } else {
                callback(null);
            }
        });
    }
};
