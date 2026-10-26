'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Plus, Check, Info } from 'lucide-react';
import type { MediaItem } from '@/lib/types';
import { useWatchlist } from '@/lib/watchlist';
import { cn } from '@/lib/utils';

interface Top10RowProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
}

export function Top10Row({ items, onPlay, onMoreInfo }: Top10RowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { inList, toggle } = useWatchlist();

  const top10List = items.slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
  };

  return (
    <section className="px-4 md:px-8 pb-10 relative group/row" aria-label="Las 10 películas y series más populares hoy">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Las 10 más populares de hoy</span>
          <span className="text-xs bg-netflix-red text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            TOP 10
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-netflix-black/70 hover:bg-netflix-black/90 text-white flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover/row:opacity-100 rounded-r-lg"
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-netflix-black/70 hover:bg-netflix-black/90 text-white flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover/row:opacity-100 rounded-l-lg"
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-4 px-2"
        >
          {top10List.map((item, index) => {
            const rank = index + 1;
            const isInUserList = inList(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative flex-shrink-0 flex items-center group cursor-pointer"
                onClick={() => onMoreInfo(item)}
              >
                {/* Netflix Stylized Giant Rank Number */}
                <div className="relative w-20 md:w-28 h-48 md:h-64 flex items-center justify-center select-none -mr-4 md:-mr-6 z-0">
                  <svg className="w-full h-full" viewBox="0 0 100 120">
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="central"
                      textAnchor="middle"
                      className="font-black text-[115px] fill-netflix-black stroke-[4] stroke-[#595959]"
                      style={{
                        paintOrder: 'stroke fill',
                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.8))',
                      }}
                    >
                      {rank}
                    </text>
                  </svg>
                </div>

                {/* Poster Card */}
                <div className="relative w-32 sm:w-40 md:w-44 h-48 sm:h-60 md:h-64 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:z-20 ring-1 ring-white/10 group-hover:ring-white/40">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-xs md:text-sm font-bold truncate mb-2">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        className="p-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-transform active:scale-90"
                        title="Reproducir"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(item.id);
                        }}
                        className="p-2 bg-neutral-800/80 text-white rounded-full hover:bg-neutral-700 transition-transform active:scale-90"
                        title={isInUserList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
                      >
                        {isInUserList ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoreInfo(item);
                        }}
                        className="p-2 bg-neutral-800/80 text-white rounded-full hover:bg-neutral-700 ml-auto"
                        title="Más información"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
