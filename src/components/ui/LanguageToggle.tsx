'use client';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
    const { language, setLanguage } = useLanguageStore();

    const toggle = () => {
        setLanguage(language === 'ko' ? 'en' : 'ko');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
            <Globe className="h-4 w-4 mr-2" />
            {language === 'ko' ? '한국어' : 'English'}
        </Button>
    );
};
