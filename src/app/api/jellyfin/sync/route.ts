import { NextResponse } from 'next/server';
import {
  getJellyfinSession,
  jellyfinDiagnostics,
  jellyfinFetch,
  mapJellyfinItem,
  mapJellyfinEpisode,
  JELLYFIN_FIELDS,
  type JellyfinConfig,
  type JellyfinItem,
  type JellyfinItemsResponse,
} from '@/lib/jellyfin';
import type { Episode, MediaItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EPISODE_FIELDS = 'Overview,RunTimeTicks,ImageTags,MediaSources';

/** Páginas de 200: Jellyfin devuelve mucho más rápido que pidiendo todo de golpe. */
const PAGE_SIZE = Number(process.env.JELLYFIN_PAGE_SIZE) || 200;
/** Tope de seguridad para no encadenar peticiones sin fin. */
const MAX_ITEMS = 20000;

/** Respuesta de error de configuración, con diagnóstico claro (nunca valores). */
function configErrorResponse() {
  const diag = jellyfinDiagnostics();
  const missing = [
    diag.hasUrl ? null : 'JELLYFIN_URL',
    diag.hasUserCredentials || diag.hasApiKey ? null : 'JELLYFIN_USER y JELLYFIN_PASSWORD',
  ].filter((name): name is string => Boolean(name));

  let message: string;
  if (missing.length > 0) {
    message = `Falta configurar Jellyfin. Variable(s) sin definir: ${missing.join(
      ' y '
    )}. Añádelas en Vercel → Settings → Environment Variables (Producción) y vuelve a desplegar.`;
  } else if (diag.urlLooksLikeApiKey) {
    message =
      'JELLYFIN_URL contiene la API key en vez de la dirección del servidor. ' +
      'Debe ser la URL pública de Jellyfin, por ejemplo https://jellyfin.tail331bc5.ts.net (sin barra final).';
  } else {
    message =
      'JELLYFIN_URL no es una URL válida: debe empezar por http:// o https:// y no tener espacios ni barra final.';
  }

  return NextResponse.json(
    {
      success: false,
      message,
      missing,
      ...diag,
      vercelEnv: process.env.VERCEL_ENV ?? 'local',
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    },
    { status: 400 }
  );
}

/**
 * Firma compacta del catálogo: número de títulos + fecha del último añadido.
 * Si cambia, hay contenido nuevo (o borrado) en Jellyfin.
 */
function catalogSignature(total: number, items: JellyfinItem[]): string {
  let latest = '';
  for (const item of items) {
    if (item.DateCreated && item.DateCreated > latest) latest = item.DateCreated;
  }
  return `${total}:${latest}`;
}

function connectionErrorResponse(error: unknown) {
  console.error('Error al sincronizar con Jellyfin:', error);
  const detail = error instanceof Error ? error.message : 'Error desconocido';
  return NextResponse.json(
    {
      success: false,
      message: `No se pudo conectar con Jellyfin. Revisa que JELLYFIN_URL sea accesible desde internet y que la API key sea válida. Detalle: ${detail}`,
    },
    { status: 502 }
  );
}

/** Falla al autenticar como usuario limitado (credenciales incorrectas o red). */
function sessionErrorResponse(error: unknown) {
  console.error('Error al autenticar con Jellyfin:', error);
  const detail = error instanceof Error ? error.message : 'Error desconocido';
  return NextResponse.json(
    {
      success: false,
      message: `No se pudo autenticar con el usuario de Jellyfin. Revisa JELLYFIN_USER y JELLYFIN_PASSWORD. Detalle: ${detail}`,
    },
    { status: 502 }
  );
}

/**
 * Estado del catálogo (consulta baratísima, 1 elemento).
 * El navegador la usa para saber si hay que reimportar al abrir PyFlix.
 */
export async function GET() {
  let config;
  try {
    config = await getJellyfinSession();
  } catch (error) {
    return sessionErrorResponse(error);
  }
  if (!config) return configErrorResponse();

  try {
    const page = await jellyfinFetch<JellyfinItemsResponse>(
      config,
      '/Items?IncludeItemTypes=Movie,Series,Video,MusicVideo&Recursive=true&Limit=1' +
        '&SortBy=DateCreated&SortOrder=Descending&Fields=DateCreated'
    );

    const total = page.TotalRecordCount ?? 0;
    const latest = page.Items?.[0]?.DateCreated ?? '';

    return NextResponse.json({
      success: true,
      count: total,
      latest,
      signature: `${total}:${latest}`,
    });
  } catch (error) {
    return connectionErrorResponse(error);
  }
}

/**
 * Importa el catálogo completo de Jellyfin, paginando hasta el final
 * (antes se cortaba en 300 títulos).
 */
export async function POST() {
  let config;
  try {
    config = await getJellyfinSession();
  } catch (error) {
    return sessionErrorResponse(error);
  }
  if (!config) return configErrorResponse();

  try {
    const { items, total } = await fetchAllLibraryItems(config);
    const movies: MediaItem[] = [];

    for (const item of items) {
      let episodes: Episode[] | undefined;

      if (item.Type === 'Series') {
        try {
          const epData = await jellyfinFetch<JellyfinItemsResponse>(
            config,
            `/Shows/${item.Id}/Episodes?Fields=${EPISODE_FIELDS}&EnableImages=true&Limit=500`
          );

          const base = mapJellyfinItem(item, config);
          episodes = (epData.Items ?? []).map((ep) =>
            mapJellyfinEpisode(ep, config, base.backdrop)
          );
        } catch (error) {
          console.warn(`No se pudieron cargar episodios de "${item.Name}":`, error);
        }
      }

      movies.push(mapJellyfinItem(item, config, episodes));
    }

    return NextResponse.json({
      success: true,
      count: movies.length,
      signature: catalogSignature(total, items),
      movies,
    });
  } catch (error) {
    return connectionErrorResponse(error);
  }
}

/** Recorre la biblioteca página a página hasta tener todos los títulos. */
async function fetchAllLibraryItems(
  config: JellyfinConfig
): Promise<{ items: JellyfinItem[]; total: number }> {
  const items: JellyfinItem[] = [];
  let start = 0;
  let total = 0;

  while (start < MAX_ITEMS) {
    const page = await jellyfinFetch<JellyfinItemsResponse>(
      config,
      '/Items?IncludeItemTypes=Movie,Series,Video,MusicVideo&Recursive=true' +
        `&Fields=${JELLYFIN_FIELDS}` +
        '&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop' +
        `&SortBy=SortName&SortOrder=Ascending&Limit=${PAGE_SIZE}&StartIndex=${start}`
    );

    const batch = page.Items ?? [];
    total = page.TotalRecordCount ?? batch.length;
    items.push(...batch);

    if (batch.length === 0 || items.length >= total) break;
    start += batch.length;
  }

  return { items, total: Math.max(total, items.length) };
}
