import React, { useEffect, useState } from 'react';
import { Icons } from '@/shared/components/Icons';

// Lazy-load canvas-confetti to reduce initial bundle size (~20-30 kB savings)
// Only loads when celebration is triggered
const loadConfetti = async () => {
  const confettiModule = await import('canvas-confetti');
  return confettiModule.default;
};

interface CelebrationOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
    isVisible,
    onClose,
    title = "Goal Reached!",
    message = "Congratulations! You've hit your target. Keep up the great work!"
}) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowModal(true);
            // Trigger confetti (lazy-loaded)
            const duration = 3000;
            const end = Date.now() + duration;

            const triggerConfetti = async () => {
                const confetti = await loadConfetti();
                const frame = () => {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#06B6D4', '#EC4899', '#10B981', '#F59E0B']
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#06B6D4', '#EC4899', '#10B981', '#F59E0B']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                };

                frame();
            };

            triggerConfetti();
        } else {
            setShowModal(false);
        }
    }, [isVisible]);

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-theme-card border border-theme rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">

                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                        <Icons.Trophy size={40} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-theme-primary mb-2">{title}</h2>
                    <p className="text-theme-secondary mb-8 leading-relaxed">{message}</p>

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-200"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
};
