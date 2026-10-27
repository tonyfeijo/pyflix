'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import type { MediaItem } from '@/lib/types';
import type { NextUpSuggestion } from '@/lib/sequels';

interface UpNextModalProps {
  suggestion: NextUpSuggestion;
  /** Se llama al pulsar "Ver siguiente" o al agotarse la cuenta atrás. */
  onPlay: (item: MediaItem) => void;
  /** Se llama al cerrar sin reproducir. */
  onDismiss: () => void;
  /** Segundos de cuenta atrás antes de reproducir sola. */
  seconds?: number;
}

/**
 * Ventana de "a continuación" al terminar una película o serie.
 * Muestra la secuela si existe; si no, una recomendación del mismo género.
 */
export function UpNextModal({
  suggestion,
  onPlay,
  onDismiss,
  seconds = 10,
}: UpNextModalProps) {
  const [restante, setRestante] = useState(seconds);
  const yaLanzado = useRef(false);
  /** El callback puede cambiar de identidad sin reiniciar la cuenta atrás. */
  const onPlayRef = useRef(onPlay);

  const { item, kind, reason, alternatives } = suggestion;

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  // Cuenta atrás: al llegar a cero se reproduce sola.
  useEffect(() => {
    setRestante(seconds);
    yaLanzado.current = false;

    const inicio = Date.now();
    const timer = setInterval(() => {
      const transcurrido = Math.floor((Date.now() - inicio) / 1000);
      const quedan = Math.max(0, seconds - transcurrido);
      setRestante(quedan);
      if (quedan === 0 && !yaLanzado.current) {
        yaLanzado.current = true;
        clearInterval(timer);
        onPlayRef.current(item);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [item, seconds]);

  // Esc cierra la ventana.
  useEffect(() => {
    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [onDismiss]);

  const etiqueta = kind === 'sequel' ? 'Siguiente de la saga' : 'A continuación';
  const progreso = useMemo(
    () => Math.max(0, Math.min(100, ((seconds - restante) / seconds) * 100)),
    [restante, seconds]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${etiqueta}: ${item.title}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-netflix-card shadow-netflix-lg"
      >
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white/70 transition-colors hover:bg-black/70 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Carátula */}
          <div className="mx-auto w-28 flex-shrink-0 sm:mx-0 sm:w-36">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-netflix-black">
              <Image
                src={item.thumbnail}
                alt={`${item.title} portada`}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-netflix-red">
              {etiqueta}
            </p>
            <h2 className="mb-1 truncate text-2xl font-bold text-netflix-white">{item.title}</h2>
            <p className="mb-3 text-sm text-netflix-gray">
              {[item.year || null, item.rating, item.duration, reason].filter(Boolean).join(' • ')}
            </p>
            <p className="mb-5 line-clamp-3 text-sm text-netflix-lightGray">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlay(item)}
                className="btn-primary gap-2"
                autoFocus
              >
                <Play className="h-5 w-5" />
                <span>Ver siguiente</span>
                <span className="rounded bg-black/25 px-1.5 py-0.5 text-xs font-semibold">
                  {restante}s
                </span>
              </button>
              <button type="button" onClick={onDismiss} className="btn-secondary">
                Cancelar
              </button>
            </div>

            {/* Barra de progreso de la cuenta atrás */}
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-netflix-red"
                animate={{ width: `${progreso}%` }}
                transition={{ ease: 'linear', duration: 0.25 }}
              />
            </div>
          </div>
        </div>

        {/* Alternativas */}
        {alternatives.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4 sm:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-netflix-gray">
              {kind === 'sequel' ? 'Otras opciones' : 'Más como esto'}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {alternatives.map((alternativa) => (
                <button
                  key={alternativa.id}
                  type="button"
                  onClick={() => onPlay(alternativa)}
                  className="group w-24 flex-shrink-0 text-left"
                  title={alternativa.title}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-netflix-black ring-1 ring-white/10 transition group-hover:ring-netflix-red">
                    <Image
                      src={alternativa.thumbnail}
                      alt={alternativa.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                  <p className="mt-1.5 truncate text-xs text-netflix-lightGray group-hover:text-white">
                    {alternativa.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
