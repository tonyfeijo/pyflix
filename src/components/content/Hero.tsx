'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Info, Plus, Check, Volume2, VolumeX } from 'lucide-react';
import type { MediaItem } from '@/lib/types';
import { useWatchlist } from '@/lib/watchlist';
import { playNetflixIntroSound } from '@/lib/audio';
import { cn } from '@/lib/utils';

interface HeroProps {
  item: MediaItem;
  onPlay?: () => void;
  onMoreInfo?: () => void;
}

export function Hero({ item, onPlay, onMoreInfo }: HeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { inList, toggle } = useWatchlist();

  const isInMyList = inList(item.id);
  // Solo mostramos coincidencia si Jellyfin tiene una nota real.
  const match = item.match;

  // Autoplay video with slight delay
  useEffect(() => {
    setVideoLoaded(false);
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [item.id]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlayClick = () => {
    playNetflixIntroSound();
    onPlay?.();
  };

  return (
    <section className="relative w-full h-[78vh] sm:h-[85vh] lg:h-[92vh] flex items-end pb-16 sm:pb-24 overflow-hidden" aria-label={`Destacado: ${item.title}`}>
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <Image
          src={item.backdrop}
          alt={item.title}
          fill
          priority
          className={cn(
            'object-cover transition-opacity duration-1000',
            videoLoaded ? 'opacity-0' : 'opacity-100'
          )}
          sizes="100vw"
        />

        {item.trailerUrl && (
          <video
            ref={videoRef}
            src={item.trailerUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onPlaying={() => setVideoLoaded(true)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000',
              videoLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {/* Cinematic Netflix Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/90 via-netflix-black/30 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 w-full flex items-end justify-between">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {match !== undefined && (
              <span className="text-green-400 font-bold text-sm tracking-wide">
                {match}% Coincidencia
              </span>
            )}
            <span className="px-2 py-0.5 border border-white/30 text-xs text-neutral-300 font-semibold rounded">
              {item.rating}
            </span>
            <span className="text-xs text-neutral-300 font-medium">
              {item.duration}
            </span>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-2xl"
          >
            {item.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-neutral-200 text-sm sm:text-base md:text-lg line-clamp-3 leading-relaxed drop-shadow-md font-normal"
          >
            {item.description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {/* Play Button */}
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black font-bold text-base sm:text-lg rounded-lg hover:bg-neutral-200 transition-all active:scale-95 shadow-xl hover:shadow-2xl"
              aria-label={`Reproducir ${item.title}`}
            >
              <Play className="w-5 sm:w-6 h-5 sm:h-6 fill-black" />
              <span>Reproducir</span>
            </button>

            {/* More Info Button */}
            <button
              onClick={onMoreInfo}
              className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-neutral-600/70 hover:bg-neutral-600/90 text-white font-semibold text-base sm:text-lg rounded-lg backdrop-blur-md transition-all active:scale-95"
              aria-label={`Más información sobre ${item.title}`}
            >
              <Info className="w-5 sm:w-6 h-5 sm:h-6" />
              <span>Más información</span>
            </button>

            {/* Add to My List Button */}
            <button
              onClick={() => toggle(item.id)}
              className={cn(
                "p-3 rounded-full border-2 transition-all active:scale-90",
                isInMyList
                  ? "border-green-400 bg-green-500/20 text-green-400"
                  : "border-white/40 bg-neutral-900/60 text-white hover:border-white hover:bg-neutral-800"
              )}
              title={isInMyList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
            >
              {isInMyList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
            </button>
          </motion.div>
        </div>

        {/* Right Edge: Mute Button & Maturity Rating Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-3 rounded-full border border-white/30 bg-neutral-900/60 hover:bg-neutral-800 text-white transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <div className="bg-neutral-900/70 backdrop-blur-sm border-l-4 border-white px-3 py-1 text-xs md:text-sm font-bold text-white tracking-wider uppercase">
            {item.rating}
          </div>
        </div>
      </div>
    </section>
  );
}
