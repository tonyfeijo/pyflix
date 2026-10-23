'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ChevronDown, ThumbsUp } from 'lucide-react';
import type { MediaItem } from '@/lib/types';
import { useWatchlist } from '@/lib/watchlist';
import { playNetflixIntroSound } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  item: MediaItem;
  size?: 'small' | 'medium' | 'large';
  showMatch?: boolean;
  onMoreInfo?: (item: MediaItem) => void;
  onPlay?: (item: MediaItem) => void;
}

export function MovieCard({
  item,
  size = 'medium',
  showMatch = true,
  onMoreInfo,
  onPlay,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { inList, toggle } = useWatchlist();

  const isInMyList = inList(item.id);
  const match = item.match || 95;

  const handlePlayDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNetflixIntroSound();
    onPlay?.(item);
  };

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(item.id);
  };

  const handleCardClick = () => {
    onMoreInfo?.(item);
  };

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Base Card (Landscape 16:9 like Netflix browse) */}
      <div className="relative w-48 sm:w-60 md:w-72 aspect-video rounded-md md:rounded-lg overflow-hidden bg-neutral-900 border border-white/5 shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
        <Image
          src={item.backdrop || item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 192px, (max-width: 768px) 240px, 288px"
        />

        {/* Subtle bottom gradient & title */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black/90 via-transparent to-transparent flex flex-col justify-end p-2.5 sm:p-3">
          <p className="text-white text-xs sm:text-sm font-semibold truncate drop-shadow">
            {item.title}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-300 mt-0.5">
            <span className="text-green-400 font-bold">{match}%</span>
            <span>•</span>
            <span className="px-1 border border-white/20 rounded uppercase">{item.rating}</span>
            <span>•</span>
            <span>{item.duration}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isNew && (
            <span className="bg-netflix-red text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              NUEVO
            </span>
          )}
          {item.isTrending && (
            <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              TENDENCIA
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-between p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-xs font-bold">{match}% coincidencia</span>
                <span className="text-[10px] uppercase font-bold text-neutral-300 border border-white/30 px-1 rounded">
                  {item.rating}
                </span>
              </div>

              <div>
                <p className="text-white text-xs font-bold truncate mb-2">{item.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayDirect}
                      className="p-2 bg-white text-black rounded-full hover:bg-neutral-200 active:scale-90 transition-transform shadow-md"
                      title="Reproducir"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                    </button>
                    <button
                      onClick={handleToggleList}
                      className="p-2 rounded-full border border-white/40 bg-black/40 text-white hover:border-white hover:bg-neutral-800 active:scale-90 transition-all"
                      title={isInMyList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
                    >
                      {isInMyList ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                      }}
                      className={cn(
                        "p-2 rounded-full border active:scale-90 transition-all",
                        isLiked
                          ? "border-netflix-red bg-netflix-red/30 text-netflix-red"
                          : "border-white/40 bg-black/40 text-white hover:border-white hover:bg-neutral-800"
                      )}
                      title="Me gusta"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreInfo?.(item);
                    }}
                    className="p-2 rounded-full border border-white/40 bg-black/40 text-white hover:border-white hover:bg-neutral-800 transition-colors"
                    title="Más información"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
