import { NextRequest, NextResponse } from 'next/server';
import { getJellyfinConfig } from '@/lib/jellyfin';

export const dynamic = 'force-dynamic';

const ID_PATTERN = /^[a-f0-9]{32}$/i;

/**
 * Proxy de imágenes de Jellyfin.
 * Las carátulas pasan por aquí para no exponer la API key en el navegador
 * y para evitar tener que configurar dominios remotos en next.config.js.
 */
export async function GET(request: NextRequest) {
  const config = getJellyfinConfig();
  if (!config) {
    return new NextResponse('Jellyfin no configurado', { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ?? '';
  const type = searchParams.get('type') === 'Backdrop' ? 'Backdrop' : 'Primary';
  const index = Math.max(0, Number.parseInt(searchParams.get('index') ?? '0', 10) || 0);
  const width = Math.min(
    1920,
    Math.max(64, Number.parseInt(searchParams.get('w') ?? '500', 10) || 500)
  );

  if (!ID_PATTERN.test(id)) {
    return new NextResponse('Identificador inválido', { status: 400 });
  }

  const path =
    type === 'Backdrop'
      ? `/Items/${id}/Images/Backdrop/${index}?maxWidth=${width}&quality=90`
      : `/Items/${id}/Images/Primary?maxWidth=${width}&quality=90`;

  try {
    const upstream = await fetch(`${config.url}${path}`, {
      headers: { 'X-Emby-Token': config.apiKey },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse('Imagen no encontrada', { status: upstream.status });
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error al obtener imagen de Jellyfin:', error);
    return new NextResponse('Error al obtener la imagen', { status: 502 });
  }
}
