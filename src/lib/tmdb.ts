export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Devuelve la URL completa y limpia para cargar pósters o wallpapers de TMDB
 */
export function getTmdbImageUrl(
  path: string | null | undefined, 
  size: 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w780'
): string {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';

  // Si la cadena ya viene con el dominio completo, evita duplicados
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Asegura la barra inicial antes del path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}