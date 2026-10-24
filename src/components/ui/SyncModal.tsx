'use client';

import { useState } from 'react';
import { saveSyncedMovies, setSyncedSignature } from '@/lib/synced-catalog';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SyncSource = 'archive' | 'jellyfin';

export default function SyncModal({ isOpen, onClose, onSuccess }: SyncModalProps) {
  const [loading, setLoading] = useState<SyncSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async (source: SyncSource) => {
    setLoading(source);
    setMessage(null);

    const endpoint = source === 'jellyfin' ? '/api/jellyfin/sync' : '/api/sync';

    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // Jellyfin reemplaza el catálogo importado (respeta borrados);
        // Internet Archive se fusiona por id.
        saveSyncedMovies(data.movies, source === 'jellyfin' ? 'replace' : 'merge');
        if (source === 'jellyfin' && data.signature) {
          setSyncedSignature(data.signature);
        }
        setMessage(`¡Listo! Se importaron ${data.count} títulos.`);
        if (onSuccess) onSuccess();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`Error: ${data.message || 'No se pudo sincronizar el catálogo.'}`);
      }
    } catch (error) {
      console.error('Error en la sincronización:', error);
      setMessage('Error de conexión con el servidor.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg bg-zinc-900 p-6 text-white shadow-xl border border-zinc-800">
        <h2 className="text-xl font-bold mb-3">Sincronizar Catálogo</h2>

        {message && (
          <div className="mb-4 text-sm p-3 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {/* Jellyfin */}
          <div className="rounded-lg border border-zinc-700 p-4">
            <h3 className="font-semibold mb-1">Jellyfin</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Importa tus películas y series con carátulas, sinopsis y reproducción
              dentro de PyFlix. Se actualiza solo al abrir la web cuando añades
              contenido nuevo al servidor.
            </p>
            <button
              type="button"
              onClick={() => handleSync('jellyfin')}
              disabled={loading !== null}
              className="w-full px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50"
            >
              {loading === 'jellyfin' ? 'Importando desde Jellyfin...' : 'Importar desde Jellyfin'}
            </button>
          </div>

          {/* Internet Archive (demo) */}
          <div className="rounded-lg border border-zinc-700 p-4">
            <h3 className="font-semibold mb-1">Internet Archive (demo)</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Busca películas de dominio público y completa los detalles con TMDB.
            </p>
            <button
              type="button"
              onClick={() => handleSync('archive')}
              disabled={loading !== null}
              className="w-full px-5 py-2 text-sm font-semibold bg-zinc-700 hover:bg-zinc-600 text-white rounded transition disabled:opacity-50"
            >
              {loading === 'archive' ? 'Sincronizando...' : 'Sincronizar Internet Archive'}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading !== null}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
