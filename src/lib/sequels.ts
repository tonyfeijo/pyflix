import type { MediaItem } from '@/lib/types';

/**
 * Qué poner después de terminar un título.
 *
 * - `sequel`: existe la siguiente entrega de la misma saga en el catálogo.
 * - `similar`: no hay saga (o no está la siguiente), así que se propone otro
 *   título del mismo género.
 */
export interface NextUpSuggestion {
  kind: 'sequel' | 'similar';
  item: MediaItem;
  /** Texto corto que explica por qué se propone. */
  reason: string;
  /** Otras opciones equivalentes, por si no apetece la principal. */
  alternatives: MediaItem[];
}

/* ------------------------------------------------------------------------- *
 * Sagas con nombres que no se parecen entre sí
 * ------------------------------------------------------------------------- */

/**
 * Algunas sagas no se pueden emparejar por el título ("Avengers: Los
 * Vengadores" no contiene "Infinity War"). Se declaran aquí a mano.
 *
 * Para añadir una saga nueva basta con una línea por película:
 *   { saga: 'terminator', patron: /^terminator$/, orden: 1 },
 *
 * `patron` se compara contra el título normalizado (minúsculas, sin acentos
 * y con espacios simples). `orden` es la posición dentro de la saga.
 */
const ALIAS_SAGAS: Array<{ saga: string; patron: RegExp; orden: number }> = [
  // Universo cinematográfico de Marvel
  { saga: 'avengers', patron: /^avengers( los vengadores)?$/, orden: 1 },
  { saga: 'avengers', patron: /^avengers infinity war$/, orden: 2 },
  { saga: 'avengers', patron: /^avengers endgame$/, orden: 3 },

  // Terminator (listas por si algún día añades la saga al servidor)
  { saga: 'terminator', patron: /^terminator$/, orden: 1 },
  { saga: 'terminator', patron: /^terminator 2( juicio final| judgment day)?$/, orden: 2 },
  { saga: 'terminator', patron: /^terminator 3( la rebelion de las maquinas)?$/, orden: 3 },
  { saga: 'terminator', patron: /^terminator salvation$/, orden: 4 },
  { saga: 'terminator', patron: /^terminator genesis$/, orden: 5 },
  { saga: 'terminator', patron: /^terminator destino oscuro$/, orden: 6 },
];

/* ------------------------------------------------------------------------- *
 * Utilidades
 * ------------------------------------------------------------------------- */

/** Minúsculas, sin acentos, sin signos y con espacios simples. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface SagaInfo {
  clave: string;
  orden: number;
}

/**
 * Averigua a qué saga pertenece un título y en qué posición va.
 *
 * Estrategia:
 * 1. Si está en la tabla de alias, se usa tal cual.
 * 2. Si el título lleva un número ("John Wick 3: Parabellum"), la parte de
 *    antes del número es la saga y el número, la posición.
 * 3. Si no lleva número, es la primera entrega de su propia saga
 *    ("Volver al Futuro" → orden 1, que empareja con "Volver al Futuro 2").
 */
function detectarSaga(titulo: string): SagaInfo {
  const texto = normalizar(titulo);

  for (const alias of ALIAS_SAGAS) {
    if (alias.patron.test(texto)) return { clave: `alias:${alias.saga}`, orden: alias.orden };
  }

  const conNumero = /^(.+?)\s(\d{1,2})(?:\s|$)/.exec(texto);
  if (conNumero) {
    const base = conNumero[1].trim();
    const orden = Number.parseInt(conNumero[2], 10);
    // Se descartan años sueltos ("1917") y números absurdos.
    if (base.length >= 3 && orden > 0 && orden < 20) {
      return { clave: `saga:${base}`, orden };
    }
  }

  return { clave: `saga:${texto}`, orden: 1 };
}

/** Géneros reales (Jellyfin usa "General" cuando no sabe). */
function generosUtiles(item: MediaItem): string[] {
  return (item.genre ?? []).filter((genero) => genero && genero.toLowerCase() !== 'general');
}

/** Cuánto se parece un título a otro. Sirve para ordenar las sugerencias. */
function puntuacion(actual: MediaItem, candidato: MediaItem): number {
  const generos = new Set(generosUtiles(actual));
  let puntos = 0;

  for (const genero of generosUtiles(candidato)) {
    if (generos.has(genero)) puntos += 10;
  }

  if (candidato.type === actual.type) puntos += 3;

  const distancia = Math.abs((candidato.year || 0) - (actual.year || 0));
  if (distancia > 0 && distancia <= 5) puntos += 2;

  // Clips, cortos y documentales no son buenos "siguientes".
  if (candidato.collection) puntos -= 20;

  return puntos;
}

function generoComun(actual: MediaItem, candidato: MediaItem): string | undefined {
  const generos = new Set(generosUtiles(actual));
  return generosUtiles(candidato).find((genero) => generos.has(genero));
}

/** Candidatos válidos: otro título, con vídeo y fuera de las secciones especiales. */
function candidatosValidos(actual: MediaItem, catalogo: MediaItem[]): MediaItem[] {
  return catalogo.filter(
    (item) =>
      item.id !== actual.id &&
      Boolean(item.videoUrl) &&
      !item.collection
  );
}

/**
 * Devuelve qué poner a continuación de `actual`.
 *
 * Prioridad:
 * 1. La siguiente entrega de la saga que exista en el catálogo.
 * 2. Si no hay saga: el título más parecido por género.
 * 3. Si no comparte género con nada: cualquier otro título con vídeo.
 */
export function findNextUp(actual: MediaItem, catalogo: MediaItem[]): NextUpSuggestion | null {
  const candidatos = candidatosValidos(actual, catalogo);
  if (candidatos.length === 0) return null;

  // 1) Secuela directa
  const sagaActual = detectarSaga(actual.title);
  const continuaciones = candidatos
    .map((item) => ({ item, saga: detectarSaga(item.title) }))
    .filter(({ saga }) => saga.clave === sagaActual.clave && saga.orden > sagaActual.orden)
    .sort((a, b) => a.saga.orden - b.saga.orden);

  const siguientes = candidatos
    // Si ya no queda saga por delante, no se propone una entrega anterior:
    // volver atrás dentro de la misma saga no es "lo siguiente".
    .filter((item) => detectarSaga(item.title).clave !== sagaActual.clave)
    .map((item) => ({ item, puntos: puntuacion(actual, item) }))
    .filter(({ puntos }) => puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || (b.item.year || 0) - (a.item.year || 0))
    .map(({ item }) => item);

  if (continuaciones.length > 0) {
    const secuela = continuaciones[0].item;
    return {
      kind: 'sequel',
      item: secuela,
      reason:
        continuaciones[0].saga.orden === sagaActual.orden + 1
          ? 'La saga continúa'
          : 'Siguiente entrega disponible de la saga',
      alternatives: siguientes
        .filter((item) => item.id !== secuela.id)
        .slice(0, 4),
    };
  }

  // 2) Mismo género
  if (siguientes.length > 0) {
    const principal = siguientes[0];
    const genero = generoComun(actual, principal);
    return {
      kind: 'similar',
      item: principal,
      reason: genero ? `También de ${genero}` : 'Puede que te guste',
      alternatives: siguientes.slice(1, 5),
    };
  }

  // 3) Último recurso: cualquier otro título con vídeo
  const relleno = [...candidatos].sort((a, b) => (b.year || 0) - (a.year || 0));
  return {
    kind: 'similar',
    item: relleno[0],
    reason: 'Otra opción de tu catálogo',
    alternatives: relleno.slice(1, 5),
  };
}
