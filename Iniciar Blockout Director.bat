@echo off
rem Lanzador de Blockout Director
rem Inicia un mini servidor local (necesario para cargar src/app.js como modulo ES)
rem y abre la aplicacion en el navegador por defecto.
cd /d "%~dp0"
start "" "http://localhost:8123/index.html"
python -m http.server 8123 >nul 2>&1
if errorlevel 1 (
  rem Si el puerto ya esta en uso, el servidor anterior sigue sirviendo la app.
  exit /b 0
)
