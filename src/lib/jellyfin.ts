import type { Episode, MediaItem } from '@/lib/types';

export interface JellyfinConfig {
  url: string;
  apiKey: string;
}

/**
 * Lee la configuración desde variables de entorno (solo servidor).
 * Nunca uses NEXT_PUBLIC_* aquí: la API key no debe llegar al navegador.
 */
export function getJellyfinConfig(): JellyfinConfig | null {
  const url = process.env.JELLYFIN_URL?.trim();
  const apiKey = process.env.JELLYFIN_API_KEY?.trim();
  if (!url || !apiKey) return null;
  return { url: url.replace(/\/+$/, ''), apiKey };
}

export interface JellyfinItem {
  Id: string;
  Name: string;
  Type?: string;
  Overview?: string;
  ProductionYear?: number;
  OfficialRating?: string;
  CommunityRating?: number;
  RunTimeTicks?: number;
  ChildCount?: number;
  IndexNumber?: number;
  ParentIndexNumber?: number;
  Genres?: string[];
  ImageTags?: Record<string, string>;
  BackdropImageTags?: string[];
  People?: Array<{ Name: string; Type: string }>;
}

export interface JellyfinItemsResponse {
  Items?: JellyfinItem[];
  TotalRecordCount?: number;
}

export const JELLYFIN_FIELDS = [
  'Overview',
  'Genres',
  'ProductionYear',
  'OfficialRating',
  'CommunityRating',
  'RunTimeTicks',
  'People',
  'ChildCount',
  'ImageTags',
  'BackdropImageTags',
].join(',');

/** Petición autenticada a la API de Jellyfin (lado servidor). */
export async function jellyfinFetch<T>(
  config: JellyfinConfig,
  path: string
): Promise<T> {
  const res = await fetch(`${config.url}${path}`, {
    headers: {
      'X-Emby-Token': config.apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`Jellyfin respondió ${res.status} en ${path}`);
  }

  return (await res.json()) as T;
}

/** URL relativa al proxy de imágenes de PyFlix (evita exponer la API key). */
export function imageProxyUrl(
  itemId: string,
  type: 'Primary' | 'Backdrop',
  width = 500,
  index = 0
): string {
  const params = new URLSearchParams({
    id: itemId,
    type,
    w: String(width),
  });
  if (type === 'Backdrop') params.set('index', String(index));
  return `/api/jellyfin/image?${params.toString()}`;
}

/** URL de reproducción directa desde Jellyfin. */
export function streamUrl(config: JellyfinConfig, itemId: string): string {
  const params = new URLSearchParams({
    static: 'true',
    api_key: config.apiKey,
  });
  return `${config.url}/Videos/${itemId}/stream?${params.toString()}`;
}

const TICKS_PER_SECOND = 10_000_000;

export function formatRuntime(ticks?: number): string {
  if (!ticks || ticks <= 0) return 'Duración desconocida';
  const totalMinutes = Math.round(ticks / TICKS_PER_SECOND / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function pickImage(item: JellyfinItem, type: 'Primary' | 'Backdrop', width: number): string {
  const hasPrimary = Boolean(item.ImageTags?.Primary);
  const hasBackdrop = Boolean(item.BackdropImageTags?.length);

  if (type === 'Backdrop' && hasBackdrop) {
    return imageProxyUrl(item.Id, 'Backdrop', width, 0);
  }
  if (hasPrimary) {
    return imageProxyUrl(item.Id, 'Primary', width);
  }
  if (hasBackdrop) {
    return imageProxyUrl(item.Id, 'Backdrop', width, 0);
  }
  return type === 'Backdrop' ? '/placeholder-backdrop.png' : '/placeholder-poster.png';
}

export function mapJellyfinItem(
  item: JellyfinItem,
  config: JellyfinConfig,
  episodes?: Episode[]
): MediaItem {
  const isSeries = item.Type === 'Series';
  const people = item.People ?? [];
  const directors = people.filter((p) => p.Type === 'Director').map((p) => p.Name);
  const score = item.CommunityRating ? Math.min(99, Math.round(item.CommunityRating * 10)) : undefined;

  const seasons = episodes?.length
    ? new Set(episodes.map((episode) => episode.season)).size
    : item.ChildCount ?? 0;

  const duration = isSeries
    ? seasons > 0
      ? `${seasons} Temporada${seasons === 1 ? '' : 's'}`
      : 'Serie'
    : formatRuntime(item.RunTimeTicks);

  return {
    id: `jf-${item.Id}`,
    title: item.Name,
    type: isSeries ? 'series' : 'movie',
    genre: item.Genres?.length ? item.Genres : ['General'],
    year: item.ProductionYear ?? 0,
    rating: item.OfficialRating || 'NR',
    duration,
    description: item.Overview || 'Sin sinopsis disponible.',
    thumbnail: pickImage(item, 'Primary', 500),
    backdrop: pickImage(item, 'Backdrop', 1280),
    videoUrl: isSeries ? undefined : streamUrl(config, item.Id),
    match: score,
    cast: people.filter((p) => p.Type === 'Actor').map((p) => p.Name).slice(0, 8),
    director: directors[0],
    episodes,
  };
}

export function mapJellyfinEpisode(
  item: JellyfinItem,
  config: JellyfinConfig,
  fallbackImage: string
): Episode {
  return {
    id: `jf-${item.Id}`,
    season: item.ParentIndexNumber ?? 1,
    episode: item.IndexNumber ?? 1,
    title: item.Name,
    description: item.Overview || '',
    duration: formatRuntime(item.RunTimeTicks),
    thumbnail: item.ImageTags?.Primary
      ? imageProxyUrl(item.Id, 'Primary', 500)
      : fallbackImage,
    videoUrl: streamUrl(config, item.Id),
  };
}
