/**
 * Arpegio de arpa sintetizado para la animación de entrada.
 *
 * Se genera con la Web Audio API en lugar de descargar un MP3: no pesa nada,
 * no depende de la red y no hay derechos de autor de por medio. El timbre
 * imita una cuerda pulsada: varios armónicos con caída rápida y un filtro que
 * se va cerrando, más un acorde grave final.
 */

/** Notas MIDI del arpegio: Do mayor, La menor, Fa mayor, Sol mayor. */
const ARPEGIO = [
  60, 64, 67, 72,
  57, 60, 64, 69,
  53, 57, 60, 65,
  55, 59, 62, 67,
];

/** Separación entre notas del arpegio (segundos). */
const PASO = 0.155;

/** Acorde final cálido para cerrar. */
const FINAL = [36, 48, 55, 60, 64];

export interface ReproductorArpa {
  /** Corta el sonido y libera el contexto de audio. */
  detener: () => void;
}

/** Frecuencia de una nota MIDI. */
function frecuencia(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Pulsa una "cuerda": armónicos con caída exponencial. */
function pulsarCuerda(
  ctx: AudioContext,
  midi: number,
  inicio: number,
  destino: AudioNode,
  fuerza = 1
): void {
  const base = frecuencia(midi);

  const envolvente = ctx.createGain();
  envolvente.gain.setValueAtTime(0.0001, inicio);
  envolvente.gain.exponentialRampToValueAtTime(0.55 * fuerza, inicio + 0.008);
  envolvente.gain.exponentialRampToValueAtTime(0.0001, inicio + 1.9);

  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(4200, inicio);
  filtro.frequency.exponentialRampToValueAtTime(850, inicio + 1.3);
  filtro.Q.value = 0.6;

  // Armónicos de una cuerda pulsada: el 2º y el 3º son los más presentes.
  [1, 2, 2.99, 4.02, 5.05].forEach((multiplo, indice) => {
    const oscilador = ctx.createOscillator();
    oscilador.type = 'sine';
    oscilador.frequency.value = base * multiplo;
    // Un pelín de desafinación para que no suene a sintetizador puro.
    oscilador.detune.value = (Math.random() - 0.5) * 6;

    const ganancia = ctx.createGain();
    ganancia.gain.value = 1 / Math.pow(indice + 1, 2.1);

    oscilador.connect(ganancia).connect(filtro);
    oscilador.start(inicio);
    oscilador.stop(inicio + 2);
  });

  filtro.connect(envolvente).connect(destino);
}

/**
 * Lanza el arpegio. Devuelve un controlador para cortarlo, o null si el
 * navegador no permite audio.
 */
export function reproducirArpegioArpa(): ReproductorArpa | null {
  if (typeof window === 'undefined') return null;

  const Constructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return null;

  let ctx: AudioContext;
  try {
    ctx = new Constructor();
  } catch {
    return null;
  }

  // Tras un clic del usuario el navegador deja sonar; por si acaso se reanuda.
  void ctx.resume().catch(() => {});

  const t0 = ctx.currentTime + 0.08;

  // Cadena: volumen general → compresor (evita saturación) → altavoces.
  const maestro = ctx.createGain();
  maestro.gain.setValueAtTime(0.0001, t0);
  maestro.gain.exponentialRampToValueAtTime(0.24, t0 + 0.12);
  maestro.gain.setValueAtTime(0.24, t0 + 3.1);
  maestro.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.9);

  const compresor = ctx.createDynamicsCompressor();
  compresor.threshold.value = -16;
  compresor.knee.value = 24;
  compresor.ratio.value = 3;
  compresor.attack.value = 0.004;
  compresor.release.value = 0.25;

  maestro.connect(compresor).connect(ctx.destination);

  ARPEGIO.forEach((nota, indice) => {
    pulsarCuerda(ctx, nota, t0 + indice * PASO, maestro, indice % 4 === 0 ? 1 : 0.78);
  });

  // Golpe final grave, en dos tiempos, tipo "ta-dum".
  const final = t0 + ARPEGIO.length * PASO + 0.15;
  FINAL.forEach((nota, indice) => {
    pulsarCuerda(ctx, nota, final + indice * 0.02, maestro, 1.15);
  });

  let cerrado = false;
  const cerrar = () => {
    if (cerrado) return;
    cerrado = true;
    try {
      maestro.gain.cancelScheduledValues(ctx.currentTime);
      maestro.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      setTimeout(() => {
        void ctx.close().catch(() => {});
      }, 220);
    } catch {
      /* ya estaba cerrado */
    }
  };

  // Se cierra solo al terminar, aunque nadie llame a detener().
  setTimeout(cerrar, 4600);

  return { detener: cerrar };
}
