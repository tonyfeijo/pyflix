import type { Episode, MediaItem, SubtitleTrack } from '@/lib/types';

export interface JellyfinConfig {
  url: string;
  /**
   * Token con el que se habla con Jellyfin: el de un usuario limitado si hay
   * credenciales configuradas, o la API key como último recurso.
   */
  token: string;
  /** true si el token es de un usuario sin privilegios (lo recomendado). */
  usingUserSession: boolean;
}

/**
 * URL pública por defecto (Tailscale Funnel de este servidor).
 * Se puede sobreescribir con la variable de entorno JELLYFIN_URL.
 * Es información pública: no contiene secretos.
 */
const DEFAULT_JELLYFIN_URL = 'https://jellyfin.tail331bc5.ts.net';

const isHttpUrl = (value: string): boolean => /^https?:\/\/[^\s]+$/i.test(value);

/**
 * Credenciales de un usuario de Jellyfin sin privilegios de administrador.
 *
 * Es la forma recomendada: el token que viaja al navegador (dentro de las URLs
 * de vídeo) no puede borrar archivos ni cambiar la configuración del servidor.
 */
function findJellyfinCredentials(): { username: string; password: string } | null {
  const username = (process.env.JELLYFIN_USER ?? process.env.JELLYFIN_USERNAME ?? '').trim();
  const password = process.env.JELLYFIN_PASSWORD ?? process.env.JELLYFIN_PW ?? '';
  if (!username || !password) return null;
  return { username, password };
}

/** Token ya emitido para el usuario limitado (evita autenticar en cada arranque). */
function findJellyfinUserToken(): string | undefined {
  const value = (process.env.JELLYFIN_USER_TOKEN ?? '').trim();
  return value && !isHttpUrl(value) ? value : undefined;
}

/** Cabecera que Jellyfin exige para autenticar por usuario. */
const AUTH_HEADER =
  'MediaBrowser Client="PyFlix", Device="Vercel", DeviceId="pyflix-server", Version="1.0.0"';

/** Vida del token en memoria; si Jellyfin lo revoca, se renueva solo. */
const SESSION_TTL_MS = 30 * 60 * 1000;

let cachedSession: { key: string; config: JellyfinConfig; expiresAt: number } | null = null;
let pendingSession: Promise<JellyfinConfig | null> | null = null;

/** Descarta el token cacheado (p. ej. tras un 401). */
export function invalidateJellyfinSession(): void {
  cachedSession = null;
}

