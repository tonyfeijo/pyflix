import { NextResponse } from 'next/server';
import {
  getJellyfinConfig,
  jellyfinEnvNames,
  jellyfinFetch,
  mapJellyfinItem,
  mapJellyfinEpisode,
  JELLYFIN_FIELDS,
  type JellyfinItemsResponse,
} from '@/lib/jellyfin';
import type { Episode, MediaItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EPISODE_FIELDS = 'Overview,RunTimeTicks,ImageTags';

/**
 * Importa el catálogo de Jellyfin.
 * Requiere las variables de entorno JELLYFIN_URL y JELLYFIN_API_KEY.
 */
export async function POST() {
  const config = getJellyfinConfig();

  if (!config) {
    // Diagnóstico: indica exactamente qué variable falta y en qué despliegue estamos.
    const missing = [
      process.env.JELLYFIN_URL?.trim() ? null : 'JELLYFIN_URL',
      process.env.JELLYFIN_API_KEY?.trim() ? null : 'JELLYFIN_API_KEY',
    ].filter((name): name is string => Boolean(name));

    return NextResponse.json(
      {
        success: false,
        message: `Falta configurar Jellyfin. Variable(s) sin definir: ${missing.join(
          ' y '
        )}. Añádelas en Vercel → Settings → Environment Variables (Producción) y vuelve a desplegar.`,
        missing,
        /** Solo nombres, nunca valores: sirve para detectar erratas al guardarlas. */
        jellyfinEnvNames: jellyfinEnvNames(),
        vercelEnv: process.env.VERCEL_ENV ?? 'local',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      },
      { status: 400 }
    );
  }

  try {
    const library = await jellyfinFetch<JellyfinItemsResponse>(
      config,
      `/Items?IncludeItemTypes=Movie,Series&Recursive=true&Fields=${JELLYFIN_FIELDS}` +
        '&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop' +
        '&SortBy=SortName&SortOrder=Ascending&Limit=300'
    );

    const items = library.Items ?? [];
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
      movies,
    });
  } catch (error) {
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
}
