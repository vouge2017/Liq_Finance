import React, { useState } from 'react'
import { Icons } from '@/shared/components/Icons'

interface AIOnboardingModalProps {
    onComplete: () => void
}

export const AIOnboardingModal: React.FC<AIOnboardingModalProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0)

    const steps = [
        {
            title: "Meet Liq Advisor",
            description: "Your culturally-aware financial coach that understands Ethiopian banking, Iqub, and Iddir.",
            icon: <Icons.AI size={64} className="text-primary" />,
            features: [
                "Analyzes spending patterns",
                "Tracks Iqub & Iddir deadlines",
                "Personalized savings strategies",
                "Multilingual support (English/Amharic)"
            ]
        },
        {
            title: "How to Interact",
            description: "Ask anything about your finances. Liq has full context of your accounts and goals.",
            icon: <Icons.Feedback size={64} className="text-cyan-500" />,
            features: [
                "\"How's my budget this month?\"",
                "\"When is my next Iqub payout?\"",
                "\"Can I afford a new phone?\"",
                "\"Analyze my transport spending\""
            ]
        },
        {
            title: "Privacy First",
            description: "Your financial data is processed securely and never shared with third parties.",
            icon: <Icons.Shield size={64} className="text-emerald-500" />,
            features: [
                "End-to-end encryption",
                "Local-first processing",
                "Anonymized AI requests",
                "Full control in Settings"
            ]
        }
    ]

    const current = steps[step]

    return (
        <div className="fixed inset-0 modal-overlay z-[100] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 max-w-sm w-full animate-dialog shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-inner">
                        {current.icon}
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-3 tracking-tight">{current.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 leading-relaxed font-medium">{current.description}</p>

                <div className="space-y-3 mb-10">
                    {current.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                            <Icons.Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mb-10">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-primary' : 'w-2 bg-gray-200 dark:bg-white/10'}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => {
                        if (step < steps.length - 1) setStep(step + 1)
                        else onComplete()
                    }}
                    className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {step < steps.length - 1 ? 'Continue' : 'Get Started'}
                </button>
            </div>
        </div>
    )
}
