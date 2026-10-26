import type { ContinueWatching, Episode } from './types';

const STORAGE_KEY = 'pyflix_continue_watching';

export function getContinueWatching(): ContinueWatching[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveContinueWatching(item: ContinueWatching) {
  try {
    const current = getContinueWatching();
    const filtered = current.filter((c) => !(c.mediaId === item.mediaId && c.profileId === item.profileId));
    filtered.unshift(item);
    // Limitar a los últimos 10 para no llenar el storage
    const limited = filtered.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch {
    // Silenciar errores de storage
  }
}

export function removeContinueWatching(mediaId: string) {
  try {
    const current = getContinueWatching();
    const filtered = current.filter((c) => c.mediaId !== mediaId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Silenciar
  }
}
