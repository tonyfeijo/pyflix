'use client';

import { useState } from 'react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SyncModal({ isOpen, onClose, onSuccess }: SyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`¡Éxito! Se sincronizaron ${data.count} películas.`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage('Ocurrió un error al sincronizar el catálogo.');
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setMessage('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 text-white shadow-xl border border-zinc-800">
        <h2 className="text-xl font-bold mb-3">Sincronizar Catálogo</h2>
        <p className="text-zinc-400 text-sm mb-5">
          Esto buscará películas de dominio público en Internet Archive y completará las fichas con TMDB.
        </p>

        {message && (
          <div className="mb-4 text-sm p-3 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
            {message}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? '⏳ Sincronizando...' : 'Iniciar Sincronización'}
          </button>
        </div>
      </div>
    </div>
  );
}