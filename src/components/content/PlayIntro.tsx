'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { reproducirArpegioArpa, type ReproductorArpa } from '@/lib/intro-sound';

/** Duración total de la animación. */
const DURACION_MS = 3600;
/** Número de haces de luz que forman el logo. */
const BARRAS = 9;

interface PlayIntroProps {
  /** Título que se va a reproducir; se muestra en pequeño. */
  title?: string;
  onDone: () => void;
}

/**
 * Animación de entrada antes de la película, con arpegio de arpa.
 *
 * Se muestra encima del vídeo mientras éste carga: cuando termina, el vídeo ya
 * suele estar listo y entra con un fundido. Se puede saltar con clic o Esc.
 */
export function PlayIntro({ title, onDone }: PlayIntroProps) {
  const terminado = useRef(false);
  const audio = useRef<ReproductorArpa | null>(null);

  const terminar = useCallback(() => {
    if (terminado.current) return;
    terminado.current = true;
    audio.current?.detener();
    onDone();
  }, [onDone]);

  useEffect(() => {
    // El usuario acaba de pulsar "Reproducir": el navegador permite el audio.
    audio.current = reproducirArpegioArpa();

    const temporizador = setTimeout(terminar, DURACION_MS);
    const alPulsarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') terminar();
    };
    window.addEventListener('keydown', alPulsarTecla);

    return () => {
      clearTimeout(temporizador);
      window.removeEventListener('keydown', alPulsarTecla);
      audio.current?.detener();
    };
  }, [terminar]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: DURACION_MS / 1000, times: [0, 0.9, 1], ease: 'easeIn' }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black"
      onClick={terminar}
      role="presentation"
    >
      {/* Haces verticales que se encienden en cascada */}
      <div className="absolute inset-0 flex items-center justify-center gap-[8px] sm:gap-[12px]">
        {Array.from({ length: BARRAS }).map((_, indice) => (
          <motion.span
            key={indice}
            initial={{ scaleY: 0.02, opacity: 0 }}
            animate={{ scaleY: [0.02, 1, 0.55], opacity: [0, 0.95, 0.12] }}
            transition={{
              duration: 1.7,
              delay: 0.12 + indice * 0.06,
              ease: 'easeOut',
              times: [0, 0.45, 1],
            }}
            className="h-[62vh] w-[10px] origin-center rounded-full bg-gradient-to-b from-netflix-red via-netflix-red to-transparent sm:w-[14px]"
          />
        ))}
      </div>

      {/* Barrido de luz */}
      <motion.div
        initial={{ x: '-70vw', opacity: 0 }}
        animate={{ x: '70vw', opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.1, delay: 0.85, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-40 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md"
      />

      {/* Palabra */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.7em', scale: 1.04 }}
          animate={{ opacity: 1, letterSpacing: '0.18em', scale: 1 }}
          transition={{ delay: 0.65, duration: 1.15, ease: 'easeOut' }}
          className="text-5xl font-black uppercase text-white drop-shadow-[0_0_24px_rgba(229,9,20,0.55)] sm:text-7xl"
        >
          PYFLIX
        </motion.h1>

        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.7, ease: 'easeOut' }}
          className="mt-3 h-[2px] max-w-xs bg-netflix-red"
        />

        {title && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="mt-4 max-w-md truncate text-sm uppercase tracking-[0.3em] text-netflix-lightGray"
          >
            {title}
          </motion.p>
        )}
      </div>

      {/* Saltar */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={(event) => {
          event.stopPropagation();
          terminar();
        }}
        className="absolute bottom-8 right-8 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/60 transition-colors hover:border-white/50 hover:text-white"
      >
        Saltar
      </motion.button>
    </motion.div>
  );
}
