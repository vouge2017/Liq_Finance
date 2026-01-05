import { useState, useCallback } from 'react'
import { useHaptic } from './useHaptic'

interface OptimisticUpdateOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    showSuccessMessage?: boolean
    hapticFeedback?: 'light' | 'medium' | 'heavy'
}

interface OptimisticState<T> {
    data: T[]
    isLoading: boolean
    error: string | null
    pendingItems: string[] // IDs of items waiting for server confirmation
}

export const useOptimisticUpdates = <T extends { id: string }>(
    initialData: T[] = [],
    options: OptimisticUpdateOptions<T> = {}
) => {
    const { triggerHaptic } = useHaptic()
    const [state, setState] = useState<OptimisticState<T>>({
        data: initialData,
        isLoading: false,
        error: null,
        pendingItems: []
    })

    const optimisticUpdate = useCallback(async (
        operation: () => Promise<T>,
        optimisticItem: T
    ) => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            data: [optimisticItem, ...prev.data],
            pendingItems: [...prev.pendingItems, optimisticItem.id]
        }))

        try {
            // Haptic feedback
            if (options.hapticFeedback) {
                triggerHaptic(options.hapticFeedback)
            }

            const result = await operation()

            setState(prev => ({
                ...prev,
                isLoading: false,
                pendingItems: prev.pendingItems.filter(id => id !== optimisticItem.id),
                data: prev.data.map(item =>
                    item.id === optimisticItem.id ? result : item
                )
            }))

            options.onSuccess?.(result)

            // Show success toast
            if (options.showSuccessMessage !== false) {
                // You can integrate with your toast system here
                console.log('✅ Operation successful')
            }

        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Operation failed',
                data: prev.data.filter(item => item.id !== optimisticItem.id),
                pendingItems: prev.pendingItems.filter(id => id !== optimisticItem.id)
            }))

            options.onError?.(error instanceof Error ? error : new Error('Operation failed'))
        }
    }, [options, triggerHaptic])

    const retryFailedOperation = useCallback(async (
        operation: () => Promise<T>,
        itemId: string
    ) => {
        const item = state.data.find(item => item.id === itemId)
        if (!item) return

        setState(prev => ({
            ...prev,
            pendingItems: [...prev.pendingItems, itemId]
        }))

        try {
            const result = await operation()

            setState(prev => ({
                ...prev,
                pendingItems: prev.pendingItems.filter(id => id !== itemId),
                data: prev.data.map(item =>
                    item.id === itemId ? result : item
                )
            }))

        } catch (error) {
            setState(prev => ({
                ...prev,
                pendingItems: prev.pendingItems.filter(id => id !== itemId),
                error: error instanceof Error ? error.message : 'Retry failed'
            }))
        }
    }, [state.data])

    const removeOptimisticItem = useCallback((itemId: string) => {
        setState(prev => ({
            ...prev,
            data: prev.data.filter(item => item.id !== itemId),
            pendingItems: prev.pendingItems.filter(id => id !== itemId)
        }))
    }, [])

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    return {
        ...state,
        optimisticUpdate,
        retryFailedOperation,
        removeOptimisticItem,
        clearError
    }
}