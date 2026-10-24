import type { Episode, MediaItem } from '@/lib/types';

export interface JellyfinConfig {
  url: string;
  apiKey: string;
}

/**
 * URL pública por defecto (Tailscale Funnel de este servidor).
 * Se puede sobreescribir con la variable de entorno JELLYFIN_URL.
 * Es información pública: no contiene secretos.
 */
const DEFAULT_JELLYFIN_URL = 'https://jellyfin.tail331bc5.ts.net';

const isHttpUrl = (value: string): boolean => /^https?:\/\/[^\s]+$/i.test(value);

/**
 * Lee la configuración desde variables de entorno (solo servidor).
 * Nunca uses NEXT_PUBLIC_* aquí: la API key no debe llegar al navegador.
 */
export function getJellyfinConfig(): JellyfinConfig | null {
  const url = findJellyfinUrl();
  const apiKey = findJellyfinApiKey();
  if (!url || !apiKey) return null;
  return { url: url.replace(/\/+$/, ''), apiKey };
}

export interface JellyfinDiagnostics {
  hasUrl: boolean;
  urlValid: boolean;
  /** true si no hay JELLYFIN_URL válida y se usa la URL pública por defecto. */
  usingDefaultUrl: boolean;
  hasApiKey: boolean;
  /** true si JELLYFIN_URL parece contener la API key (valores cruzados). */
  urlLooksLikeApiKey: boolean;
  /** true si la URL está en el campo de la clave y la clave en el de la URL. */
  valuesSwapped: boolean;
  envNames: string[];
}

export function jellyfinDiagnostics(): JellyfinDiagnostics {
  const rawUrl = process.env.JELLYFIN_URL?.trim();
  const apiKey = findJellyfinApiKey();
  const configuredUrl = findConfiguredUrl();
  const urlValid = Boolean(configuredUrl && isHttpUrl(configuredUrl));
  return {
    hasUrl: Boolean(configuredUrl),
    urlValid,
    usingDefaultUrl: !urlValid,
    hasApiKey: Boolean(apiKey),
    urlLooksLikeApiKey: Boolean(rawUrl && !isHttpUrl(rawUrl) && /^[a-f0-9]{24,}$/i.test(rawUrl)),
    valuesSwapped: Boolean(
      rawUrl && !isHttpUrl(rawUrl) && apiKey && isHttpUrl(apiKey)
    ),
    envNames: jellyfinEnvNames(),
  };
}

/** Nombres de variables relacionadas con Jellyfin presentes (nunca devuelve valores). */
export function jellyfinEnvNames(): string[] {
  return Object.keys(process.env).filter((name) => /jellyfin/i.test(name)).sort();
}

function jellyfinEnvNamesMatching(pattern: RegExp): string[] {
  return Object.keys(process.env).filter(
    (name) => /jellyfin/i.test(name) && pattern.test(name)
  );
}

/**
 * Busca la URL de Jellyfin. Acepta nombres alternativos, valores guardados por
 * error en el campo de la clave y, si no hay ninguno válido, la URL por defecto.
 */
function findConfiguredUrl(): string | undefined {
  const names = [
    'JELLYFIN_URL',
    ...jellyfinEnvNamesMatching(/(url|host|server)/i),
    ...jellyfinEnvNamesMatching(/(api[_\-\s]?key|apikey|key|token)/i),
  ];
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value && isHttpUrl(value)) return value;
  }
  return undefined;
}

function findJellyfinUrl(): string {
  const configured = findConfiguredUrl();
  if (configured) return configured;
  return process.env.JELLYFIN_URL?.trim() || DEFAULT_JELLYFIN_URL;
}

function findJellyfinApiKey(): string | undefined {
  const direct = process.env.JELLYFIN_API_KEY?.trim();
  if (direct && !isHttpUrl(direct)) return direct;

  // Tolera variantes habituales: JELLYFIN_APIKEY, jellyfin_api_key,
  // JELLYFIN_TOKEN, JELLYFIN_KEY, "JELLYFIN_API_KEY " (con espacio), etc.
  // Descarta valores que en realidad sean una URL (campos cruzados).
  const candidates = jellyfinEnvNamesMatching(/(api[_\-\s]?key|apikey|key|token)/i).filter(
    (name) => !/(url|host|server)/i.test(name)
  );

  for (const name of candidates) {
    const value = process.env[name]?.trim();
    if (value && !isHttpUrl(value)) return value;
  }
  return undefined;
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
  /** Fecha de alta en Jellyfin: se usa para detectar catálogo nuevo. */
  DateCreated?: string;
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
  'DateCreated',
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
