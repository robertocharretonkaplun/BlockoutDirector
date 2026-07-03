# Blockout Director

**Blockout Director** es una aplicación web para crear escenas 3D de referencia.
Permite colocar personajes, objetos, luces y cámaras en un espacio virtual para
planear encuadres, guardar tomas, generar prompts para IA y exportar material de
previsualización.

La herramienta está pensada para artistas, directores, guionistas, creadores de
contenido, equipos de producción y cualquier persona que necesite comunicar una
idea visual antes de producirla.

## Versión publicada

Si GitHub Pages está activo, la aplicación puede abrirse desde:

https://robertocharretonkaplun.github.io/BlockoutDirector/

No requiere instalar dependencias para usarse desde la web. Solo hace falta un
navegador moderno.

## Qué puedes hacer

- Crear una escena 3D desde cero o abrir una escena de ejemplo.
- Agregar personajes tipo maniquí o modelos personalizados en formato `.glb`.
- Colocar props, paredes, puertas, luces y otros elementos de composición.
- Ajustar entorno, suelo, iluminación, sombras, niebla y etiquetas.
- Crear cámaras desde la vista actual y guardar diferentes perspectivas.
- Guardar tomas con encuadre, notas, dirección de personajes y prompt para IA.
- Capturar imágenes limpias en formato JPG.
- Animar cámaras, personajes y props con trayectorias y keyframes.
- Exportar video WebM de una trayectoria.
- Guardar proyectos en el navegador o exportarlos como archivo JSON.
- Usar la interfaz en español o inglés.

## Cómo usarla

1. Abre la aplicación.
2. En el lanzador inicial, elige **Escena de ejemplo**, **Nuevo proyecto** o
   **Importar archivo**.
3. Agrega personajes y objetos desde los paneles laterales.
4. Selecciona un elemento para editar su posición, rotación, escala, color, pose
   o detalles narrativos.
5. Navega hasta el encuadre deseado y crea una cámara desde la vista actual.
6. Usa **Capturar** para guardar una imagen o **Guardar toma** para guardar la
   composición con prompt.
7. Usa **Guardar** para conservar el proyecto en el navegador o **Exportar** para
   descargar un archivo `.json` completo.

## Controles principales

- **Clic izquierdo + arrastrar**: orbitar la vista.
- **Rueda del mouse**: acercar o alejar.
- **Clic derecho + arrastrar**: mover la vista lateralmente.
- **Clic sobre un objeto**: seleccionar.
- **W**: mover.
- **E**: rotar.
- **R**: escalar.
- **F**: centrar la vista en el objeto seleccionado.
- **Supr**: eliminar el objeto seleccionado.
- **Ctrl + D**: duplicar.
- **Ctrl + Z / Ctrl + Y**: deshacer y rehacer.

## Ejecución local

Por seguridad del navegador, la app debe ejecutarse desde un servidor local. No
se recomienda abrir `index.html` directamente con doble clic.

En Windows puedes usar:

```bat
Iniciar Blockout Director.bat
```

El lanzador abre la aplicación en:

```text
http://localhost:8123/index.html
```

También puedes usar cualquier servidor estático. Por ejemplo, desde la carpeta
del proyecto:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Luego abre:

```text
http://localhost:8123/
```

## Publicación en GitHub Pages

Este proyecto es una aplicación web estática. Para publicarlo en GitHub Pages:

1. Sube el repositorio a GitHub.
2. En GitHub, entra a **Settings > Pages**.
3. En **Source**, selecciona **Deploy from a branch**.
4. Elige la rama `main`.
5. En carpeta, selecciona `/(root)`.
6. Deja **Custom domain** vacío, salvo que tengas un dominio propio.

GitHub Pages publicará el sitio con la estructura actual del proyecto.

## Estructura del proyecto

```text
BlockoutDirector/
├─ index.html                    Interfaz principal
├─ styles.css                    Estilos visuales
├─ src/
│  ├─ app.js                     Lógica principal de la aplicación 3D
│  ├─ promptTools.js             Generación de prompts para tomas
│  └─ i18n.js                    Textos en español e inglés
├─ Slate/
│  ├─ LogoAO.png                 Logo de la aplicación
│  ├─ exported-model.glb         Modelo base de personaje
│  └─ camera.glb                 Modelo 3D de cámara
├─ Iniciar Blockout Director.bat Lanzador local para Windows
├─ CHANGELOG.md                  Historial de cambios
└─ README.md                     Documentación general
```

## Guardado y exportación

Blockout Director tiene dos formas principales de guardar trabajo:

- **Guardar**: conserva el proyecto en el navegador usando almacenamiento local.
  Es práctico para continuar trabajando en la misma computadora.
- **Exportar**: descarga un archivo `.json` con la escena. Es la opción
  recomendada para respaldos, compartir proyectos o moverlos a otra computadora.

Las capturas se descargan como imágenes JPG. Las trayectorias pueden exportarse
como video WebM cuando el navegador lo permite.

## Requisitos

- Navegador moderno con soporte para WebGL y módulos ES.
- Conexión a internet para cargar Three.js desde CDN.
- Python instalado solo si quieres usar el lanzador local `.bat` o un servidor
  local con `python -m http.server`.

## Notas importantes

- Los proyectos guardados en el navegador dependen del almacenamiento local de
  ese navegador y computadora.
- Si borras los datos del sitio, también se borran los proyectos guardados ahí.
- Para respaldo permanente, usa **Exportar**.
- Algunos formatos de video o funciones de grabación pueden variar según el
  navegador.

## Historial de cambios

Consulta [CHANGELOG.md](CHANGELOG.md) para ver las versiones y cambios recientes.

## Licencia

Este proyecto se distribuye bajo una licencia de uso modificable, no comercial y
con atribución obligatoria a **Roberto Charreton Kaplun** y **Attribute
Overload**.

Puedes revisar, usar, modificar y compartir el proyecto bajo las condiciones de
la licencia, pero no puedes venderlo ni comercializar versiones derivadas sin
autorización previa y por escrito.

Consulta [LICENSE.md](LICENSE.md) para leer los términos completos.
