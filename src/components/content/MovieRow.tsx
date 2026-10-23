'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import type { MediaItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  size?: 'small' | 'medium' | 'large';
  showMatch?: boolean;
  onItemClick?: (item: MediaItem) => void;
  onPlay?: (item: MediaItem) => void;
  className?: string;
}

export function MovieRow({
  title,
  items,
  size = 'medium',
  showMatch = true,
  onItemClick,
  onPlay,
  className,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
  };

  if (!items || items.length === 0) return null;

  return (
    <section className={cn('px-4 sm:px-8 md:px-12 pb-8 sm:pb-10 relative group/row', className)} aria-label={title}>
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-3 flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs text-netflix-red font-semibold opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          Explorar todo &gt;
        </span>
      </h2>

      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-netflix-black/70 hover:bg-netflix-black/90 text-white flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover/row:opacity-100 rounded-r-lg"
            aria-label={`Desplazar ${title} hacia la izquierda`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-netflix-black/70 hover:bg-netflix-black/90 text-white flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover/row:opacity-100 rounded-l-lg"
            aria-label={`Desplazar ${title} hacia la derecha`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Horizontal Row Wrapper */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
          role="list"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              role="listitem"
            >
              <MovieCard
                item={item}
                size={size}
                showMatch={showMatch}
                onMoreInfo={onItemClick}
                onPlay={onPlay || onItemClick}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
