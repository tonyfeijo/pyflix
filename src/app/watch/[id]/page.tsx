'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Play, Info, Plus, Check, ChevronRight, ChevronDown, Star, Share2, Download } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Player } from '@/components/content/Player';
import { MovieRow } from '@/components/content/MovieRow';
import { mockMedia, getMediaById, getCategories } from '@/lib/mock-data';
import type { MediaItem, Episode } from '@/lib/types';

export default function WatchPage() {
  const params = useParams();
  const id = params.id as string;
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const found = getMediaById(id);
    if (found) {
      setMedia(found);
      if (found.episodes && found.episodes.length > 0) {
        const seasons = [...new Set(found.episodes.map(e => e.season))];
        setSelectedSeason(seasons[0]);
      }
    }
  }, [id]);

  if (!media) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-netflix-gray border-t-netflix-red" />
      </div>
    );
  }

  const seasons = media.episodes ? [...new Set(media.episodes.map(e => e.season))] : [];
  const currentSeasonEpisodes = media.episodes?.filter(e => e.season === selectedSeason) || [];
  const match = media.match ?? Math.floor(Math.random() * 20) + 80;

  const handlePlay = (episode?: Episode) => {
    setCurrentEpisode(episode || null);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setCurrentEpisode(null);
  };

  const handleNextEpisode = () => {
    if (media.episodes && currentEpisode) {
      const allEpisodes = media.episodes;
      const currentIndex = allEpisodes.findIndex(e => e.id === currentEpisode.id);
      if (currentIndex < allEpisodes.length - 1) {
        setCurrentEpisode(allEpisodes[currentIndex + 1]);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (media.episodes && currentEpisode) {
      const allEpisodes = media.episodes;
      const currentIndex = allEpisodes.findIndex(e => e.id === currentEpisode.id);
      if (currentIndex > 0) {
        setCurrentEpisode(allEpisodes[currentIndex - 1]);
      }
    }
  };

  // Related content
  const relatedMedia = mockMedia.filter(m => 
    m.id !== media.id && 
    m.genre.some(g => media.genre.includes(g))
  ).slice(0, 10);

  return (
    <>
      <div className="min-h-screen">
      <Header />
      
      <main className="pt-20 pb-20" role="main">
        {/* Detail Hero */}
        <section className="relative min-h-[60vh] flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src={media.backdrop}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/80 via-netflix-black/20 to-transparent" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end mb-8">
              <div className="relative w-full lg:w-72 flex-shrink-0">
                <Image
                  src={media.thumbnail}
                  alt={`${media.title} poster`}
                  width={240}
                  height={360}
                  className="rounded-xl shadow-netflix-lg"
                  priority
                />
                {media.match && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-netflix-green/90 text-netflix-white text-sm font-bold rounded-full backdrop-blur-sm">
                    <span className="w-2 h-2 bg-netflix-green rounded-full animate-pulse" />
                    <span>{match}%</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center lg:text-left">
                {media.logo && (
                  <Image
                    src={media.logo}
                    alt={`${media.title} logo`}
                    width={300}
                    height={150}
                    className="mx-auto lg:mx-0 mb-6 max-w-full h-auto"
                    priority
                  />
                )}

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                  <span className="px-3 py-1 bg-netflix-gray/30 rounded text-sm font-medium uppercase">{media.rating}</span>
                  <span className="text-netflix-lightGray">{media.year}</span>
                  <span className="text-netflix-lightGray">•</span>
                  <span className="text-netflix-lightGray">{media.duration}</span>
                  <span className="text-netflix-lightGray">•</span>
                  <span className="capitalize text-netflix-lightGray">{media.genre[0]}</span>
                  {media.genre[1] && <span className="text-netflix-lightGray">, {media.genre[1].toLowerCase()}</span>}
                </div>

                <p className="text-lg md:text-xl text-netflix-offWhite max-w-3xl mx-auto lg:mx-0 mb-8 line-clamp-4">
                  {media.description}
                </p>

                {(media.cast || media.director) && (
                  <div className="text-sm text-netflix-lightGray mb-6 max-w-3xl mx-auto lg:mx-0">
                    {media.director && <p className="mb-1"><span className="text-netflix-white font-medium">Creado por:</span> {media.director}</p>}
                    {media.cast && media.cast.length > 0 && <p><span className="text-netflix-white font-medium">Reparto:</span> {media.cast.slice(0, 5).join(', ')}</p>}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => handlePlay()}
                    className="btn-primary min-w-[200px] justify-center gap-2"
                  >
                    <Play className="w-6 h-6" />
                    <span>{media.type === 'series' ? 'Reproducir' : 'Reproducir'}</span>
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="btn-secondary min-w-[200px] justify-center gap-2 bg-netflix-card/50 backdrop-blur-sm"
                  >
                    <Info className="w-6 h-6" />
                    <span>Más información</span>
                  </button>
                  <button className="btn-ghost min-w-[200px] justify-center gap-2">
                    <Plus className="w-6 h-6" />
                    <span>Mi lista</span>
                  </button>
                  <button className="btn-ghost p-3 rounded-xl">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Episodes for Series */}
            {media.type === 'series' && media.episodes && media.episodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-10 glass rounded-2xl overflow-hidden"
              >
                {/* Season Selector */}
                <div className="p-4 border-b border-netflix-gray/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-netflix-white">Episodios</h3>
                    <div className="relative">
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                        className="appearance-none bg-netflix-card border border-netflix-gray/30 rounded-lg px-4 py-2 pr-10 text-netflix-white focus:border-netflix-red focus:outline-none focus:ring-2 focus:ring-netflix-red/20 cursor-pointer"
                      >
                        {seasons.map(s => (
                          <option key={s} value={s}>Temporada {s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-netflix-gray pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="divide-y divide-netflix-gray/10">
                  {currentSeasonEpisodes.map((ep, index) => (
                    <button
                      key={ep.id}
                      onClick={() => handlePlay(ep)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-netflix-gray/10 transition-colors text-left group"
                    >
                      <div className="relative w-24 h-13.5 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={ep.thumbnail}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-netflix-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-netflix-white truncate">{ep.title}</span>
                          <span className="text-xs text-netflix-gray bg-netflix-card/50 px-2 py-0.5 rounded whitespace-nowrap">
                            E{ep.episode.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-sm text-netflix-lightGray line-clamp-1">{ep.description}</p>
                        <p className="text-xs text-netflix-gray mt-1">{ep.duration}</p>
                      </div>
                      <div className="flex items-center gap-2 text-netflix-gray group-hover:text-netflix-white transition-colors">
                        <button className="p-2 rounded-lg hover:bg-netflix-card transition-colors" aria-label="Más opciones">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                        <Download className="w-5 h-5" />
                        <Share2 className="w-5 h-5" />
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* More Info Section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-10 glass rounded-2xl p-6"
                >
                  <h3 className="font-bold text-netflix-white mb-4">Más información</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-netflix-gray">Géneros</p>
                      <p className="text-netflix-white">{media.genre.map(g => g.toLowerCase()).join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-netflix-gray">Año de estreno</p>
                      <p className="text-netflix-white">{media.year}</p>
                    </div>
                    <div>
                      <p className="text-netflix-gray">Clasificación</p>
                      <p className="text-netflix-white">{media.rating}</p>
                    </div>
                    <div>
                      <p className="text-netflix-gray">Duración</p>
                      <p className="text-netflix-white">{media.duration}</p>
                    </div>
                    {media.director && (
                      <div>
                        <p className="text-netflix-gray">Director/Showrunner</p>
                        <p className="text-netflix-white">{media.director}</p>
                      </div>
                    )}
                    {media.cast && media.cast.length > 0 && (
                      <div>
                        <p className="text-netflix-gray">Reparto principal</p>
                        <p className="text-netflix-white">{media.cast.slice(0, 8).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Related Content */}
        {relatedMedia.length > 0 && (
          <MovieRow
            title="Más como esto"
            items={relatedMedia}
            onItemClick={(item) => window.location.href = `/watch/${item.id}`}
          />
        )}

        {/* Categories */}
        {getCategories().map((category) => (
          <MovieRow
            key={category.id}
            title={category.name}
            items={category.items.filter(m => m.id !== media.id)}
            onItemClick={(item) => window.location.href = `/watch/${item.id}`}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-netflix-gray/20 py-10 px-6">
        <div className="max-w-[1920px] mx-auto">
          <p className="text-netflix-gray text-sm mb-6">
            ¿Preguntas? Llama al <a href="tel:+123456789" className="text-netflix-white hover:text-netflix-red transition-colors underline">+1 234 567 89</a>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-netflix-gray mb-6">
            <a href="#" className="hover:text-netflix-white transition-colors">Preguntas frecuentes</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Centro de ayuda</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Cuenta</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Prensa</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Relaciones con inversores</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Empleo</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Canjear tarjetas regalo</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Comprar tarjetas regalo</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Formas de ver</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Términos de uso</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Preferencias de cookies</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Información corporativa</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Contáctanos</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Test de velocidad</a>
            <a href="#" className="hover:text-netflix-white transition-colors">Avisos legales</a>
          </div>
          <p className="text-netflix-gray text-sm">PyFlix España</p>
        </div>
      </footer>
    </div>

    {showPlayer && (
      <Player
        media={media}
        episode={currentEpisode || undefined}
        onClose={handleClosePlayer}
        onNextEpisode={handleNextEpisode}
        onPreviousEpisode={handlePreviousEpisode}
        autoPlay
      />
    )}
    </>
  );
}