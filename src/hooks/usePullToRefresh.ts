"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>
    threshold?: number // px to pull before triggering
}

export const usePullToRefresh = ({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) => {
    const [isPulling, setIsPulling] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const startY = useRef(0)
    const currentY = useRef(0)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Only enable pull-to-refresh at top of scroll
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY
            setIsPulling(true)
        }
    }, [])

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || isRefreshing) return

        currentY.current = e.touches[0].clientY
        const distance = Math.max(0, currentY.current - startY.current)

        // Apply resistance (slower pull as you go further)
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5)
        setPullDistance(resistedDistance)
    }, [isPulling, isRefreshing, threshold])

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true)
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
            }
        }

        setIsPulling(false)
        setPullDistance(0)
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('touchmove', handleTouchMove, { passive: true })
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    return {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        pullProgress: Math.min(pullDistance / threshold, 1)
    }
}
