import React, { useRef, useState, useEffect } from 'react';
import { Icons } from '@/shared/components/Icons';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalScroll: React.FC<Props> = ({ children, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      // Allow a small buffer (1px) for rounding errors
      setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Chevron */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-theme-card to-transparent z-10 flex items-center justify-start transition-opacity duration-300 pointer-events-none ${showLeft ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); scroll('left'); }}
          className="pointer-events-auto p-1 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors ml-1"
        >
          <Icons.ChevronLeft size={16} />
        </button>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`overflow-x-auto no-scrollbar ${className}`}
      >
        {children}
      </div>

      {/* Right Chevron */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-theme-card to-transparent z-10 flex items-center justify-end transition-opacity duration-300 pointer-events-none ${showRight ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); scroll('right'); }}
          className="pointer-events-auto p-1 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors mr-1"
        >
          <Icons.ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
