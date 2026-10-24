import { NextRequest, NextResponse } from 'next/server';
import { getJellyfinConfig } from '@/lib/jellyfin';

export const dynamic = 'force-dynamic';

const ID_PATTERN = /^[a-f0-9]{32}$/i;

/**
 * Proxy de subtítulos de Jellyfin.
 *
 * La etiqueta <track> del navegador no puede enviar la cabecera con la API key,
 * así que este endpoint pide el subtítulo al servidor, lo convierte a WebVTT
 * (Jellyfin lo hace por nosotros) y lo devuelve al reproductor.
 */
export async function GET(request: NextRequest) {
  const config = getJellyfinConfig();
  if (!config) {
    return new NextResponse('Jellyfin no configurado', { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ?? '';
  const source = searchParams.get('source') ?? '';
  const index = Number.parseInt(searchParams.get('index') ?? '', 10);

  if (!ID_PATTERN.test(id)) {
    return new NextResponse('Identificador inválido', { status: 400 });
  }
  if (!Number.isInteger(index) || index < 0) {
    return new NextResponse('Índice de subtítulo inválido', { status: 400 });
  }
  if (source && !ID_PATTERN.test(source)) {
    return new NextResponse('Origen inválido', { status: 400 });
  }

  // Sin "source" Jellyfin usa el primer origen del título.
  const sourceSegment = source || '-';
  const path = `/Videos/${id}/${sourceSegment}/Subtitles/${index}/Stream.vtt`;

  try {
    const upstream = await fetch(`${config.url}${path}`, {
      headers: {
        'X-Emby-Token': config.apiKey,
        Accept: 'text/vtt',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse('Subtítulo no disponible', { status: upstream.status });
    }

    let body = await upstream.text();

    // Algunos códecs llegan sin la cabecera obligatoria de WebVTT.
    if (!body.trimStart().startsWith('WEBVTT')) {
      body = `WEBVTT\n\n${body}`;
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/vtt; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error al obtener subtítulo de Jellyfin:', error);
    return new NextResponse('Error al obtener el subtítulo', { status: 502 });
  }
}
