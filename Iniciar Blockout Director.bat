@echo off
rem Lanzador de Blockout Director
rem Inicia un mini servidor local (necesario para cargar src/app.js como modulo ES)
rem y abre la aplicacion en el navegador por defecto.
rem El servidor envia "Cache-Control: no-store" para que el navegador cargue
rem siempre la ultima version de la app (sin necesidad de Ctrl+F5) y solo
rem escucha en 127.0.0.1 (no queda expuesto a la red local).
setlocal
cd /d "%~dp0"
set PORT=8123

rem Localiza Python (python o el lanzador py)
set PY=python
where python >nul 2>&1
if errorlevel 1 (
  set PY=py
  where py >nul 2>&1
  if errorlevel 1 (
    echo No se encontro Python. Instalalo desde https://www.python.org/downloads/
    echo marcando "Add python.exe to PATH" y vuelve a ejecutar este lanzador.
    pause
    exit /b 1
  )
)

start "" "http://localhost:%PORT%/index.html"
echo Blockout Director corriendo en http://localhost:%PORT%
echo Cierra esta ventana para detener el servidor.
%PY% -c "import http.server as h; H=type('H',(h.SimpleHTTPRequestHandler,),{'end_headers':lambda s:(s.send_header('Cache-Control','no-store'),h.SimpleHTTPRequestHandler.end_headers(s))}); h.test(HandlerClass=H,port=%PORT%,bind='127.0.0.1')" >nul 2>&1
if errorlevel 1 (
  rem Si el puerto ya esta en uso, el servidor anterior sigue sirviendo la app.
  exit /b 0
)
