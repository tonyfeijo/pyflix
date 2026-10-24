'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/content/Hero';
import { MovieRow } from '@/components/content/MovieRow';
import { Top10Row } from '@/components/content/Top10Row';
import { DetailModal } from '@/components/content/DetailModal';
import { Player } from '@/components/content/Player';
import {
  getTrendingMedia,
  getNewReleases,
  getTopRated,
  getTop10,
  getCategories,
  getMediaByType,
  getMainCatalog,
  getCollection,
} from '@/lib/mock-data';
import { useWatchlist } from '@/lib/watchlist';
import { useCatalogVersion } from '@/lib/catalog-events';
import type { MediaItem, Episode } from '@/lib/types';
import { ListFilter } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get('type'); // 'series' | 'movie' | null
  const filterParam = searchParams.get('filter'); // 'new' | 'my-list' | null

  const [activeTab, setActiveTab] = useState<'all' | 'series' | 'movie' | 'new' | 'my-list'>('all');
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  // Detail Modal state
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Watchlist hook
  const { items: myWatchlistItems } = useWatchlist();

  // Se re-renderiza cuando llega catálogo nuevo desde Jellyfin (sin recargar).
  const catalogVersion = useCatalogVersion();

  // Sync activeTab with URL params
  useEffect(() => {
    if (typeParam === 'series') setActiveTab('series');
    else if (typeParam === 'movie') setActiveTab('movie');
    else if (filterParam === 'my-list') setActiveTab('my-list');
    else if (filterParam === 'new') setActiveTab('new');
    else setActiveTab('all');
  }, [typeParam, filterParam]);

  // Adjust featured item based on active tab
  useEffect(() => {
    let list: MediaItem[];
    if (activeTab === 'series') {
      list = getMediaByType('series');
    } else if (activeTab === 'movie') {
      list = getMediaByType('movie');
    } else {
      list = getMainCatalog();
    }
    // Preferimos un título con imagen de fondo real para el cartel grande.
    const withBackdrop = list.find(
      (item) => item.backdrop && !item.backdrop.includes('placeholder')
    );
    setFeaturedItem(withBackdrop ?? list[0] ?? null);
  }, [activeTab, catalogVersion]);

  const handlePlay = (media: MediaItem, episode?: Episode) => {
    setIsDetailOpen(false);
    setCurrentMedia(media);
    setCurrentEpisode(episode || (media.episodes && media.episodes[0]) || null);
    setShowPlayer(true);
  };

  const handleOpenDetail = (media: MediaItem) => {
    setDetailMedia(media);
    setIsDetailOpen(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setCurrentMedia(null);
    setCurrentEpisode(null);
  };

  const handleNextEpisode = () => {
    if (currentMedia?.episodes && currentEpisode) {
      const allEpisodes = currentMedia.episodes;
      const currentIndex = allEpisodes.findIndex(e => e.id === currentEpisode.id);
      if (currentIndex < allEpisodes.length - 1) {
        setCurrentEpisode(allEpisodes[currentIndex + 1]);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (currentMedia?.episodes && currentEpisode) {
      const allEpisodes = currentMedia.episodes;
      const currentIndex = allEpisodes.findIndex(e => e.id === currentEpisode.id);
      if (currentIndex > 0) {
        setCurrentEpisode(allEpisodes[currentIndex - 1]);
      }
    }
  };

  // Filter content collections
  const filterMedia = (items: MediaItem[]) => {
    if (activeTab === 'series') return items.filter(m => m.type === 'series');
    if (activeTab === 'movie') return items.filter(m => m.type === 'movie');
    return items;
  };

  const trending = filterMedia(getTrendingMedia());
  const newReleases = filterMedia(getNewReleases());
  const topRated = filterMedia(getTopRated());
  const top10 = filterMedia(getTop10());
  const categories = getCategories().map(cat => ({
    ...cat,
    items: filterMedia(cat.items),
  })).filter(cat => cat.items.length > 0);

  // Secciones especiales del catálogo real (Jellyfin).
  const videoClips = getCollection('video-clips');
  const cortosNacionales = getCollection('cortos-nacionales');
  const documentales = getCollection('documentales');

  return (
    <div className="min-h-screen bg-netflix-black text-white selection:bg-netflix-red selection:text-white pb-20">
      <Header />

      <main role="main">
        {/* Featured Hero Billboard */}
        {activeTab !== 'my-list' && featuredItem && (
          <Hero
            item={featuredItem}
            onPlay={() => handlePlay(featuredItem)}
            onMoreInfo={() => handleOpenDetail(featuredItem)}
          />
        )}

        {/* Catálogo vacío: no hay nada que mostrar todavía */}
        {activeTab !== 'my-list' && !featuredItem && (
          <div className="max-w-2xl mx-auto px-6 pt-40 pb-16 text-center">
            <ListFilter className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Tu catálogo está vacío</h1>
            <p className="text-neutral-400 text-sm mb-6">
              Todavía no hay títulos importados. Añade películas o series a Jellyfin y
              aparecerán aquí solas en menos de un minuto (PyFlix comprueba el servidor
              automáticamente).
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-netflix-red text-white font-bold rounded-lg hover:bg-netflix-redHover transition-colors shadow-lg"
            >
              Volver a comprobar
            </button>
          </div>
        )}

        {/* My List dedicated view if selected */}
        {activeTab === 'my-list' ? (
          <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 pt-28 md:pt-32 pb-12 min-h-[70vh]">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>Mi Lista</span>
              <span className="text-sm font-normal text-neutral-400">
                ({myWatchlistItems.length} título{myWatchlistItems.length !== 1 ? 's' : ''})
              </span>
            </h1>

            {myWatchlistItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myWatchlistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-white/10 hover:border-white/40 transition-all hover:scale-105 shadow-lg"
                  >
                    <img src={item.backdrop} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-green-400 font-semibold">{item.match}% coincidencia</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <ListFilter className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Tu lista está vacía</h2>
                <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
                  Añade series y películas a tu lista haciendo clic en el icono &quot;+&quot; para encontrarlas fácilmente aquí.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2.5 bg-netflix-red text-white font-bold rounded-lg hover:bg-netflix-redHover transition-colors shadow-lg"
                >
                  Explorar contenido
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 pt-4">
            {/* Top 10 Row (Netflix Trademark) */}
            {top10.length > 0 && activeTab === 'all' && (
              <Top10Row
                items={top10}
                onPlay={(item) => handlePlay(item)}
                onMoreInfo={(item) => handleOpenDetail(item)}
              />
            )}

            {/* Secciones especiales */}
            {videoClips.length > 0 && activeTab === 'all' && (
              <MovieRow
                title="Video clips"
                items={videoClips}
                onItemClick={handleOpenDetail}
                onPlay={handlePlay}
              />
            )}

            {cortosNacionales.length > 0 && activeTab === 'all' && (
              <MovieRow
                title="Cortos nacionales"
                items={cortosNacionales}
                onItemClick={handleOpenDetail}
                onPlay={handlePlay}
              />
            )}

            {/* La sección existe desde ya, aunque todavía no haya cortos. */}
            {cortosNacionales.length === 0 && activeTab === 'all' && featuredItem && (
              <section
                aria-label="Cortos nacionales"
                className="px-4 sm:px-8 md:px-12 pb-8 sm:pb-10"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-3">
                  Cortos nacionales
                </h2>
                <div className="rounded-xl border border-dashed border-white/15 bg-neutral-900/40 px-6 py-8 text-sm text-neutral-400">
                  Todavía no hay cortos. Añade tus archivos a la carpeta{' '}
                  <strong className="text-neutral-200">CORTOS NACIONALES</strong> del servidor
                  y aparecerán aquí solos en menos de un minuto.
                </div>
              </section>
            )}

            {documentales.length > 0 && activeTab === 'all' && (
              <MovieRow
                title="Documentales"
                items={documentales}
                onItemClick={handleOpenDetail}
                onPlay={handlePlay}
              />
            )}

            {/* My List Row on Home */}
            {myWatchlistItems.length > 0 && (
              <MovieRow
                title="Mi lista"
                items={myWatchlistItems}
                onItemClick={handleOpenDetail}
                onPlay={handlePlay}
              />
            )}

            {/* Trending Now */}
            <MovieRow
              title="Tendencias ahora"
              items={trending}
              onItemClick={handleOpenDetail}
              onPlay={handlePlay}
            />

            {/* Top Rated */}
            <MovieRow
              title="Aclamadas por la crítica"
              items={topRated}
              onItemClick={handleOpenDetail}
              onPlay={handlePlay}
            />

            {/* New Releases */}
            <MovieRow
              title="Nuevos lanzamientos"
              items={newReleases}
              onItemClick={handleOpenDetail}
              onPlay={handlePlay}
            />

            {/* Genre Categories Rows */}
            {categories.map((category) => (
              <MovieRow
                key={category.id}
                title={category.name}
                items={category.items}
                onItemClick={handleOpenDetail}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
      </main>

      {/* Netflix Interactive Detail Modal */}
      <DetailModal
        media={detailMedia}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onPlay={handlePlay}
      />

      {/* Fullscreen Video Player */}
      <AnimatePresence>
        {showPlayer && currentMedia && (
          <Player
            media={currentMedia}
            episode={currentEpisode || undefined}
            onClose={handleClosePlayer}
            onNextEpisode={handleNextEpisode}
            onPreviousEpisode={handlePreviousEpisode}
            autoPlay
          />
        )}
      </AnimatePresence>

      {/* Netflix Footer */}
      <footer className="border-t border-white/10 mt-20 pt-12 pb-16 px-4 sm:px-8 md:px-12 text-neutral-400 text-xs">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <p className="hover:underline cursor-pointer">
            ¿Preguntas? Llama al 900 866 500 (gratuito)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-neutral-400">
            <a href="#" className="hover:underline">Preguntas frecuentes</a>
            <a href="#" className="hover:underline">Centro de ayuda</a>
            <a href="#" className="hover:underline">Cuenta</a>
            <a href="#" className="hover:underline">Prensa</a>
            <a href="#" className="hover:underline">Relaciones con inversores</a>
            <a href="#" className="hover:underline">Empleo</a>
            <a href="#" className="hover:underline">Canjear tarjetas de regalo</a>
            <a href="#" className="hover:underline">Comprar tarjetas de regalo</a>
            <a href="#" className="hover:underline">Formas de ver</a>
            <a href="#" className="hover:underline">Términos de uso</a>
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Preferencias de cookies</a>
            <a href="#" className="hover:underline">Información corporativa</a>
            <a href="#" className="hover:underline">Contáctanos</a>
            <a href="#" className="hover:underline">Prueba de velocidad</a>
            <a href="#" className="hover:underline">Avisos legales</a>
          </div>

          <div className="pt-4">
            <span className="px-3 py-1.5 border border-white/20 rounded bg-black text-neutral-300">
              Español
            </span>
          </div>

          <p className="text-[11px] text-neutral-400">
            PyFlix - Clon Open Source inspirado en el diseño y la experiencia de usuario de Netflix. Todos los vídeos y recursos son Creative Commons y de libre uso.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-netflix-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-netflix-gray border-t-netflix-red" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
