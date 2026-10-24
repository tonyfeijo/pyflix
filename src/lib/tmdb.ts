const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const urlParams = new URLSearchParams({
    api_key: apiKey,
    language: 'es-ES',
    ...params,
  });

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
  return res.json();
}

export async function getMovieMetadataFromTMDB(query: string, year?: string | number) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
    if (!apiKey) return null;

    const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=es-ES${year ? `&year=${year}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const result = data.results?.[0];

    if (!result) return null;

    return {
      title: result.title,
      overview: result.overview,
      posterUrl: result.poster_path ? `https://image.tmdb.org/t/p/w780${result.poster_path}` : null,
      backdropUrl: result.backdrop_path ? `https://image.tmdb.org/t/p/w1920${result.backdrop_path}` : null,
      rating: result.adult ? '18+' : '13+',
      duration: '1h 45m',
      genres: ['Cine', 'Dominio Público'],
      cast: ['Reparto variado'],
      director: 'Desconocido',
    };
  } catch (err) {
    console.error('Error fetching from TMDB:', err);
    return null;
  }
}