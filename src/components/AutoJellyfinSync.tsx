'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notifyCatalogUpdated } from '@/lib/catalog-events';
import {
  getSyncedSignature,
  saveSyncedMovies,
  setSyncedSignature,
} from '@/lib/synced-catalog';

/** Cada cuánto se pregunta a Jellyfin si hay contenido nuevo (solo pestaña visible). */
const POLL_INTERVAL_MS = 60_000;
/** Tiempo que se muestra el aviso de "catálogo actualizado". */
const TOAST_MS = 6_000;

type Status = 'idle' | 'syncing' | 'done' | 'error';

/**
 * Mantiene el catálogo al día sin que el usuario haga nada:
 *
 * - Al abrir PyFlix comprueba si cambió el catálogo de Jellyfin.
 * - Mientras la pestaña está visible, vuelve a comprobarlo cada minuto.
 * - Si hay contenido nuevo, lo importa y **actualiza la página en caliente**
 *   (sin recargar), así que las filas nuevas aparecen solas.
 *
 * Se salta las páginas de reproducción para no interrumpir un vídeo.
 */
export default function AutoJellyfinSync() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (pathname?.startsWith('/watch')) return;

    let cancelled = false;
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    const showDone = () => {
      setStatus('done');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        if (!cancelled) setStatus('idle');
      }, TOAST_MS);
    };

    const check = async () => {
      try {
        const infoResponse = await fetch('/api/jellyfin/sync', { cache: 'no-store' });
        if (cancelled || !infoResponse.ok) return;

        const info = await infoResponse.json();
        if (cancelled || !info?.success || !info.signature) return;

        // Nada nuevo en Jellyfin: no tocamos nada.
        if (getSyncedSignature() === info.signature) return;

        setStatus('syncing');
        const syncResponse = await fetch('/api/jellyfin/sync', { method: 'POST' });
        if (cancelled) return;

        const payload = await syncResponse.json();
        if (cancelled) return;

        if (!payload?.success) {
          setStatus('error');
          return;
        }

        saveSyncedMovies(payload.movies, 'replace');
        setSyncedSignature(info.signature);
        // Refresca la interfaz en caliente: sin recargar y sin cortar la reproducción.
        notifyCatalogUpdated();
        showDone();
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void check();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void check();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [pathname]);

  if (status !== 'syncing' && status !== 'done') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2 text-xs font-medium text-zinc-200 shadow-lg"
    >
      {status === 'syncing'
        ? 'Actualizando catálogo desde Jellyfin…'
        : '✓ Catálogo actualizado con contenido nuevo'}
    </div>
  );
}
