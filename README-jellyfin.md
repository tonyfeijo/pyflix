# Conectar Jellyfin con PyFlix

PyFlix importa el catálogo de Jellyfin (películas y series con carátulas,
sinopsis y episodios) y reproduce el contenido directamente desde tu servidor.

> **Importante:** Vercel corre en la nube, así que tu Jellyfin debe ser accesible
> desde internet con **HTTPS**. Si solo funciona en tu red local (`192.168.x.x`),
> PyFlix en producción no podrá verlo.

---

## 1. Comprobar si Jellyfin ya es accesible

1. Abre Jellyfin en tu PC: `http://localhost:8096`.
2. Desconecta el WiFi del móvil (usa datos móviles) y abre la dirección pública
   de tu Jellyfin (si tienes dominio o túnel).
3. Si carga, ya es accesible. Si no, configura un túnel (paso 2).

---

## 2. Exponer Jellyfin con Cloudflare Tunnel (recomendado)

Gratis, sin abrir puertos en el router y con HTTPS automático.

### Requisitos
- Un dominio en Cloudflare (puede ser uno barato).
- Jellyfin corriendo en tu PC/NAS.

### Pasos

1. En Cloudflare: **Zero Trust → Networks → Tunnels → Create a tunnel**.
2. Elige **Cloudflared** y copia el comando de instalación para Windows.
3. Ejecútalo en PowerShell **como administrador**.
4. En el túnel, añade un **Public Hostname**:
   - Subdomain: `jellyfin`
   - Domain: `tudominio.com`
   - Service: `http://localhost:8096`
5. Espera 1–2 minutos y prueba `https://jellyfin.tudominio.com`.

> Alternativas: Tailscale Funnel o un dominio con DDNS + reverse proxy
> (Caddy/Nginx) y el puerto 443 abierto.

---

## 3. Crear la API key en Jellyfin

1. Entra a Jellyfin como administrador.
2. **Dashboard → API Keys → +**.
3. Nombre: `pyflix`.
4. Copia la clave generada (solo se muestra una vez).

---

## 4. Configurar Vercel

En **Vercel → tu proyecto → Settings → Environment Variables**, añade:

| Nombre | Valor |
|---|---|
| `JELLYFIN_URL` | `https://jellyfin.tudominio.com` (sin `/` final) |
| `JELLYFIN_API_KEY` | la clave del paso 3 |

Marca los tres entornos (Production, Preview, Development) y haz **Redeploy**.

> **Importante:** si cambias una variable, los despliegues ya creados **no** la reciben.
> Hay que desplegar de nuevo (Redeploy, o un push nuevo a `main`).

La URL pública de este proyecto (Tailscale Funnel) está como valor por defecto en
`src/lib/jellyfin.ts` (`DEFAULT_JELLYFIN_URL`), así que `JELLYFIN_URL` es opcional:
si no existe, se usa esa. Solo `JELLYFIN_API_KEY` es obligatoria.

### Cómo saber qué falta exactamente

`POST /api/jellyfin/sync` devuelve un diagnóstico con **nombres** de variables
(nunca valores), el commit desplegado y qué falla:

```json
{
  "message": "Falta configurar Jellyfin. Variable(s) sin definir: JELLYFIN_API_KEY...",
  "missing": ["JELLYFIN_API_KEY"],
  "hasUrl": false,
  "usingDefaultUrl": true,
  "hasApiKey": false,
  "envNames": ["JELLYFIN_URL"],
  "vercelEnv": "production",
  "commit": "141f8cc"
}
```

Si `commit` no coincide con tu último commit, el despliegue está desactualizado.

### Prueba local (opcional)

Crea `.env.local` en la raíz del proyecto:

```env
JELLYFIN_URL=http://192.168.1.50:8096
JELLYFIN_API_KEY=tu_api_key
```

Con `npm run dev`, el servidor local sí puede alcanzar tu Jellyfin de la red local.

---

## 5. Importar en PyFlix

No hay que hacer nada: PyFlix importa el catálogo solo. Al abrir la web por
primera vez guarda todo en el navegador (`localStorage`) y lo muestra en la home.

### Actualización automática (no hay botón de sincronizar)

`AutoJellyfinSync` (montado en `src/app/layout.tsx`) mantiene el catálogo al día:

- Al abrir la web pregunta a `GET /api/jellyfin/sync`, que devuelve una **firma**
  del catálogo: `número de títulos:fecha del último añadido`.
