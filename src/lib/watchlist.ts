'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MediaItem } from './types';
import { mockMedia } from './mock-data';

const STORAGE_KEY = 'pyflix_my_list';
const EVENT_NAME = 'pyflix_list_updated';

export function getStoredListIds(): string[] {
  if (typeof window === 'undefined') return ['1', '4', '8', '11'];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default sample items in my list
      const initial = ['1', '4', '8', '11'];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return ['1', '4', '8'];
  }
}

export function toggleStoredListId(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ids = getStoredListIds();
    const index = ids.indexOf(id);
    let added = false;
    if (index > -1) {
      ids.splice(index, 1);
      added = false;
    } else {
      ids.unshift(id);
      added = true;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(EVENT_NAME));
    return added;
  } catch {
    return false;
  }
}

export function useWatchlist() {
  const [listIds, setListIds] = useState<string[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);

  const syncList = useCallback(() => {
    const ids = getStoredListIds();
    setListIds(ids);
    const resolved = ids
      .map(id => mockMedia.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));
    setItems(resolved);
  }, []);

  useEffect(() => {
    syncList();
    const handler = () => syncList();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, [syncList]);

  const toggle = useCallback((id: string) => {
    return toggleStoredListId(id);
  }, []);

  const inList = useCallback((id: string) => {
    return listIds.includes(id);
  }, [listIds]);

  return {
    listIds,
    items,
    toggle,
    inList,
  };
}
