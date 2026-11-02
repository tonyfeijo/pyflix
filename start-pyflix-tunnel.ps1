# Levanta el tunel publico hacia Jellyfin y actualiza JELLYFIN_URL en Vercel.
#
# Uso normal: doble clic en  start-pyflix-tunnel.bat
# Uso manual: powershell -ExecutionPolicy Bypass -File .\start-pyflix-tunnel.ps1
#
# La URL de trycloudflare.com es temporal: cambia cada vez que se reinicia el
# tunel. Este script la detecta, la guarda en Vercel, redespliega y comprueba
# que produccion vuelve a responder.
#
# Orden seguro: el tunel anterior NO se cierra hasta que el nuevo esta
# funcionando y desplegado. Asi, si algo falla a mitad, la web sigue en pie.

$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cloudflared = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
# Un log por arranque: el tunel anterior sigue vivo y mantiene abierto el suyo.
$log = Join-Path $env:TEMP ("pyflix-quicktunnel-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".log")
$sitio = 'https://pyflix-three.vercel.app'

function Escribir($texto, $color = 'White') { Write-Host $texto -ForegroundColor $color }

# Ejecuta un comando de consola y devuelve su salida.
# Se usa "cmd /c ... 2>&1" a proposito: el CLI de Vercel escribe en stderr y,
# con ErrorActionPreference = Stop, PowerShell lo tomaria como error fatal.
function Ejecutar($comando, $descripcion) {
    $salida = cmd /c "$comando 2>&1"
    if ($LASTEXITCODE -ne 0) {
        throw "$descripcion (codigo $LASTEXITCODE).`n$($salida -join "`n")"
    }
    return $salida
}

if (-not (Test-Path $cloudflared)) { throw "No se encontro cloudflared en $cloudflared" }

# 1. Jellyfin local debe estar vivo
try {
    Invoke-RestMethod -Uri 'http://127.0.0.1:8096/System/Info/Public' -TimeoutSec 10 | Out-Null
    Escribir "[1/5] Jellyfin local OK  (http://127.0.0.1:8096)" Green
} catch {
    throw "Jellyfin no responde en http://127.0.0.1:8096. Abre Jellyfin (o arranca el servicio JellyfinServer) y vuelve a intentarlo."
}

# 2. Anotar los tuneles que ya estaban (se cerraran al final, no ahora)
$anteriores = @(
    Get-Process cloudflared -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -eq $cloudflared } |
        Select-Object -ExpandProperty Id
)
Escribir "[2/5] Tuneles anteriores activos: $($anteriores.Count) (se cerraran al final)" Green

# 3. Arrancar el tunel nuevo y leer su URL
#    Limpieza de logs viejos (si alguno esta abierto, se ignora).
Get-ChildItem $env:TEMP -Filter 'pyflix-quicktunnel-*.log*' -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-2) } |
    Remove-Item -Force -ErrorAction SilentlyContinue
Start-Process -FilePath $cloudflared `
    -ArgumentList 'tunnel', '--no-autoupdate', '--url', 'http://127.0.0.1:8096' `
    -RedirectStandardError $log -RedirectStandardOutput "$log.out" -WindowStyle Hidden

$url = $null
for ($i = 0; $i -lt 30 -and -not $url; $i++) {
    Start-Sleep -Seconds 2
    $match = Select-String -Path $log, "$log.out" -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($match) { $url = [regex]::Match($match.Line, 'https://[a-z0-9-]+\.trycloudflare\.com').Value }
}
if (-not $url) { throw "No se pudo obtener la URL del tunel. Revisa el log: $log" }
$url | Set-Content (Join-Path $projectDir 'tunnel-url.txt') -NoNewline
Escribir "[3/5] Tunel nuevo: $url" Green

# 4. Comprobar que responde ANTES de tocar Vercel.
#    El DNS de un tunel recien creado tarda unos segundos: se reintenta hasta 90 s.
$code = ''
for ($j = 0; $j -lt 30 -and $code -ne '200'; $j++) {
    if ($j -gt 0) { Start-Sleep -Seconds 3 }
    $code = (curl.exe -s -o NUL -w "%{http_code}" --max-time 20 "$url/System/Info/Public")
}
if ($code -ne '200') {
    throw "El tunel nuevo no responde (HTTP $code). No se toca Vercel y el tunel anterior sigue vivo."
}
Escribir "[4/5] El tunel responde HTTP 200" Green

# 5. Guardar la URL en Vercel, desplegar y comprobar produccion.
#    --force sobrescribe la variable; no se borra antes, para que nunca quede
#    un hueco sin JELLYFIN_URL si algo falla a mitad.
Push-Location $projectDir
try {
    Escribir "[5/5] Actualizando Vercel y desplegando..." Yellow
    Ejecutar "npx --yes vercel env add JELLYFIN_URL production --value `"$url`" --force" `
        "No se pudo guardar JELLYFIN_URL en Vercel" | Out-Null
    $salidaDeploy = Ejecutar "npx --yes vercel --prod --name=pyflix" "Fallo el despliegue en Vercel"
    $salidaDeploy | Select-String -Pattern 'productionUrl|readyState'
} finally {
    Pop-Location
}

Escribir "Comprobando que produccion usa el tunel nuevo..." Yellow
$respuesta = $null
for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Seconds 10
    try {
        $r = Invoke-WebRequest -Uri "$sitio/api/jellyfin/sync" -TimeoutSec 60 -UseBasicParsing
        if ($r.StatusCode -eq 200) { $respuesta = $r.Content; break }
    } catch {
        # 502 mientras Vercel termina de desplegar: se reintenta
    }
}
if (-not $respuesta) {
    throw "Vercel desplego, pero sigue sin conectar con Jellyfin. El tunel anterior sigue vivo: revisa vercel.com"
}

# 6. Ya no hace falta el tunel viejo
foreach ($id in $anteriores) {
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
}

Escribir "" White
Escribir "LISTO. PyFlix: $sitio" Green
Escribir "Catalogo: $respuesta" Green
Escribir "Tunel: $url" Green
exit 0
