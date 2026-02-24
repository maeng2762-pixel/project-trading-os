import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type AuditActionType =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'TRADE_EXECUTION'
    | 'TRADE_CLOSED'
    | 'SYSTEM_ERROR'
    | 'SETTINGS_CHANGED'
    | 'SECURITY_VIOLATION';

export const AuditLogger = {
    log: async (actionType: AuditActionType, details: Record<string, any>, userId: string = 'ANONYMOUS') => {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                action: actionType,
                userId,
                details,
                timestamp: serverTimestamp(),
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SERVER',
                // Cannot reliably get IP from client-side Firebase directly, needs Edge/Backend function
            });
            console.info(`[AUDIT: ${actionType}]`, details);
        } catch (err) {
            console.error('Failed to write audit log:', err);
        }
    }
};