async function createSession(): Promise<JellyfinConfig | null> {
  const url = findJellyfinUrl().replace(/\/+$/, '');

  // 1) Token de usuario ya emitido: no hace falta autenticar (ni enviar la
  //    contraseña) en cada petición. Es el modo preferido en producción.
  const userToken = findJellyfinUserToken();
  if (userToken) {
    return { url, token: userToken, usingUserSession: true };
  }

  const credentials = findJellyfinCredentials();
  if (!credentials) {
    const apiKey = findJellyfinApiKey();
    if (!apiKey) return null;
    return { url, token: apiKey, usingUserSession: false };
  }

  let res: Response;
  try {
    res = await fetch(`${url}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'X-Emby-Authorization': AUTH_HEADER,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ Username: credentials.username, Pw: credentials.password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    const cause = (error as { cause?: { code?: string; message?: string } }).cause;
    const detail = [cause?.code, cause?.message].filter(Boolean).join(' ');
    throw new Error(
      `No se pudo conectar con ${url}/Users/AuthenticateByName${detail ? ` (${detail})` : ''}`
    );
  }

  if (!res.ok) {
    throw new Error(
      `Jellyfin rechazó las credenciales de "${credentials.username}" (${res.status})`
    );
  }

  const data = (await res.json()) as { AccessToken?: string };
  if (!data.AccessToken) throw new Error('Jellyfin no devolvió un token de acceso');

  return { url, token: data.AccessToken, usingUserSession: true };
}

/**
 * Configuración lista para usar. Si hay credenciales de usuario se autentica con
 * ellas y cachea el token en memoria para no pedir uno nuevo en cada petición.
 */
export async function getJellyfinSession(): Promise<JellyfinConfig | null> {
  const url = findJellyfinUrl().replace(/\/+$/, '');
  const key = `${url}|${findJellyfinCredentials()?.username ?? 'api-key'}`;

  if (cachedSession && cachedSession.key === key && cachedSession.expiresAt > Date.now()) {
    return cachedSession.config;
  }
  if (!pendingSession) {
    pendingSession = createSession()
      .then((config) => {
        if (config) {
          cachedSession = { key, config, expiresAt: Date.now() + SESSION_TTL_MS };
        }
        return config;
      })
      .finally(() => {
        pendingSession = null;
      });
  }
  return pendingSession;
}


export interface JellyfinDiagnostics {
  hasUrl: boolean;
  urlValid: boolean;
  /** true si no hay JELLYFIN_URL válida y se usa la URL pública por defecto. */
  usingDefaultUrl: boolean;
  hasApiKey: boolean;
  /** true si hay usuario y contraseña de Jellyfin configurados (recomendado). */
  hasUserCredentials: boolean;
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
    hasUserCredentials: Boolean(findJellyfinUserToken() || findJellyfinCredentials()),
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
    (name) => !/(url|host|server)/i.test(name) && !/USER_TOKEN/i.test(name)
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
  /** Ruta del archivo: sirve para saber de qué carpeta viene. */
  Path?: string;
  MediaSources?: JellyfinMediaSource[];
}

export interface JellyfinMediaStream {
  Type?: string;
  Index?: number;
  Codec?: string;
  Language?: string;
  DisplayTitle?: string;
  IsExternal?: boolean;
}

export interface JellyfinMediaSource {
  Id?: string;
  MediaStreams?: JellyfinMediaStream[];
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
  'MediaSources',
  'Path',
].join(',');

/** Petición autenticada a la API de Jellyfin (lado servidor). */
export async function jellyfinFetch<T>(
  config: JellyfinConfig,
  path: string,
  allowRetry = true
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${config.url}${path}`, {
      headers: {
        'X-Emby-Token': config.token,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const cause = (error as { cause?: { code?: string; message?: string } }).cause;
    const detail = [cause?.code, cause?.message].filter(Boolean).join(' ');
    throw new Error(
      `No se pudo conectar con ${config.url}${detail ? ` (${detail})` : ''}`
    );
  }

  // Si el token caducó o se revocó, se pide uno nuevo y se reintenta una vez.
  if (res.status === 401 && allowRetry && config.usingUserSession) {
    invalidateJellyfinSession();
    const fresh = await getJellyfinSession();
    if (fresh) return jellyfinFetch(fresh, path, false);
  }

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
    api_key: config.token,
  });
  return `${config.url}/Videos/${itemId}/stream?${params.toString()}`;
}

/**
 * URL del proxy de subtítulos: la etiqueta <track> no puede enviar cabeceras,
 * así que el VTT se sirve desde nuestra propia ruta (que sí lleva la API key).
 */
export function subtitleProxyUrl(
  itemId: string,
  sourceId: string | undefined,
  index: number
): string {
  const params = new URLSearchParams({ id: itemId, index: String(index) });
  if (sourceId) params.set('source', sourceId);
  return `/api/jellyfin/subtitles?${params.toString()}`;
}

/**
 * Códecs de subtítulo que se pueden convertir a WebVTT.
 * Los de imagen (DVDSUB, PGS, VOBSUB) se descartan: el navegador no los pinta.
 */
const TEXT_SUBTITLE_CODECS = new Set([
  'subrip',
  'srt',
  'ass',
  'ssa',
  'mov_text',
  'webvtt',
  'vtt',
  'ttml',
  'dfxp',
  'text',
  'microdvd',
  'subviewer',
  'sami',
  'smptett',
]);

/** Nombre legible del idioma a partir del código ISO ("spa" → "Español"). */
function languageLabel(code?: string, displayTitle?: string): string {
  if (code) {
    try {
      const name = new Intl.DisplayNames(['es'], { type: 'language' }).of(
        code.toLowerCase()
      );
      if (name && name.toLowerCase() !== code.toLowerCase()) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    } catch {
      /* código no reconocido: usamos el título de Jellyfin */
    }
  }
  return displayTitle || code || 'Subtítulos';
}

/** Extrae las pistas de subtítulo de texto del primer origen de vídeo. */
function mapSubtitles(item: JellyfinItem): SubtitleTrack[] {
  const source = item.MediaSources?.[0];
  if (!source) return [];

  const tracks: SubtitleTrack[] = [];
  for (const stream of source.MediaStreams ?? []) {
    if (stream.Type !== 'Subtitle' || stream.Index === undefined) continue;
    const codec = (stream.Codec ?? '').toLowerCase();
    if (codec && !TEXT_SUBTITLE_CODECS.has(codec)) continue;

    tracks.push({
      index: stream.Index,
      language: stream.Language ?? 'und',
      label: languageLabel(stream.Language, stream.DisplayTitle),
      url: subtitleProxyUrl(item.Id, source.Id, stream.Index),
    });
  }
  return tracks;
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

/**
 * Sección de PyFlix a la que pertenece un título.
 * Se deduce de la carpeta del archivo (Jellyfin no expone la biblioteca en el item).
 */
type CollectionKind = 'video-clips' | 'cortos-nacionales' | 'documentales';

function detectCollection(item: JellyfinItem): CollectionKind | undefined {
  const path = (item.Path ?? '').replace(/\//g, '\\').toLowerCase();

  if (path.includes('\\video clips\\') || path.includes('\\videoclips\\')) {
    return 'video-clips';
  }
  if (path.includes('\\cortos nacionales\\') || path.includes('\\cortos\\')) {
    return 'cortos-nacionales';
  }
  if (path.includes('\\documentales\\')) {
    return 'documentales';
  }
  // Biblioteca de vídeos caseros sin carpeta reconocible.
  if (item.Type === 'MusicVideo') return 'video-clips';
  return undefined;
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
    subtitles: isSeries ? undefined : mapSubtitles(item),
    collection: detectCollection(item),
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
    subtitles: mapSubtitles(item),
  };
}
