import { StateStorage, createJSONStorage } from 'zustand/middleware';

const fallbackMemory: Record<string, string> = {};

export const safeStateStorage: StateStorage = {
    getItem: (name) => {
        try {
            return typeof window !== 'undefined' ? localStorage.getItem(name) : null;
        } catch (e) {
            console.warn('[SafeStorage] localStorage read blocked. Using memory map.', e);
            return fallbackMemory[name] || null;
        }
    },
    setItem: (name, value) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(name, value);
            }
        } catch (e) {
            console.warn('[SafeStorage] localStorage write blocked. Saving to memory map.', e);
            fallbackMemory[name] = value;
        }
    },
    removeItem: (name) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(name);
            }
        } catch (e) {
            console.warn('[SafeStorage] localStorage remove blocked.', e);
            delete fallbackMemory[name];
        }
    }
};

export const safeStorage = createJSONStorage(() => safeStateStorage);
