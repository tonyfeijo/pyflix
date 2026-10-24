'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  getSyncedSignature,
  saveSyncedMovies,
  setSyncedSignature,
} from '@/lib/synced-catalog';

/** Evita repetir la comprobación varias veces en la misma sesión del navegador. */
const SESSION_FLAG = 'pyflix_jellyfin_checked';

type Status = 'idle' | 'checking' | 'syncing' | 'error';

/**
 * Mantiene el catálogo al día sin intervención:
 * al abrir PyFlix pregunta a Jellyfin si cambió algo y, si es así, reimporta.
 *
 * Se salta las páginas de reproducción para no interrumpir un vídeo.
 */
export default function AutoJellyfinSync() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (pathname?.startsWith('/watch')) return;

    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, '1');
    } catch {
      /* sessionStorage bloqueado: seguimos igualmente */
    }

    let cancelled = false;
    setStatus('checking');

    const run = async () => {
      try {
        const infoResponse = await fetch('/api/jellyfin/sync', { cache: 'no-store' });
        if (cancelled || !infoResponse.ok) {
          if (!cancelled) setStatus('idle');
          return;
        }

        const info = await infoResponse.json();
        if (cancelled || !info?.success || !info.signature) {
          if (!cancelled) setStatus('idle');
          return;
        }

        // Nada nuevo en Jellyfin: no tocamos nada.
        if (getSyncedSignature() === info.signature) {
          if (!cancelled) setStatus('idle');
          return;
        }

        setStatus('syncing');
        const syncResponse = await fetch('/api/jellyfin/sync', { method: 'POST' });
        if (cancelled) return;

        const payload = await syncResponse.json();
        if (!payload?.success) {
          setStatus('error');
          return;
        }

        saveSyncedMovies(payload.movies, 'replace');
        setSyncedSignature(info.signature);
        window.location.reload();
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (status !== 'checking' && status !== 'syncing') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2 text-xs font-medium text-zinc-200 shadow-lg"
    >
      {status === 'syncing'
        ? 'Actualizando catálogo desde Jellyfin…'
        : 'Comprobando novedades…'}
    </div>
  );
}
