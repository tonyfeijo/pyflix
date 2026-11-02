@echo off
rem ------------------------------------------------------------------
rem  PyFlix - arranque automatico del tunel de Cloudflare
rem
rem  Doble clic en este archivo. Hace todo:
rem    1. Comprueba que Jellyfin local responde
rem    2. Cierra tuneles anteriores
rem    3. Abre un tunel nuevo de Cloudflare
rem    4. Actualiza JELLYFIN_URL en Vercel y redespliega
rem    5. Verifica que https://pyflix-three.vercel.app vuelve a funcionar
rem ------------------------------------------------------------------

setlocal
chcp 65001 >nul
title PyFlix - tunel Cloudflare
cd /d "%~dp0"

echo.
echo  ==================================================
echo   PyFlix - arranque del tunel de Cloudflare
echo  ==================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-pyflix-tunnel.ps1"
set "CODIGO=%ERRORLEVEL%"

echo.
if not "%CODIGO%"=="0" (
    echo  *** ERROR: el proceso termino con codigo %CODIGO%. ***
    echo  *** Revisa los mensajes de arriba.                ***
    echo.
    pause
    exit /b %CODIGO%
)

echo  Esta ventana se cerrara sola en 15 segundos...
ping -n 16 127.0.0.1 >nul
exit /b 0
