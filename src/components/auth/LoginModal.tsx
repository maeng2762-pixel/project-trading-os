'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore'; // Import
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function LoginModal() {
    const { login, user } = useAuthStore();
    const { t } = useLanguageStore(); // Import t
    const [isOpen, setIsOpen] = useState(false);

    const handleLogin = async () => {
        try {
            await login();
            // Modal will close automatically when user state updates (if user logic exists) 
            // or we close it here.
            setIsOpen(false);
        } catch (error: any) {
            alert(`Login Failed: ${error.message}`);
        }
    };

    if (user) return null; // Don't show if logged in (handled by Header usually)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-coral-600 hover:from-indigo-500 hover:to-coral-500 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)] border-0 transition-all hover:scale-105">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('auth.login_btn')}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-indigo-900 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-indigo-400 to-coral-400 bg-clip-text text-transparent flex justify-center items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                        HP1 Auth
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-400 pt-2">
                        Access the advanced **AI Trading Guard**.<br />
                        Secure your capital with mathematical precision.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 flex items-center gap-2 justify-center"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                    <p className="text-xs text-center text-zinc-600">
                        By continuing, you agree to our Terms of Service & Privacy Policy.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
