import React, { useState, useCallback } from 'react'
import { Icons } from '@/shared/components/Icons'

interface EthiopianNumericKeypadProps {
    onAmountChange: (amount: string) => void
    onConfirm: () => void
    onClose: () => void
    currentAmount: string
    title?: string
}

export const EthiopianNumericKeypad: React.FC<EthiopianNumericKeypadProps> = ({
    onAmountChange,
    onConfirm,
    onClose,
    currentAmount,
    title = "Enter Amount"
}) => {
    const [tempAmount, setTempAmount] = useState(currentAmount)

    const handleDigit = useCallback((digit: string) => {
        if (tempAmount.length < 8) { // Max 8 digits for ETB
            const newAmount = tempAmount + digit
            setTempAmount(newAmount)
            onAmountChange(newAmount)
        }
    }, [tempAmount, onAmountChange])

    const handleClear = useCallback(() => {
        setTempAmount('')
        onAmountChange('')
    }, [onAmountChange])

    const handleBackspace = useCallback(() => {
        const newAmount = tempAmount.slice(0, -1)
        setTempAmount(newAmount)
        onAmountChange(newAmount)
    }, [tempAmount, onAmountChange])

    const formatDisplayAmount = (amount: string) => {
        if (!amount) return '0.00'
        const number = parseInt(amount) / 100 // Convert to proper decimal
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Icons.Close size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Amount Display */}
                <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {formatDisplayAmount(tempAmount)} <span className="text-lg text-gray-500">ETB</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {tempAmount ? `${(parseInt(tempAmount) / 100).toFixed(2)} Ethiopian Birr` : 'Enter amount'}
                    </p>
                </div>

                {/* Keypad */}
                <div className="p-6 pb-8">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                            <button
                                key={digit}
                                onClick={() => handleDigit(digit.toString())}
                                className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all duration-150 touch-manipulation"
                            >
                                {digit}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Clear */}
                        <button
                            onClick={handleClear}
                            className="h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95 transition-all duration-150 touch-manipulation"
                        >
                            Clear
                        </button>

                        {/* Zero */}
                        <button
                            onClick={() => handleDigit('0')}
                            className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all duration-150 touch-manipulation"
                        >
                            0
                        </button>

                        {/* Backspace */}
                        <button
                            onClick={handleBackspace}
                            className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all duration-150 touch-manipulation"
                        >
                            ⌫
                        </button>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={onConfirm}
                        disabled={!tempAmount}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-cyan-300 active:scale-95 transition-all duration-150 touch-manipulation"
                    >
                        {tempAmount ? `Confirm ${formatDisplayAmount(tempAmount)} ETB` : 'Enter Amount'}
                    </button>
                </div>

                {/* Ethiopian Context Helper */}
                <div className="px-6 pb-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                        <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                            💡 <strong>Quick Tip:</strong> Ethiopian Birr (ETB) - 1 ETB = 100 santim
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}