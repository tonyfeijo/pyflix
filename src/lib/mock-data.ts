export type { MediaItem, Category, UserProfile, Episode, ContinueWatching } from '@/lib/types';
import type { MediaItem, Category, UserProfile, Episode } from '@/lib/types';

export const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Tony',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tony&backgroundColor=000000,e50914,141414',
    isKids: false,
    language: 'es',
    maturityRating: 'TV-MA',
  },
  {
    id: '2',
    name: 'Kids',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kids&backgroundColor=000000,e50914,141414',
    isKids: true,
    language: 'es',
    maturityRating: 'PG',
  },
  {
    id: '3',
    name: 'Invitado',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=000000,e50914,141414',
    isKids: false,
    language: 'es',
    maturityRating: 'TV-14',
  },
];

const sampleVideos = {
  bigBuck: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephants: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  tears: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  blazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  escapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  fun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  joy: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  meltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  outback: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
  bullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
};

export const mockMedia: MediaItem[] = [
  {
    id: '1',
    title: 'Stranger Things',
    type: 'series',
    genre: ['Ciencia Ficción', 'Terror', 'Misterio'],
    year: 2016,
    rating: 'TV-14',
    duration: '4 Temporadas',
    description: 'Cuando un niño desaparece en un pueblo de Indiana, un grupo de amigos desvela una serie de misterios que involucran experimentos secretos, fuerzas sobrenaturales aterradoras y una niña muy extraña.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    logo: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    videoUrl: sampleVideos.tears,
    trailerUrl: sampleVideos.tears,
    match: 98,
    isTrending: true,
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
    director: 'The Duffer Brothers',
    episodes: [
      { id: 'st-e1', season: 1, episode: 1, title: 'Capítulo 1: La desaparición de Will Byers', description: 'De camino a casa desde la casa de un amigo, el joven Will ve algo aterrador. Cerca de allí, un secreto siniestro acecha en un laboratorio del gobierno.', duration: '48 min', thumbnail: 'https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', videoUrl: sampleVideos.tears },
      { id: 'st-e2', season: 1, episode: 2, title: 'Capítulo 2: La rara de Maple Street', description: 'Lucas, Mike y Dustin intentan hablar con la chica que encontraron en el bosque. El sheriff interroga a un desconcertado dueño de restaurante.', duration: '55 min', thumbnail: 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', videoUrl: sampleVideos.blazes },
      { id: 'st-e3', season: 1, episode: 3, title: 'Capítulo 3: Todo está bien', description: 'Cada vez más preocupada, Joyce cree que Will intenta comunicarse con ella. Los chicos le dan un cambio de imagen a Eleven.', duration: '51 min', thumbnail: 'https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg', videoUrl: sampleVideos.escapes },
      { id: 'st-e4', season: 1, episode: 4, title: 'Capítulo 4: El cuerpo', description: 'Negándose a creer que Will está muerto, Joyce intenta conectarse con su hijo. Los chicos ayudan a Eleven a buscarlo.', duration: '50 min', thumbnail: 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', videoUrl: sampleVideos.fun },
    ],
  },
  {
    id: '2',
    title: 'The Witcher',
    type: 'series',
    genre: ['Fantasía', 'Acción', 'Aventura'],
    year: 2019,
    rating: 'TV-MA',
    duration: '3 Temporadas',
    description: 'Geralt de Rivia, un cazador de monstruos mutante a sueldo, viaja a través del Continente luchando por encontrar su lugar en un mundo donde las personas a menudo resultan ser más perversas que las bestias.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/7vIJjO1lUpY9yKvsK2FWiJz6p5p.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/6BfZff7QGQmkVKsxh3g3j5DZxP8.jpg',
    videoUrl: sampleVideos.sintel,
    trailerUrl: sampleVideos.sintel,
    match: 95,
    isTrending: true,
    cast: ['Henry Cavill', 'Anya Chalotra', 'Freya Allan', 'Joey Batey'],
    director: 'Lauren Schmidt Hissrich',
    episodes: [
      { id: 'tw-e1', season: 1, episode: 1, title: 'El principio del fin', description: 'Hostigado por los lugareños y un mago astuto, Geralt llega a la ciudad de Blaviken. Ciri ve cómo su mundo real se derrumba.', duration: '61 min', thumbnail: 'https://image.tmdb.org/t/p/w780/6BfZff7QGQmkVKsxh3g3j5DZxP8.jpg', videoUrl: sampleVideos.sintel },
      { id: 'tw-e2', season: 1, episode: 2, title: 'Cuatro marcas', description: 'Intimidada y descuidada, Yennefer encuentra accidentalmente una salida. Geralt se topa con problemas mientras caza a un supuesto demonio.', duration: '60 min', thumbnail: 'https://image.tmdb.org/t/p/w780/7vIJjO1lUpY9yKvsK2FWiJz6p5p.jpg', videoUrl: sampleVideos.elephants },
    ],
  },
  {
    id: '3',
    title: 'Black Mirror',
    type: 'series',
    genre: ['Ciencia Ficción', 'Thriller', 'Misterio'],
    year: 2011,
    rating: 'TV-MA',
    duration: '6 Temporadas',
    description: 'Una serie antológica mordaz y llena de suspenso que explora un futuro retorcido y de alta tecnología donde las mayores innovaciones de la humanidad colisionan con sus instintos más oscuros.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/2DxJ6Gbyz1STyqQZ8vEqWZ9pF1U.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/rVXR0p2Gf5odB3GDgDd2sJh5W6H.jpg',
    videoUrl: sampleVideos.meltdowns,
    trailerUrl: sampleVideos.meltdowns,
    match: 97,
    isTrending: true,
    cast: ['Jesse Plemons', 'Cristin Milioti', 'Jimmi Simpson', 'Daniel Kaluuya'],
    director: 'Charlie Brooker',
    episodes: [
      { id: 'bm-e1', season: 1, episode: 1, title: 'El himno nacional', description: 'El primer ministro Michael Callow enfrenta un dilema escandaloso y sin precedentes cuando secuestran a un miembro de la familia real.', duration: '44 min', thumbnail: 'https://image.tmdb.org/t/p/w780/rVXR0p2Gf5odB3GDgDd2sJh5W6H.jpg', videoUrl: sampleVideos.meltdowns },
      { id: 'bm-e2', season: 1, episode: 2, title: 'Quince millones de méritos', description: 'En un mundo donde la gente pedalea para generar energía, un hombre ayuda a una mujer a entrar a un concurso de talentos.', duration: '62 min', thumbnail: 'https://image.tmdb.org/t/p/w780/2DxJ6Gbyz1STyqQZ8vEqWZ9pF1U.jpg', videoUrl: sampleVideos.outback },
    ],
  },
  {
    id: '4',
    title: 'Breaking Bad',
    type: 'series',
    genre: ['Crimen', 'Drama', 'Thriller'],
    year: 2008,
    rating: 'TV-MA',
    duration: '5 Temporadas',
    description: 'Un profesor de química de secundaria al que le diagnostican cáncer de pulmón inoperable recurre a la fabricación y venta de metanfetamina para asegurar el futuro financiero de su familia.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    videoUrl: sampleVideos.bigBuck,
    trailerUrl: sampleVideos.bigBuck,
    match: 99,
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
    director: 'Vince Gilligan',
    episodes: [
      { id: 'bb-e1', season: 1, episode: 1, title: 'Piloto', description: 'Walter White, un profesor de química abrumado, se une a Jesse Pinkman para producir metanfetamina de alta pureza.', duration: '58 min', thumbnail: 'https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', videoUrl: sampleVideos.bigBuck },
      { id: 'bb-e2', season: 1, episode: 2, title: 'El gato en la bolsa...', description: 'Walt y Jesse intentan limpiar el desastre que quedó después de su primer negocio fallido con distribuidores locales.', duration: '48 min', thumbnail: 'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', videoUrl: sampleVideos.bullrun },
    ],
  },
  {
    id: '5',
    title: 'The Crown',
    type: 'series',
    genre: ['Drama', 'Historia', 'Biografía'],
    year: 2016,
    rating: 'TV-MA',
    duration: '6 Temporadas',
    description: 'Sigue la vida de la reina Isabel II desde su boda en 1947 hasta principios del siglo XXI, explorando los eventos políticos y personales que definieron su reinado.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/lIGATQFnzGwYm8c4tkykB8Y5JQF.jpg',
    videoUrl: sampleVideos.joy,
    trailerUrl: sampleVideos.joy,
    match: 92,
    cast: ['Claire Foy', 'Olivia Colman', 'Imelda Staunton', 'Matt Smith'],
    director: 'Peter Morgan',
    episodes: [
      { id: 'tc-e1', season: 1, episode: 1, title: 'Wolferton Splash', description: 'Una joven princesa Isabel se casa con el príncipe Felipe de Grecia y Dinamarca. La salud del rey Jorge VI empieza a decaer.', duration: '57 min', thumbnail: 'https://image.tmdb.org/t/p/w780/lIGATQFnzGwYm8c4tkykB8Y5JQF.jpg', videoUrl: sampleVideos.joy },
    ],
  },
  {
    id: '6',
    title: 'Squid Game (El Juego del Calamar)',
    type: 'series',
    genre: ['Thriller', 'Drama', 'Acción'],
    year: 2021,
    rating: 'TV-MA',
    duration: '2 Temporadas',
    description: 'Cientos de concursantes desesperados con dificultades económicas aceptan una misteriosa invitación para competir en juegos infantiles. El premio es multimillonario, pero el riesgo es mortal.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/cy8YbgT1V7JnjgjJq5Z3Z9pX5KQ.jpg',
    videoUrl: sampleVideos.tears,
    trailerUrl: sampleVideos.tears,
    match: 96,
    isNew: true,
    isTrending: true,
    cast: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-joon', 'Jung Ho-yeon'],
    director: 'Hwang Dong-hyuk',
    episodes: [
      { id: 'sg-e1', season: 1, episode: 1, title: 'Luz roja, luz verde', description: 'Con la esperanza de ganar dinero fácil, Gi-hun acepta jugar un enigmático juego. Pronto descubre las sangrientas reglas.', duration: '60 min', thumbnail: 'https://image.tmdb.org/t/p/w780/cy8YbgT1V7JnjgjJq5Z3Z9pX5KQ.jpg', videoUrl: sampleVideos.tears },
      { id: 'sg-e2', season: 1, episode: 2, title: 'Infierno', description: 'Dividido entre regresar a casa o continuar en la competencia, el grupo vota si desean abandonar la isla o seguir jugando.', duration: '62 min', thumbnail: 'https://image.tmdb.org/t/p/w780/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', videoUrl: sampleVideos.blazes },
    ],
  },
  {
    id: '7',
    title: 'La Casa de Papel',
    type: 'series',
    genre: ['Crimen', 'Thriller', 'Acción'],
    year: 2017,
    rating: 'TV-MA',
    duration: '5 Partes',
    description: 'Un misterioso hombre conocido como El Profesor recluta a ocho delincuentes con habilidades únicas para llevar a cabo el atraco más elaborado de la historia española: imprimir millones de euros en la Fábrica Nacional de Moneda y Timbre.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/slNpzRjRj5GZYh6qE8KKF8R5JZm.jpg',
    videoUrl: sampleVideos.escapes,
    trailerUrl: sampleVideos.escapes,
    match: 94,
    cast: ['Úrsula Corberó', 'Álvaro Morte', 'Itziar Ituño', 'Pedro Alonso'],
    director: 'Álex Pina',
    episodes: [
      { id: 'lcdp-e1', season: 1, episode: 1, title: 'Efectuar lo acordado', description: 'El Profesor recluta a Tokio, una joven fugitiva, y le presenta su ambicioso plan maestro junto con otros siete asaltantes.', duration: '47 min', thumbnail: 'https://image.tmdb.org/t/p/w780/slNpzRjRj5GZYh6qE8KKF8R5JZm.jpg', videoUrl: sampleVideos.escapes },
    ],
  },
  {
    id: '8',
    title: 'Dark',
    type: 'series',
    genre: ['Ciencia Ficción', 'Misterio', 'Drama'],
    year: 2017,
    rating: 'TV-MA',
    duration: '3 Temporadas',
    description: 'La desaparición de dos niños en el pueblo alemán de Winden expone las vidas fracturadas y las relaciones secretas entre cuatro familias, desvelando una conspiración de viajes en el tiempo a lo largo de varias generaciones.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/rr7E0NoGKxvbkb89eR1GwfoYjpA.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/x8jVPqJ3s6eO0M6r5s1vZ8Y7KQ2.jpg',
    videoUrl: sampleVideos.elephants,
    trailerUrl: sampleVideos.elephants,
    match: 98,
    cast: ['Louis Hofmann', 'Lisa Vicari', 'Maja Schöne', 'Andreas Pietschmann'],
    director: 'Baran bo Odar, Jantje Friese',
    episodes: [
      { id: 'dk-e1', season: 1, episode: 1, title: 'Secretos', description: 'En 2019, la desaparición inexplicable de un estudiante local desata temores en los residentes de la sombría ciudad de Winden.', duration: '52 min', thumbnail: 'https://image.tmdb.org/t/p/w780/x8jVPqJ3s6eO0M6r5s1vZ8Y7KQ2.jpg', videoUrl: sampleVideos.elephants },
    ],
  },
  {
    id: '9',
    title: 'Inception (El Origen)',
    type: 'movie',
    genre: ['Ciencia Ficción', 'Acción', 'Aventura'],
    year: 2010,
    rating: 'PG-13',
    duration: '2h 28m',
    description: 'A Dom Cobb se le ofrece la oportunidad de recuperar su antigua vida a cambio de realizar la tarea casi imposible del espionaje corporativo: la implantación de una idea en el subconsciente de un heredero empresarial.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    videoUrl: sampleVideos.bigBuck,
    trailerUrl: sampleVideos.bigBuck,
    match: 97,
    cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Elliot Page'],
    director: 'Christopher Nolan',
  },
  {
    id: '10',
    title: 'The Matrix',
    type: 'movie',
    genre: ['Ciencia Ficción', 'Acción'],
    year: 1999,
    rating: 'R',
    duration: '2h 16m',
    description: 'Cuando una hermosa desconocida lleva al pirata informático Neo a un inframundo prohibitivo, descubre la impactante verdad: la vida que conoce es el engaño elaborado de una ciberinteligencia artificial malévola.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/8c4a8kE7PizaGQQnditMmI1xbRp.jpg',
    videoUrl: sampleVideos.tears,
    trailerUrl: sampleVideos.tears,
    match: 95,
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    director: 'Lana Wachowski, Lilly Wachowski',
  },
  {
    id: '11',
    title: 'Parasite (Parásitos)',
    type: 'movie',
    genre: ['Thriller', 'Drama', 'Comedia'],
    year: 2019,
    rating: 'R',
    duration: '2h 12m',
    description: 'Toda la familia de Ki-taek está desempleada y se interesa por el glamuroso y adinerado clan de los Park. Poco a poco se infiltran en sus vidas hasta verse envueltos en un incidente inesperado.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    videoUrl: sampleVideos.fun,
    trailerUrl: sampleVideos.fun,
    match: 96,
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    director: 'Bong Joon-ho',
  },
  {
    id: '12',
    title: 'Interstellar',
    type: 'movie',
    genre: ['Ciencia Ficción', 'Drama', 'Aventura'],
    year: 2014,
    rating: 'PG-13',
    duration: '2h 49m',
    description: 'En el futuro, una plaga global pone a la humanidad al borde de la extinción. Un grupo de astronautas se aventura a través de un agujero de gusano cerca de Saturno en busca de un nuevo hogar.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    videoUrl: sampleVideos.sintel,
    trailerUrl: sampleVideos.sintel,
    match: 98,
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
  },
  {
    id: '13',
    title: 'The Dark Knight (El Caballero Oscuro)',
    type: 'movie',
    genre: ['Acción', 'Crimen', 'Drama'],
    year: 2008,
    rating: 'PG-13',
    duration: '2h 32m',
    description: 'Con la ayuda del teniente Gordon y del fiscal Dent, Batman se propone desmantelar las organizaciones delictivas que asolan Gotham. Sin embargo, un nuevo genio del mal desata el caos: el Joker.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    videoUrl: sampleVideos.blazes,
    trailerUrl: sampleVideos.blazes,
    match: 99,
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    director: 'Christopher Nolan',
  },
  {
    id: '14',
    title: 'Pulp Fiction',
    type: 'movie',
    genre: ['Crimen', 'Drama'],
    year: 1994,
    rating: 'R',
    duration: '2h 34m',
    description: 'Las vidas de dos mafiosos, un boxeador deshonesto, la esposa de un gánster y dos atracadores de poca monta se entrelazan en una frenética serie de incidentes cómicos y violentos.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/4cDFJr4HnXN5ZqHm1xYjJpJqP5Q.jpg',
    videoUrl: sampleVideos.bullrun,
    trailerUrl: sampleVideos.bullrun,
    match: 97,
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
    director: 'Quentin Tarantino',
  },
  {
    id: '15',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    genre: ['Animación', 'Acción', 'Aventura'],
    year: 2023,
    rating: 'PG',
    duration: '2h 20m',
    description: 'Miles Morales es catapultado a través del multiverso donde se encuentra con una sociedad de Spider-People encargada de proteger su propia existencia ante una amenaza catastrófica.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    videoUrl: sampleVideos.escapes,
    trailerUrl: sampleVideos.escapes,
    match: 94,
    isNew: true,
    isTrending: true,
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Brian Tyree Henry', 'Luna Lauren Velez'],
    director: 'Joaquim Dos Santos, Kemp Powers',
  },
  {
    id: '16',
    title: 'Everything Everywhere All at Once',
    type: 'movie',
    genre: ['Ciencia Ficción', 'Comedia', 'Acción'],
    year: 2022,
    rating: 'R',
    duration: '2h 19m',
    description: 'Una inmigrante china de mediana edad se ve envuelta en una aventura insólita en la que solo ella puede salvar la existencia explorando otros universos paralelos y conectando con sus vidas alternas.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/w3LxiVYdWWRvEVJ1J8u6J7Q5J6K.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/w3LxiVYdWWRvEVJ1J8u6J7Q5J6K.jpg',
    videoUrl: sampleVideos.outback,
    trailerUrl: sampleVideos.outback,
    match: 95,
    cast: ['Michelle Yeoh', 'Ke Huy Quan', 'Stephanie Hsu', 'Jamie Lee Curtis'],
    director: 'Daniel Kwan, Daniel Scheinert',
  },
  {
    id: '17',
    title: 'Arcane',
    type: 'series',
    genre: ['Animación', 'Acción', 'Fantasía'],
    year: 2021,
    rating: 'TV-14',
    duration: '2 Temporadas',
    description: 'En medio del agudo conflicto entre la utópica ciudad de Piltover y los sórdidos suburbios de Zaun, dos hermanas luchan en bandos opuestos de una guerra por tecnologías mágicas y convicciones opuestas.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/fqldf2t8ztc9ai73k6ml8huwLJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/fqldf2t8ztc9ai73k6ml8huwLJ.jpg',
    videoUrl: sampleVideos.sintel,
    trailerUrl: sampleVideos.sintel,
    match: 98,
    isTrending: true,
    cast: ['Hailee Steinfeld', 'Ella Purnell', 'Katie Leung', 'Kevin Alejandro'],
    director: 'Christian Linke, Alex Yee',
    episodes: [
      { id: 'arc-e1', season: 1, episode: 1, title: '¡Bienvenidos al juego!', description: 'Vi y Powder intentan dar un golpe en un taller de la alta sociedad de Piltover, desencadenando una serie de eventos peligrosos.', duration: '43 min', thumbnail: 'https://image.tmdb.org/t/p/w780/fqldf2t8ztc9ai73k6ml8huwLJ.jpg', videoUrl: sampleVideos.sintel },
    ],
  },
  {
    id: '18',
    title: 'The Last of Us',
    type: 'series',
    genre: ['Acción', 'Aventura', 'Drama'],
    year: 2023,
    rating: 'TV-MA',
    duration: '1 Temporada',
    description: 'Veinte años después de que una pandemia fúngica diezmara el planeta, Joel, un superviviente endurecido, es contratado para sacar clandestinamente a Ellie, una niña de 14 años, de una opresiva zona de cuarentena.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    videoUrl: sampleVideos.tears,
    trailerUrl: sampleVideos.tears,
    match: 97,
    isNew: true,
    isTrending: true,
    cast: ['Pedro Pascal', 'Bella Ramsey', 'Gabriel Luna', 'Anna Torv'],
    director: 'Craig Mazin, Neil Druckmann',
    episodes: [
      { id: 'tlou-e1', season: 1, episode: 1, title: 'Cuando te pierdas en la oscuridad', description: 'Veinte años después de un brote catastrófico, Joel y Tess tienen la tarea de llevar a cabo una misión clandestina que cambiará sus destinos.', duration: '81 min', thumbnail: 'https://image.tmdb.org/t/p/w780/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', videoUrl: sampleVideos.tears },
    ],
  },
  {
    id: '19',
    title: 'Wednesday (Miércoles)',
    type: 'series',
    genre: ['Comedia', 'Crimen', 'Fantasía'],
    year: 2022,
    rating: 'TV-14',
    duration: '1 Temporada',
    description: 'Sigue los años de Miércoles Addams como estudiante en la Academia Nevermore, mientras intenta dominar su habilidad psíquica emergente, frustrar una monstruosa ola de asesinatos y resolver el misterio que involucró a sus padres.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    videoUrl: sampleVideos.meltdowns,
    trailerUrl: sampleVideos.meltdowns,
    match: 93,
    isTrending: true,
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome', 'Jamie McShane'],
    director: 'Tim Burton',
    episodes: [
      { id: 'wed-e1', season: 1, episode: 1, title: 'Hija de la aflicción', description: 'Tras ser expulsada de su colegio por una broma mortal, Miércoles es enviada a la Academia Nunca Más, el internado donde se conocieron sus padres.', duration: '59 min', thumbnail: 'https://image.tmdb.org/t/p/w780/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', videoUrl: sampleVideos.meltdowns },
    ],
  },
  {
    id: '20',
    title: 'Oppenheimer',
    type: 'movie',
    genre: ['Biografía', 'Drama', 'Historia'],
    year: 2023,
    rating: 'R',
    duration: '3h 0m',
    description: 'Durante la Segunda Guerra Mundial, el físico teórico J. Robert Oppenheimer lidera el Proyecto Manhattan en Los Álamos, desarrollando las primeras armas nucleares y enfrentándose al dilema moral de alterar la historia de la civilización para siempre.',
    thumbnail: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCV0XLCynUaEFLXB5K9K.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1920/8Gxv8gSFCV0XLCynUaEFLXB5K9K.jpg',
    videoUrl: sampleVideos.bigBuck,
    trailerUrl: sampleVideos.bigBuck,
    match: 96,
    isNew: true,
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    director: 'Christopher Nolan',
  },
];

// Helper functions
export function getCustomSyncedMovies(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pyflix_synced_movies');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllMedia(): MediaItem[] {
  const synced = getCustomSyncedMovies();
  if (!synced || synced.length === 0) return mockMedia;
  const existingIds = new Set(mockMedia.map(m => m.id));
  const newItems = synced.filter(s => !existingIds.has(s.id));
  return [...newItems, ...mockMedia];
}

export function getMediaById(id: string): MediaItem | undefined {
  return getAllMedia().find(item => item.id === id);
}

export function getMediaByType(type: 'movie' | 'series'): MediaItem[] {
  return getAllMedia().filter(item => item.type === type);
}

export function getTrendingMedia(): MediaItem[] {
  return getAllMedia().filter(item => item.isTrending);
}

export function getNewReleases(): MediaItem[] {
  return getAllMedia().filter(item => item.isNew);
}

export function getTopRated(): MediaItem[] {
  return [...getAllMedia()].sort((a, b) => (b.match || 0) - (a.match || 0));
}

export function getTop10(): MediaItem[] {
  return getAllMedia().slice(0, 10);
}

export function getContinueWatching(profileId: string): MediaItem[] {
  return getAllMedia().slice(0, 5).map(item => ({ ...item, match: 90 + Math.floor(Math.random() * 10) }));
}

export function getMyList(): MediaItem[] {
  return getAllMedia().slice(4, 12);
}

export function getCategories(): Category[] {
  const genres = [
    'Acción', 'Aventura', 'Animación', 'Comedia', 'Crimen',
    'Drama', 'Fantasía', 'Terror', 'Misterio', 'Ciencia Ficción', 'Thriller'
  ];

  const all = getAllMedia();
  return genres.map(genre => ({
    id: genre.toLowerCase().replace(' ', '-'),
    name: genre,
    items: all.filter(item => item.genre.includes(genre)),
  })).filter(cat => cat.items.length > 0);
}

export function searchMedia(query: string): MediaItem[] {
  const all = getAllMedia();
  if (!query || !query.trim()) return all;
  const lowerQuery = query.toLowerCase().trim();
  return all.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.genre.some(g => g.toLowerCase().includes(lowerQuery)) ||
    item.cast?.some(c => c.toLowerCase().includes(lowerQuery)) ||
    item.director?.toLowerCase().includes(lowerQuery)
  );
}
