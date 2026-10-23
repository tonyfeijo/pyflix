import type { MediaItem } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  14: 'Fantasía',
  27: 'Terror',
  9648: 'Misterio',
  878: 'Ciencia Ficción',
  53: 'Thriller',
  10752: 'Bélico',
  37: 'Western',
};

export function formatTMDBItem(item: TMDBMovie, mediaType: 'movie' | 'series' = 'movie'): MediaItem {
  const title = item.title || item.name || 'Sin título';
  const yearStr = item.release_date || item.first_air_date || '2024';
  const year = parseInt(yearStr.split('-')[0], 10) || 2024;
  const match = Math.min(99, Math.max(70, Math.round(item.vote_average * 10)));
  const genres = (item.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean);

  return {
    id: `tmdb-${item.id}`,
    title,
    type: mediaType,
    genre: genres.length > 0 ? genres : ['General'],
    year,
    rating: item.vote_average > 7.5 ? 'TV-MA' : 'TV-14',
    duration: mediaType === 'series' ? 'Serie TV' : '2h 10m',
    description: item.overview || 'Sin descripción disponible actualmente.',
    thumbnail: item.poster_path ? `${IMAGE_BASE_URL}/w780${item.poster_path}` : 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}/w1920${item.backdrop_path}` : 'https://image.tmdb.org/t/p/w1920/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    match,
    isTrending: item.vote_average > 7,
  };
}

export async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!TMDB_API_KEY) {
    return null;
  }

  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'es-ES',
    ...params,
  });

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
  return res.json();
}
