export type { MediaItem, Category, UserProfile, Episode, ContinueWatching } from '@/lib/types';
import type { MediaItem, Category, UserProfile, Episode } from '@/lib/types';

export const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Tony',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tony&backgroundColor=000000,e50914,141414',
    isKids: false,
    language: 'es',
    maturityRating: 'TV-MA',
  },
  {
    id: '2',
    name: 'Kids',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kids&backgroundColor=000000,e50914,141414',
    isKids: true,
    language: 'es',
    maturityRating: 'PG',
  },
  {
    id: '3',
    name: 'Invitado',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=000000,e50914,141414',
    isKids: false,
    language: 'es',
    maturityRating: 'TV-14',
  },
];

// Helper functions
export function getCustomSyncedMovies(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pyflix_synced_movies');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllMedia(): MediaItem[] {
  // Solo catalogo real: lo importado de Jellyfin (o de Internet Archive).
  // Ya no se mezcla el catalogo de demostracion.
  return getCustomSyncedMovies();
}

/** Catalogo principal: peliculas y series (sin clips, cortos ni documentales). */
export function getMainCatalog(): MediaItem[] {
  return getAllMedia().filter(item => !item.collection);
}

/** Titulos de una seccion especial (videoclips, cortos nacionales, documentales). */
export function getCollection(kind: NonNullable<MediaItem['collection']>): MediaItem[] {
  return getAllMedia().filter(item => item.collection === kind);
}

export function getMediaById(id: string): MediaItem | undefined {
  return getAllMedia().find(item => item.id === id);
}

export function getMediaByType(type: 'movie' | 'series'): MediaItem[] {
  return getMainCatalog().filter(item => item.type === type);
}

export function getTrendingMedia(): MediaItem[] {
  const all = getMainCatalog();
  const flagged = all.filter(item => item.isTrending);
  if (flagged.length > 0) return flagged;
  // Con catalogo real no hay marca de "tendencia": ordenamos por nota.
  return [...all].sort((a, b) => (b.match || 0) - (a.match || 0));
}

export function getNewReleases(): MediaItem[] {
  const all = getMainCatalog();
  const flagged = all.filter(item => item.isNew);
  if (flagged.length > 0) return flagged;
  // Los mas recientes primero (ano de estreno).
  return [...all].sort((a, b) => (b.year || 0) - (a.year || 0));
}

export function getTopRated(): MediaItem[] {
  return [...getMainCatalog()].sort((a, b) => (b.match || 0) - (a.match || 0));
}

export function getTop10(): MediaItem[] {
  // Mejor valorados primero: con catalogo real no hay un ranking de popularidad.
  return [...getMainCatalog()].sort((a, b) => (b.match || 0) - (a.match || 0)).slice(0, 10);
}

export function getContinueWatching(profileId: string): MediaItem[] {
  return getAllMedia().slice(0, 5).map(item => ({ ...item, match: 90 + Math.floor(Math.random() * 10) }));
}

export function getMyList(): MediaItem[] {
  return getAllMedia().slice(4, 12);
}

export function getCategories(): Category[] {
  // Orden preferido para las filas clásicas; el resto de géneros van después.
  const preferred = [
    'Acción', 'Aventura', 'Animación', 'Comedia', 'Crimen',
    'Drama', 'Fantasía', 'Terror', 'Misterio', 'Ciencia Ficción', 'Thriller'
  ];

  const all = getMainCatalog();
  const present = new Set<string>();
  for (const item of all) {
    for (const genre of item.genre) {
      if (genre && genre !== 'General') present.add(genre);
    }
  }

  const ordered = [
    ...preferred.filter(genre => present.has(genre)),
    ...[...present]
      .filter(genre => !preferred.includes(genre))
      .sort((a, b) => a.localeCompare(b, 'es')),
  ];

  return ordered.map(genre => ({
    id: genre.toLowerCase().replace(/\s+/g, '-'),
    name: genre,
    items: all.filter(item => item.genre.includes(genre)),
  })).filter(cat => cat.items.length > 0);
}

export function searchMedia(query: string): MediaItem[] {
  const all = getAllMedia();
  if (!query || !query.trim()) return all;
  const lowerQuery = query.toLowerCase().trim();
  return all.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.genre.some(g => g.toLowerCase().includes(lowerQuery)) ||
    item.cast?.some(c => c.toLowerCase().includes(lowerQuery)) ||
    item.director?.toLowerCase().includes(lowerQuery)
  );
}