- Mientras la pestaña está visible, **repite la comprobación cada 60 s**.
- Si la firma coincide con la guardada, no hace nada.
- Si cambió (añadiste o borraste algo), reimporta en silencio, **actualiza las
  filas de la web en caliente** (sin recargar, sin cortar la reproducción) y
  muestra un aviso discreto abajo a la derecha.
- Se salta las páginas `/watch` para no interrumpir un vídeo.

El botón **Sync** se ha eliminado: el único modo de importar es automático.
Si algo falla, basta recargar la página para reintentarlo.

La importación **pagina** de 200 en 200 hasta el final (`JELLYFIN_PAGE_SIZE`
permite cambiarlo), así que ya no hay tope de 300 títulos.

Al reimportar se **reemplazan** los títulos con id `jf-`: si borras una película
en Jellyfin, desaparece también de PyFlix (antes se acumulaban para siempre).

---

## 6. Bibliotecas de Jellyfin (importante)

Cada biblioteca debe tener su **tipo correcto**. Si todo se mete en una sola
biblioteca "mixta" (o de tipo *Vídeos musicales*) apuntando a la carpeta raíz,
Jellyfin no encuentra los episodios y los mete como películas sueltas.

| Biblioteca | Tipo | Carpeta |
|---|---|---|
| Películas | `movies` | `PELICULAS` |
| Series | `tvshows` | `SERIES` |
| Documentales | `movies` | `DOCUMENTALES` |
| Video clips | `homevideos` | `VIDEO CLIPS` |
| Cortos nacionales | `movies` | `CORTOS NACIONALES` |

PyFlix crea una fila propia en la home para **Video clips**, **Cortos
nacionales** y **Documentales** (según la carpeta de la que venga el archivo).
Esos títulos no se mezclan con las filas de películas y series.

Y activa **«Actualizar biblioteca en tiempo real»** en cada una (Panel →
Bibliotecas → cada biblioteca), para que detecte archivos nuevos al instante.

> Si una serie aparece con **0 episodios**, refresca esa serie:
> Panel → Bibliotecas → ⋯ → *Actualizar metadatos* (o `POST /Items/{id}/Refresh`).
> Es lo que pasa cuando los episodios se importaron con la biblioteca mal tipada.

---

## Cómo funciona

| Función | Ruta |
|---|---|
| Importar catálogo | `POST /api/jellyfin/sync` |
| Proxy de carátulas | `GET /api/jellyfin/image?id=...&type=Primary` |
| Subtítulos | `GET /api/jellyfin/subtitles?id=...&index=...&source=...` |
| Reproducción | URL directa `JELLYFIN_URL/Videos/{id}/stream?static=true` |

- Las carátulas pasan por `/api/jellyfin/image`, así la API key no se expone.
- Los **subtítulos** se piden a Jellyfin ya convertidos a WebVTT y se sirven
  desde `/api/jellyfin/subtitles` (la etiqueta `<track>` no puede enviar la API
  key). En el reproductor aparece un menú con las pistas reales y se activa
  solo el español si existe.
- Solo se muestran subtítulos de **texto** (SRT, ASS, MOV_TEXT…). Los de imagen
  (DVDSUB, PGS) no se pueden convertir a WebVTT y se ocultan del menú.
- El **video sí se reproduce directamente desde Jellyfin** (no a través de
  Vercel) para no consumir ancho de banda ni superar los límites de las
  funciones serverless.
- La URL de reproducción incluye la API key en el navegador. Para un uso
  personal es aceptable; si compartes la web con más gente, considera crear un
  usuario de Jellyfin con permisos limitados.

---

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| `Falta configurar Jellyfin` | Faltan las variables de entorno o no hiciste Redeploy. |
| `No se pudo conectar con Jellyfin` | `JELLYFIN_URL` no es accesible desde internet o no es HTTPS. |
| Carátulas en gris | El proxy no llega a Jellyfin; revisa la URL y la API key. |
| Una serie sale con 0 episodios | La biblioteca estaba mal tipada al escanear; refresca esa serie (ver sección 6). |
| Los títulos nuevos no aparecen | La firma del catálogo no cambió, la pestaña no está visible o han pasado menos de 60 s; espera un poco o recarga la página. |
| El video no reproduce | Códec no soportado por el navegador (p. ej. MKV/H.265). Jellyfin puede transcodificar si lo habilitas. |
