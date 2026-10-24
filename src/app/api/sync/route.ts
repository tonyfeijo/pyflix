// src/app/api/sync-catalog/route.ts
import { NextResponse } from 'next/server';
import { getMovieMetadataFromTMDB } from '@/lib/tmdb'; // Tu helper de TMDB

export async function POST(request: Request) {
  try {
    // 1. Buscar películas públicas con formato MP4 en Internet Archive
    const iaQuery = encodeURIComponent('collection:(feature_films) AND mediatype:(movies) AND format:(MPEG4)');
    const iaResponse = await fetch(
      `https://archive.org/advancedsearch.php?q=${iaQuery}&fl[]=identifier,title,year,description&sort[]=downloads+desc&rows=10&page=1&output=json`
    );
    const iaData = await iaResponse.json();
    const docs = iaData.response?.docs || [];

    const newMovies = [];

    for (const doc of docs) {
      const cleanTitle = doc.title ? doc.title.replace(/[^a-zA-Z0-9\s]/g, '') : 'Movie';
      
      // 2. Obtener metadatos profesionales (poster, backdrop, sinopsis) desde TMDB
      const tmdbMeta = await getMovieMetadataFromTMDB(cleanTitle, doc.year);

      // 3. Estructurar el objeto de película compatible con PyFlix
      const movieItem = {
        id: `ia-${doc.identifier}`,
        title: tmdbMeta?.title || doc.title,
        type: 'movie',
        genre: tmdbMeta?.genres || ['Clásico', 'Cine'],
        year: doc.year ? parseInt(doc.year) : 1950,
        rating: tmdbMeta?.rating || '13+',
        duration: tmdbMeta?.duration || '1h 30m',
        description: tmdbMeta?.overview || doc.description || 'Película disponible en el archivo de dominio público.',
        thumbnail: tmdbMeta?.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
        backdrop: tmdbMeta?.backdropPath || 'https://images.unsplash.com/photo-1574267432553-4b4628081c31',
        videoUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`,
        trailerUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}.mp4`,
        match: Math.floor(Math.random() * 15) + 85,
        isTrending: true,
        cast: tmdbMeta?.cast || ['Actores varios'],
        director: tmdbMeta?.director || 'Director Desconocido',
      };

      newMovies.push(movieItem);
    }

    return NextResponse.json({ success: true, count: newMovies.length, movies: newMovies });
  } catch (error) {
    console.error('Error al sincronizar catálogo:', error);
    return NextResponse.json({ success: false, error: 'Falló la sincronización' }, { status: 500 });
  }
}