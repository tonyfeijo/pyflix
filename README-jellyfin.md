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

### Prueba local (opcional)

Crea `.env.local` en la raíz del proyecto:

```env
JELLYFIN_URL=http://192.168.1.50:8096
JELLYFIN_API_KEY=tu_api_key
```

Con `npm run dev`, el servidor local sí puede alcanzar tu Jellyfin de la red local.

---

## 5. Importar en PyFlix

1. Abre PyFlix.
2. Pulsa el botón de **Sincronizar**.
3. Elige **Importar desde Jellyfin**.
4. El catálogo se guarda en el navegador (`localStorage`) y aparece en la home.

---

## Cómo funciona

| Función | Ruta |
|---|---|
| Importar catálogo | `POST /api/jellyfin/sync` |
| Proxy de carátulas | `GET /api/jellyfin/image?id=...&type=Primary` |
| Reproducción | URL directa `JELLYFIN_URL/Videos/{id}/stream?static=true` |

- Las carátulas pasan por `/api/jellyfin/image`, así la API key no se expone.
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
| El video no reproduce | Códec no soportado por el navegador (p. ej. MKV/H.265). Jellyfin puede transcodificar si lo habilitas. |
