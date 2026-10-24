'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertCircle, X, Film, Database, Sparkles, Trash2 } from 'lucide-react';
import type { MediaItem } from '@/lib/types';
import { getCustomSyncedMovies } from '@/lib/mock-data';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogSynced?: () => void;
}

export function SyncModal({ isOpen, onClose, onCatalogSynced }: SyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(() => getCustomSyncedMovies().length);

  if (!isOpen) return null;

  const handleSync = async () => {
    try {
      setLoading(true);
      setResultMessage(null);
      setStatusText('Conectando con la API de Internet Archive...');

      await new Promise(r => setTimeout(r, 600));
      setStatusText('Descargando metadatos y carátulas en alta resolución...');

      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();

      await new Promise(r => setTimeout(r, 800));
      setStatusText('Comprobando enlaces directos de streaming MP4...');

      if (data.success && Array.isArray(data.movies)) {
        localStorage.setItem('pyflix_synced_movies', JSON.stringify(data.movies));
        setSyncedCount(data.movies.length);
        setResultMessage(`¡Éxito! Se sincronizaron ${data.movies.length} películas legales en tu catálogo.`);
        window.dispatchEvent(new Event('pyflix_catalog_updated'));
        onCatalogSynced?.();
      } else {
        throw new Error(data.error || 'Error inesperado');
      }
    } catch (err: any) {
      setResultMessage(`Error: ${err.message || 'No se pudo completar la sincronización'}`);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleClear = () => {
    if (confirm('¿Deseas restablecer el catálogo al estado original?')) {
      localStorage.removeItem('pyflix_synced_movies');
      setSyncedCount(0);
      setResultMessage('Catálogo restablecido al estado original.');
      window.dispatchEvent(new Event('pyflix_catalog_updated'));
      onCatalogSynced?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 text-white space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-netflix-red/15 rounded-xl border border-netflix-red/30">
              <Sparkles className="w-6 h-6 text-netflix-red" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sincronizador Automático</h2>
              <p className="text-xs text-neutral-400">Internet Archive &amp; Open Movies API</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="bg-neutral-900/80 border border-white/5 rounded-xl p-4 text-xs sm:text-sm text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Database className="w-4 h-4 text-netflix-red" />
            <span>¿Cómo funciona con 1 solo clic?</span>
          </div>
          <p className="text-neutral-400 leading-relaxed">
            Este sincronizador consulta las bibliotecas de <strong>Internet Archive</strong> y proyectos abiertos de cine para importar películas completas de dominio público con carátulas, sinopsis y enlaces de reproducción inmediata en MP4.
          </p>
          <div className="pt-2 text-[11px] text-green-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% legal, sin costes de licencia ni problemas de derechos.</span>
          </div>
        </div>

        {/* Current status */}
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>Películas sincronizadas activas:</span>
          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
            {syncedCount} títulos
          </span>
        </div>

        {/* Feedback Messages */}
        {loading && (
          <div className="p-4 rounded-xl bg-netflix-red/10 border border-netflix-red/20 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-netflix-red animate-spin flex-shrink-0" />
            <span className="text-xs sm:text-sm text-neutral-200 animate-pulse">{statusText}</span>
          </div>
        )}

        {resultMessage && !loading && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-netflix-red text-white font-bold rounded-xl hover:bg-netflix-redHover active:scale-98 transition-all shadow-lg shadow-netflix-red/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Sincronizando...' : 'Sincronizar ahora con 1 Clic'}</span>
          </button>

          {syncedCount > 0 && (
            <button
              onClick={handleClear}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Restablecer catálogo al original</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
