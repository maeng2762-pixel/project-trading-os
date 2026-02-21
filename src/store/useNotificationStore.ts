import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
    isEnabled: boolean;
    lastNotification: Record<string, number>; // Key: Timestamp
    toggleNotifications: () => Promise<boolean>;
    setLastNotification: (key: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            isEnabled: false,
            lastNotification: {},
            toggleNotifications: async () => {
                const state = get();
                if (state.isEnabled) {
                    set({ isEnabled: false });
                    return false;
                } else {
                    if (!('Notification' in window)) return false;
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        set({ isEnabled: true });
                        new Notification("Kelly Trading OS", { body: "알림이 활성화되었습니다. (Notification Enabled)" });
                        return true;
                    }
                    return false;
                }
            },
            setLastNotification: (key) => set((state) => ({
                lastNotification: { ...state.lastNotification, [key]: Date.now() }
            })),
        }),
        {
            name: 'kelly-notification-storage',
        }
    )
);
