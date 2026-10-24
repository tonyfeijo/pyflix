'use client';

import { useEffect, useState } from 'react';

/** Evento que se emite cuando el catálogo guardado cambia. */
export const CATALOG_UPDATED_EVENT = 'pyflix:catalog-updated';

/** Avisa a las vistas abiertas de que el catálogo cambió (sin recargar la página). */
export function notifyCatalogUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
}

/**
 * Suscribe un componente a los cambios del catálogo.
 * Devuelve un contador que cambia cada vez que llega contenido nuevo,
 * de modo que el componente se vuelve a renderizar con los datos frescos.
 */
export function useCatalogVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onChange = () => setVersion((current) => current + 1);
    window.addEventListener(CATALOG_UPDATED_EVENT, onChange);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, onChange);
  }, []);

  return version;
}
