'use client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'; // Assuming we have a standard dialog or I'll implement a simple one if not
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { ShareCard } from './ShareCard';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';

interface ShareModalProps {
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    type: 'IMPULSE' | 'SCORE' | 'WEEKLY';
    data?: any;
}

export const ShareModal = ({ trigger, isOpen, onClose, type, data }: ShareModalProps) => {
    const { t } = useLanguageStore();
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (cardRef.current === null) return;
        setIsSharing(true);

        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `antigravity-share-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyText = () => {
        const text = t('share.copy_text')
            .replace('{score}', (data?.score || 90).toString())
            .replace('{saved}', (data?.savedAmount || 0).toString());

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // If controlled via props (isOpen), we might need a different approach or wrapper. 
    // For now, let's assume it can be used as a Trigger-based Dialog component or standalone.

    // Simplification for MVP: We'll wrap it in a standard absolute overlay if standard Dialog isn't perfect, 
    // but let's try to use the Shadcn Dialog pattern if possible.
    // Actually, looking at previous files, we used standard HTML/CSS modals or passed props.
    // Let's create a self-contained fixed overlay for max compatibility with "Trigger" logic.

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{t('share.modal_title')}</h3>
                    <p className="text-sm text-zinc-400">{t('share.modal_desc')}</p>
                </div>

                {/* The Card Preview (Center Stage) */}
                <div className="flex justify-center overflow-hidden rounded-lg border border-zinc-800 shadow-2xl">
                    <div className="scale-[0.6] origin-top h-[360px] w-[240px]"> {/* Hack to fit 400x600 card in modal */}
                        <div ref={cardRef}>
                            <ShareCard type={type} data={data} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-[-40px]"> {/* Negative margin to pull up actions due to scale hack */}
                    <Button
                        onClick={handleCopyText}
                        variant="outline"
                        className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    >
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied!' : t('share.btn_copy')}
                    </Button>
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        disabled={isSharing}
                    >
                        {isSharing ? 'Generating...' : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                {t('share.btn_download')}
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
};
