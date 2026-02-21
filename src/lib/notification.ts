export class NotificationService {
    static send(title: string, body: string, icon: string = '/icon.png') {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) return;

        try {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon,
                    requireInteraction: true,
                });
            }
        } catch (e) {
            console.warn("Notification error:", e);
        }
    }
}

