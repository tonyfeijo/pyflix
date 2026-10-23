'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MovieRow } from '@/components/content/MovieRow';
import { mockMedia, searchMedia } from '@/lib/mock-data';
import type { MediaItem } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const debounced = setTimeout(() => {
      let filtered = searchMedia(query);
      
      if (selectedType !== 'all') {
        filtered = filtered.filter(m => m.type === selectedType);
      }
      
      if (selectedGenre !== 'all') {
        filtered = filtered.filter(m => m.genre.includes(selectedGenre));
      }
      
      setResults(filtered);
    }, 200);
    
    return () => clearTimeout(debounced);
  }, [query, selectedType, selectedGenre]);

  const genres = ['all', 'Acción', 'Aventura', 'Animación', 'Comedia', 'Crimen', 'Drama', 'Fantasía', 'Terror', 'Misterio', 'Ciencia Ficción', 'Thriller'];

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20" role="main">
        {/* Search Header */}
        <section className="px-6 pb-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-netflix-white mb-6">Buscar</h1>
            
            {/* Search Input */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-netflix-gray" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar series, películas, actores, directores..."
                className="w-full pl-12 pr-12 py-4 bg-netflix-card border border-netflix-gray/20 rounded-xl text-netflix-white placeholder-netflix-gray text-lg focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 focus:outline-none transition-all duration-200"
                autoFocus
                aria-label="Buscar contenido"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-netflix-gray hover:text-netflix-white hover:bg-netflix-gray/20 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
                <ChevronDown className={showFilters ? 'rotate-180' : ''} />
              </button>
              
              {results.length > 0 && (
                <span className="text-netflix-lightGray text-sm">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-2xl p-4 mb-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-netflix-lightGray mb-2">Tipo</label>
                      <div className="flex gap-2">
                        {['all', 'movie', 'series'].map(type => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type as 'all' | 'movie' | 'series')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedType === type
                                ? 'bg-netflix-red text-netflix-white'
                                : 'bg-netflix-card text-netflix-lightGray hover:text-netflix-white hover:bg-netflix-gray/10'
                            }`}
                          >
                            {type === 'all' ? 'Todos' : type === 'movie' ? 'Películas' : 'Series'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-netflix-lightGray mb-2">Género</label>
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="w-full bg-netflix-card border border-netflix-gray/30 rounded-lg px-4 py-2 text-netflix-white focus:border-netflix-red focus:outline-none focus:ring-2 focus:ring-netflix-red/20"
                      >
                        <option value="all">Todos los géneros</option>
                        {genres.filter(g => g !== 'all').map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Results */}
        <section className="px-6">
          {query ? (
            results.length > 0 ? (
              <>
                {/* Separate movies and series */}
                {results.filter(m => m.type === 'movie').length > 0 && (
                  <MovieRow
                    title="Películas"
                    items={results.filter(m => m.type === 'movie')}
                    onItemClick={(item) => window.location.href = `/watch/${item.id}`}
                  />
                )}
                
                {results.filter(m => m.type === 'series').length > 0 && (
                  <MovieRow
                    title="Series"
                    items={results.filter(m => m.type === 'series')}
                    onItemClick={(item) => window.location.href = `/watch/${item.id}`}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-netflix-gray/50 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-netflix-white mb-2">No se encontraron resultados</h2>
                <p className="text-netflix-gray">Intenta con otros términos de búsqueda</p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-netflix-gray/50 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-netflix-white mb-2">Busca tus series y películas favoritas</h2>
              <p className="text-netflix-gray">Escribe el título, actor, director o género</p>
            </div>
          )}
        </section>
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
          </div>
          <p className="text-netflix-gray text-sm">PyFlix España</p>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-netflix-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-netflix-gray border-t-netflix-red" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
