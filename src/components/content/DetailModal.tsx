'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import type { MediaItem, Episode } from '@/lib/types';
import { mockMedia } from '@/lib/mock-data';
import { useWatchlist } from '@/lib/watchlist';
import { cn } from '@/lib/utils';

interface DetailModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (media: MediaItem, episode?: Episode) => void;
}

export function DetailModal({ media, isOpen, onClose, onPlay }: DetailModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const { inList, toggle } = useWatchlist();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const isInMyList = inList(media.id);
  const seasons = media.episodes ? [...new Set(media.episodes.map(e => e.season))] : [1];
  const currentEpisodes = media.episodes?.filter(e => e.season === selectedSeason) || [];

  // Related content
  const related = mockMedia.filter(m =>
    m.id !== media.id && m.genre.some(g => media.genre.includes(g))
  ).slice(0, 6);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-start justify-center p-0 md:p-6 lg:p-10">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-[#181818] rounded-none md:rounded-2xl overflow-hidden shadow-2xl z-10 my-0 md:my-6 text-white border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#181818]/80 hover:bg-[#181818] border border-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Cerrar ventana de detalles"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Hero / Video Preview */}
          <div className="relative aspect-video w-full max-h-[460px] overflow-hidden">
            {media.trailerUrl ? (
              <video
                src={media.trailerUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={media.backdrop}
                alt={media.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            )}

            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/60 via-transparent to-transparent" />

            {/* Action Bar inside Banner */}
            <div className="absolute bottom-8 left-6 md:left-10 right-6 md:right-10 flex items-end justify-between">
              <div className="space-y-4 max-w-xl">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg text-white">
                  {media.title}
                </h1>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onPlay(media)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-all duration-200 active:scale-95 shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    <span>Reproducir</span>
                  </button>

                  <button
                    onClick={() => toggle(media.id)}
                    className="p-3 rounded-full border-2 border-white/40 bg-neutral-900/60 hover:border-white hover:bg-neutral-800 transition-colors"
                    title={isInMyList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
                  >
                    {isInMyList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5 text-white" />}
                  </button>

                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                      "p-3 rounded-full border-2 transition-colors",
                      isLiked
                        ? "border-netflix-red bg-netflix-red/20 text-netflix-red"
                        : "border-white/40 bg-neutral-900/60 text-white hover:border-white hover:bg-neutral-800"
                    )}
                    title="Me gusta"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mute button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 rounded-full border border-white/20 bg-neutral-900/70 hover:bg-neutral-800 transition-colors"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Details & Episodes Body */}
          <div className="px-6 md:px-10 py-6 space-y-8">
            {/* Metadata & Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                  <span className="text-green-400 font-bold">{media.match || 97}% de coincidencia</span>
                  <span className="text-neutral-400">{media.year}</span>
                  <span className="px-2 py-0.5 border border-white/30 rounded text-xs text-neutral-300 font-medium">
                    {media.rating}
                  </span>
                  <span className="text-neutral-400">{media.duration}</span>
                  <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                    HD
                  </span>
                  <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                    Dolby 5.1
                  </span>
                </div>

                <p className="text-neutral-200 text-base md:text-lg leading-relaxed">
                  {media.description}
                </p>
              </div>

              {/* Cast & Genres Info */}
              <div className="space-y-3 text-sm text-neutral-400">
                {media.cast && media.cast.length > 0 && (
                  <div>
                    <span className="text-neutral-500 font-medium">Reparto: </span>
                    <span className="text-neutral-200">{media.cast.join(', ')}</span>
                  </div>
                )}
                {media.director && (
                  <div>
                    <span className="text-neutral-500 font-medium">Dirección: </span>
                    <span className="text-neutral-200">{media.director}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-500 font-medium">Géneros: </span>
                  <span className="text-neutral-200">{media.genre.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Episodes (if Series) */}
            {media.type === 'series' && currentEpisodes.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Episodios</h2>
                  {seasons.length > 1 && (
                    <div className="relative">
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="bg-neutral-800 text-white font-medium px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-netflix-red text-sm"
                      >
                        {seasons.map(s => (
                          <option key={s} value={s}>Temporada {s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-white/10">
                  {currentEpisodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlay(media, ep)}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-3 hover:bg-neutral-800/60 transition-colors cursor-pointer group"
                    >
                      <span className="text-xl font-bold text-neutral-400 group-hover:text-white w-6">
                        {ep.episode}
                      </span>

                      <div className="relative w-36 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800">
                        <Image
                          src={ep.thumbnail || media.thumbnail}
                          alt={ep.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="144px"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 fill-white text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white group-hover:text-netflix-red transition-colors truncate">
                            {ep.title}
                          </h3>
                          <span className="text-xs text-neutral-400 flex-shrink-0">{ep.duration}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2">
                          {ep.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Titles ("Más como esto") */}
            {related.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h2 className="text-xl font-bold text-white">Títulos similares</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {related.map((item) => {
                    const isItemInList = inList(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-[#242424] rounded-lg overflow-hidden flex flex-col group cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                        onClick={() => onPlay(item)}
                      >
                        <div className="relative aspect-video w-full">
                          <Image
                            src={item.backdrop}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                          <span className="absolute top-2 right-2 text-xs font-bold text-white bg-black/70 px-2 py-0.5 rounded">
                            {item.duration}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                              <span className="text-green-400">{item.match || 95}% coincidencia</span>
                              <span className="border border-white/30 px-1 py-0.2 rounded text-[10px] text-neutral-300">
                                {item.rating}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-white truncate group-hover:text-netflix-red transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs text-neutral-400 line-clamp-3 mt-1">
                              {item.description}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlay(item);
                              }}
                              className="p-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors"
                              title="Reproducir"
                            >
                              <Play className="w-4 h-4 fill-black" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(item.id);
                              }}
                              className="p-2 rounded-full border border-white/30 text-white hover:border-white transition-colors"
                              title={isItemInList ? 'Quitar de mi lista' : 'Añadir a mi lista'}
                            >
                              {isItemInList ? <Check className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* About Footer */}
            <div className="pt-6 border-t border-white/10 text-xs text-neutral-400 space-y-2">
              <h3 className="text-base font-bold text-white">Acerca de {media.title}</h3>
              <p><span className="text-neutral-500">Dirección:</span> {media.director || 'Varios directores'}</p>
              <p><span className="text-neutral-500">Reparto:</span> {media.cast?.join(', ') || 'Elenco internacional'}</p>
              <p><span className="text-neutral-500">Géneros:</span> {media.genre.join(', ')}</p>
              <p><span className="text-neutral-500">Calificación por edades:</span> Recomendada para mayores de {media.rating}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
