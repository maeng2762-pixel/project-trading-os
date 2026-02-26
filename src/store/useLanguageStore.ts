import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from '@/lib/translations';
import { safeStorage } from '@/lib/safeStorage';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['ko']) => string;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'ko', // Default to Korean
            setLanguage: (lang) => set({ language: lang }),
            t: (key) => {
                const { language } = get();
                const dict = translations[language] as Record<string, string>;
                return dict[key] || key;
            },
        }),
        {
            name: 'language-storage',
            storage: safeStorage,
        }
    )
);
