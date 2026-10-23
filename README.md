# PyFlix - Clon Profesional de Netflix

Un clon completo, moderno y optimizado de **Netflix**, diseñado siguiendo fielmente la experiencia de usuario y estética de [netflix.com/browse](https://www.netflix.com/browse), utilizando **Next.js 15 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS**.

El código es 100% original y nuevo, utilizando vídeos de dominio público y licencias Creative Commons (como Blender Open Movie Project y Google Test Streams) para evitar cualquier infracción de derechos de autor, además de ser compatible de forma opcional con la API de **The Movie Database (TMDB)**.

---

## 🌟 Características Destacadas

### 🎬 Experiencia Fiel a Netflix (`/browse`)
- **Billboard Hero Dinámico**: Cabecera cinematográfica con teaser de vídeo en reproducción automática, degradados oscuros, botón de "Reproducir", "Más información", conmutador de sonido (Mute/Unmute) y clasificación por edad.
- **Sonido "Ta-Dum" de Netflix**: Sintetizador original mediante la **Web Audio API** que reproduce el icónico acorde de cuerda y sub-grave al pulsar "Reproducir" sin necesidad de archivos externos.
- **Fila TOP 10 de Netflix (`Top10Row`)**: Los emblemáticos números gigantes estilizados en 3D del 1 al 10 con efecto de sombra y tipografía bold para las producciones más populares.
- **Ventana Modal de Detalles (`DetailModal`)**: Modal interactivo idéntico al de Netflix que se superpone a la navegación mostrando:
  - Tráiler de vídeo en cabecera con sonido conmutable.
  - Botón de reproducción, botón interactivo para agregar/quitar de **Mi lista** y botón de **Me gusta**.
  - Porcentaje de coincidencia (Match %), clasificación por edades, duración y etiquetas de audio y vídeo (HD, Dolby 5.1).
  - Selector de temporadas y lista detallada de episodios con miniaturas y sinopsis individuales.
  - Cuadrícula de recomendaciones "Títulos similares".
- **Filas Horizontales con Desplazamiento Suave**: Controles de navegación laterales que aparecen al pasar el ratón, con animación escalonada y tarjetas 16:9 con efecto hover ampliado.
- **Pestañas de Filtrado Rápido**: Filtra instantáneamente el catálogo entre *Todos*, *Series*, *Películas*, *Novedades populares* y *Mi lista*.

### 📋 Gestión de "Mi Lista" (Watchlist Persistente)
- Sincronización en tiempo real mediante `localStorage` y eventos personalizados.
- Cualquier película o serie agregada mediante el botón `+` aparece de inmediato en la sección "Mi lista" del inicio y en la vista dedicada.

### 👤 Sistema de Perfiles Multiusuario (`/profiles`)
- Pantalla "¿Quién está viendo?" con avatares dinámicos vectoriales (DiceBear).
- Perfil Adulto vs. Perfil Niños (Kids mode).
- Capacidad para crear, editar y eliminar perfiles, guardando la sesión activa en el navegador.

### 🔍 Búsqueda en Tiempo Real (`/search`)
- Búsqueda instantánea con rebote (debounced).
- Panel de filtros por formato (Películas / Series) y por género (Acción, Ciencia Ficción, Crimen, Drama, etc.).
- Resultados dinámicos con separación por categorías.

### 📺 Reproductor de Vídeo Avanzado (`Player`)
- Atajos de teclado completos:
  - `Espacio` o `K`: Reproducir / Pausar
  - `←` / `→`: Retroceder / Avanzar 10 segundos
  - `↑` / `↓`: Subir / Bajar volumen
  - `M`: Silenciar / Activar sonido
  - `F`: Pantalla completa
  - `Esc`: Salir de pantalla completa o cerrar ajustes
- Soporte de Picture-in-Picture (PiP).
- Selector de velocidad (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x), calidad y subtítulos.
- Cuenta regresiva automática para el siguiente episodio.

---

## 🛠 Stack Tecnológico

| Herramienta | Versión | Uso |
|---|---|---|
| **Next.js** | 15.0.0 (App Router) | Framework React de última generación |
| **React** | 19.0.0 | Interfaz de usuario reactiva |
| **TypeScript** | 5.6 | Tipado estático y robustez de código |
| **Tailwind CSS** | 3.4 | Estilizado utility-first con paleta oficial de Netflix |
| **Framer Motion** | 11.0 | Animaciones de modales, tarjetas y transiciones |
| **Lucide React** | 0.446 | Iconografía vectorial moderna |

---

## 📁 Estructura del Proyecto

```
D:\TONY\PROYECTOS IA\PROYECTO_PYFLIX/
├── src/
│   ├── app/
│   │   ├── globals.css              # Estilos globales y utilidades personalizadas
│   │   ├── layout.tsx               # Layout raíz y metadatos
│   │   ├── page.tsx                 # Página principal interactiva (Home/Browse)
│   │   ├── profiles/page.tsx        # Selección y administración de perfiles
│   │   ├── search/page.tsx          # Búsqueda en vivo y filtrado
│   │   └── watch/[id]/page.tsx      # Ruta de detalle directo y reproductor
│   ├── components/
│   │   ├── content/
│   │   │   ├── DetailModal.tsx      # Modal de detalle y episodios al estilo Netflix
│   │   │   ├── Hero.tsx             # Billboard dinámico con vídeo y sonido
│   │   │   ├── MovieCard.tsx        # Tarjeta 16:9 con hover interactivo
│   │   │   ├── MovieRow.tsx         # Fila con scroll horizontal y flechas de navegación
│   │   │   ├── Player.tsx           # Reproductor con atajos y controles completos
│   │   │   └── Top10Row.tsx         # Fila TOP 10 con números gigantes Netflix
│   │   ├── layout/
│   │   │   └── Header.tsx           # Barra superior con scroll blur, buscador y selector de perfil
│   │   └── ui/
│   │       ├── Button.tsx           # Botones reutilizables
│   │       └── Input.tsx            # Inputs estilizados
│   └── lib/
│       ├── audio.ts                 # Sintetizador Web Audio del sonido "Ta-Dum"
│       ├── mock-data.ts             # Catálogo de películas, series y episodios
│       ├── tmdb.ts                  # Integración opcional con The Movie Database
│       ├── types.ts                 # Interfaces TypeScript
│       ├── utils.ts                 # Funciones auxiliares
│       └── watchlist.ts             # Hook y persistencia de Mi Lista
├── .env.example                     # Plantilla de variables de entorno
├── next.config.js                   # Configuración de optimización y dominios
├── package.json                     # Dependencias y scripts
├── tailwind.config.ts               # Paleta de colores y configuraciones de diseño
└── tsconfig.json                    # Configuración de TypeScript
```

---

## 🚀 Cómo Ejecutar el Proyecto

El proyecto está listo para ser utilizado en cualquier momento.

### 1. Iniciar en modo Desarrollo
```powershell
cd "D:\TONY\PROYECTOS IA\PROYECTO_PYFLIX"
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

### 2. Compilar e Iniciar en modo Producción
```powershell
cd "D:\TONY\PROYECTOS IA\PROYECTO_PYFLIX"
npm run build
npm run start
```

---

## 🎨 Paleta de Colores Netflix

```css
--netflix-black:     #000000
--netflix-dark:      #141414
--netflix-card:      #181818
--netflix-cardHover: #252525
--netflix-red:       #E50914
--netflix-redHover:  #F40612
--netflix-gray:      #808080
--netflix-lightGray: #B3B3B3
```

---

## ⚖️ Licencia y Derechos de Autor

Este proyecto ha sido desarrollado con fines educativos y de demostración técnica. No utiliza código propietario ni infringe derechos de autor. Las marcas y nombres referenciados pertenecen a sus respectivos dueños.
