export const SYNCED_CATALOG_KEY = 'pyflix_synced_movies';
export const SYNC_SIGNATURE_KEY = 'pyflix_jellyfin_signature';

/** Prefijo de los ids que vienen de Jellyfin (ver mapJellyfinItem). */
const JELLYFIN_ID_PREFIX = 'jf-';

interface Identifiable {
  id?: unknown;
}

function readStoredCatalog(): unknown[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNCED_CATALOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Guarda el catálogo importado en localStorage.
 *
 * - `merge`: añade/actualiza por id, conservando lo que ya había.
 * - `replace`: sustituye por completo lo importado de Jellyfin (ids `jf-`),
 *   de modo que lo borrado en el servidor también desaparece de PyFlix.
 */
export function saveSyncedMovies(
  incoming: unknown,
  mode: 'merge' | 'replace' = 'merge'
): void {
  if (!Array.isArray(incoming) || incoming.length === 0) return;

  try {
    const existing = readStoredCatalog();
    const byId = new Map<string, unknown>();

    for (const item of existing) {
      const id = (item as Identifiable)?.id;
      if (id === undefined) continue;
      const asString = String(id);
      if (mode === 'replace' && asString.startsWith(JELLYFIN_ID_PREFIX)) continue;
      byId.set(asString, item);
    }

    for (const item of incoming) {
      const id = (item as Identifiable)?.id;
      if (id === undefined) continue;
      byId.set(String(id), item);
    }

    localStorage.setItem(SYNCED_CATALOG_KEY, JSON.stringify([...byId.values()]));
  } catch (error) {
    console.error('No se pudo guardar el catálogo sincronizado:', error);
  }
}

/** Firma del catálogo de Jellyfin en el último import (para detectar cambios). */
export function getSyncedSignature(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SYNC_SIGNATURE_KEY);
  } catch {
    return null;
  }
}

export function setSyncedSignature(signature: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_SIGNATURE_KEY, signature);
  } catch {
    /* almacenamiento lleno o bloqueado: no es crítico */
  }
}
