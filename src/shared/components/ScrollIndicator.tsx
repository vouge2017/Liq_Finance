"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Icons } from '@/shared/components/Icons'

interface ScrollIndicatorProps {
    containerRef: React.RefObject<HTMLElement>
    children: React.ReactNode
    className?: string
    showOnHover?: boolean
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
    containerRef,
    children,
    className = '',
    showOnHover = false
}) => {
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        const element = containerRef.current
        if (!element) return

        const checkScroll = () => {
            const hasHorizontalScroll = element.scrollWidth > element.clientWidth
            setShowLeft(hasHorizontalScroll && element.scrollLeft > 0)
            setShowRight(hasHorizontalScroll && element.scrollLeft < element.scrollWidth - element.clientWidth - 10)
        }

        checkScroll()
        element.addEventListener('scroll', checkScroll)
        window.addEventListener('resize', checkScroll)

        return () => {
            element.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [containerRef])

    const scroll = (direction: 'left' | 'right') => {
        const element = containerRef.current
        if (!element) return

        const scrollAmount = element.clientWidth * 0.8
        element.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    const shouldShow = showOnHover ? isHovered : true

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}

            {shouldShow && showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-sm shadow-lg rounded-r-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#101622] transition-all active:scale-95"
                    aria-label="Scroll left"
                >
                    <Icons.ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
            )}

            {shouldShow && showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-sm shadow-lg rounded-l-lg flex items-center justify-center hover:bg-white dark:hover:bg-[#101622] transition-all active:scale-95"
                    aria-label="Scroll right"
                >
                    <Icons.ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
            )}
        </div>
    )
}

interface HorizontalScrollWrapperProps {
    children: React.ReactNode
    className?: string
    orientation?: 'horizontal' | 'both'
}

export const HorizontalScrollWrapper: React.FC<HorizontalScrollWrapperProps> = ({
    children,
    className = '',
    orientation = 'horizontal'
}) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(false)

    useEffect(() => {
        const element = scrollRef.current
        if (!element) return

        const checkScroll = () => {
            setShowLeft(element.scrollLeft > 0)
            setShowRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 5)
        }

        checkScroll()
        element.addEventListener('scroll', checkScroll)

        const resizeObserver = new ResizeObserver(checkScroll)
        resizeObserver.observe(element)

        return () => {
            element.removeEventListener('scroll', checkScroll)
            resizeObserver.disconnect()
        }
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        const element = scrollRef.current
        if (!element) return

        element.scrollBy({
            left: direction === 'left' ? -280 : 280,
            behavior: 'smooth'
        })
    }

    return (
        <div className={`relative ${className}`}>
            <div
                ref={scrollRef}
                className={`overflow-x-auto no-scrollbar scrollbar-hide ${
                    orientation === 'both' ? 'overflow-y-auto' : ''
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>

            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-gradient-to-r from-white/95 to-white/50 dark:from-[#101622]/95 dark:to-[#101622]/50 backdrop-blur-xl shadow-xl rounded-r-2xl flex items-center justify-center hover:from-white hover:to-white dark:hover:from-[#101622] dark:hover:to-[#101622] transition-all active:scale-95 border-l border-gray-100 dark:border-white/5"
                    aria-label="Scroll left"
                >
                    <Icons.ChevronLeft size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
            )}

            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-gradient-to-l from-white/95 to-white/50 dark:from-[#101622]/95 dark:to-[#101622]/50 backdrop-blur-xl shadow-xl rounded-l-2xl flex items-center justify-center hover:from-white hover:to-white dark:hover:from-[#101622] dark:hover:to-[#101622] transition-all active:scale-95 border-r border-gray-100 dark:border-white/5"
                    aria-label="Scroll right"
                >
                    <Icons.ChevronRight size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
            )}
        </div>
    )
}
