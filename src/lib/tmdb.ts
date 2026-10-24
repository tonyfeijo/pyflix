export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Devuelve la URL completa y limpia para cargar pósters o wallpapers de TMDB
 */
export function getTmdbImageUrl(
  path: string | null | undefined, 
  size: 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w780'
): string {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';

  // Evita duplicaciones de https:// si el path ya trae la URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

/**
 * Obtiene los metadatos de una película desde la API de TMDB (soporta título y año opcional)
 */
export async function getMovieMetadataFromTMDB(query: string, year?: string | number) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ No se encontró la API Key de TMDB');
    return null;
  }

  try {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=es-ES`;
    if (year) {
      url += `&year=${year}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) return null;

    const data = await res.json();
    const movie = data.results?.[0];

    if (!movie) return null;

    return {
      title: movie.title,
      overview: movie.overview,
      posterPath: getTmdbImageUrl(movie.poster_path, 'w500'),
      backdropPath: getTmdbImageUrl(movie.backdrop_path, 'w1280'),
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
    };
  } catch (error) {
    console.error('Error al consultar TMDB:', error);
    return null;
  }
}