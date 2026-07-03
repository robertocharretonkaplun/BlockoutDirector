# Changelog

Todos los cambios notables de **Blockout Director** se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

---

## [0.5.0] - 2026-07-03

### Añadido
- **Logo AO en la marca principal**: `LogoAO.png` aparece a la izquierda del icono
  y del título **Blockout Director** en la barra superior.
- **Modo "Solo tinte, sin textura" para personajes GLB**: nuevo checkbox en el
  inspector que oculta los mapas de textura del material y deja visible únicamente
  el color/tinte seleccionado.
- **Persistencia del modo de apariencia GLB**: las escenas guardadas, exportadas,
  importadas y los duplicados conservan el estado `tintOnly`.
- **Articulaciones de pie en personajes GLB**: se agregan `Pie izq.` y `Pie der.`
  al inspector cuando el rig tiene huesos `foot_l` / `foot_r`.

### Cambiado
- **Barra superior responsive**: el menú de archivos se compacta a iconos con
  tooltips en anchos medianos y los paneles bajan cuando la barra ocupa dos filas,
  evitando choques visuales con los menús laterales.
- **Aplicación de tinte GLB**: ahora recuerda los mapas originales del material
  para poder alternar entre textura original tintada y solo color sin recargar el
  modelo.

### Corregido
- **Retarget del pie en personajes GLB**: el pie ya no queda levantado al doblar
  rodilla/cadera; se mapean los huesos de pie y se desacopla la inclinación de la
  pantorrilla.
- **Rotación lateral del pie**: se corrige el giro hacia la derecha usando la
  dirección `foot -> ball/toe` del rig como referencia, manteniendo los dedos
  orientados al frente del personaje.

---

## [0.4.0] - 2026-07-02

### Cambiado
- **Rediseño de UI/UX** aplicando las disciplinas de `taste-skill.md` en modo
  *Redesign - Preserve* (auditoría previa, sin tocar arquitectura ni flujos):
  - **Tipografía**: Geist Sans para la interfaz y Geist Mono para valores
    numéricos (inputs de transform, tiempos del timeline, keyframes, etiquetas 3D),
    con degradado elegante a fuentes del sistema si no hay conexión.
  - **Un solo acento** (Color Consistency Lock): azul `#2f6bff` para estados
    activos, selección, foco y keyframes; las acciones primarias usan tinta neutra.
    Se eliminó el rosa como segundo acento de interfaz (se conserva solo como color
    semántico del anillo de selección en el viewport 3D).
  - **Escala de radios documentada** (Shape Consistency Lock): tarjetas 14 px,
    controles 8 px, chips y keyframes en píldora completa.
  - **Iconografía Phosphor** en barra superior, cabeceras de paneles, botones de
    props, perspectivas y timeline (sin SVG dibujados a mano ni emojis).
  - **Estados interactivos completos**: feedback táctil al pulsar (`:active`),
    `focus-visible` con anillo de acento, foco accesible en formularios y
    **estados vacíos** con guía de uso en personajes, props, tomas y capturas.
  - **Sombras tintadas** al tono de la interfaz con borde hairline, backdrop con
    desenfoque en modales y animaciones de entrada para modal y toasts.
  - **Accesibilidad**: contraste AA en textos secundarios y todos los movimientos
    respetan `prefers-reduced-motion`.

### Corregido
- El panel de propiedades (inspector) chocaba con la ventana «Preview final» en
  pantallas de poca altura: su alto máximo ahora reserva el espacio real del
  preview más una separación mínima de 15 px, y el contenido restante se desplaza
  con scroll interno.

---

## [0.3.0] - 2026-07-02

### Añadido
- **Tu GLB como personaje por defecto**: el botón «＋ Personaje» ahora crea instancias
  de `exported-model.glb`. El modelo se autocarga al iniciar (y queda persistido en el
  navegador), con el botón «Cambiar modelo (GLB)…» para reemplazarlo por otro archivo.
  El maniquí sigue disponible como opción secundaria («Maniquí»).
- **Retarget de poses a esqueletos GLB**: las 15 poses de la biblioteca (sentado,
  caminando, señalando, defensivo…) se aplican al esqueleto del modelo importado.
  Compatible con nomenclatura UE (`pelvis`, `spine_01-03`, `upperarm_l`, `thigh_l`…),
  Mixamo y variantes comunes. Incluye:
  - Normalización de bind: brazos y piernas se corrigen a direcciones canónicas
    aunque el modelo venga en T-pose, A-pose o postura *idle*, para que las poses
    aterricen simétricas y exactas en cualquier esqueleto.
  - Desplazamiento vertical de cadera (sentarse / agacharse) convertido a las
    unidades y orientación propias del rig.
  - Ajuste manual de las 12 articulaciones con sliders, también para personajes GLB.
  - Poses personalizadas guardables y reutilizables entre maniquíes y GLB.
- **Sección «Dirección» en el inspector de personaje**:
  - Selector **«Mirar hacia»** con todas las cámaras, personajes y props de la
    escena: un clic gira al personaje hacia el objetivo.
  - Texto en vivo con la orientación inferida (*"orientado hacia la derecha de la
    escena (+X); de frente a la cámara"*), actualizado al rotar con el gizmo.
- **Tinte de color para personajes GLB**: paleta de 8 colores (más opción de colores
  originales) para distinguir instancias del mismo modelo, conservando texturas.
- **Lanzador de doble clic** `Iniciar Blockout Director.bat`: levanta el servidor
  local con Python y abre la app en el navegador. Necesario porque la estructura
  multi-archivo no puede cargarse directamente desde `file://` (ver Corregido).
- **Escena de ejemplo con tu personaje**: los cinco personajes de la escena inicial
  usan el modelo GLB por defecto, con sus poses, roles y tintes.
- Acceso de depuración `window.BD` (registro de entidades, escena, THREE y funciones
  clave) desde la consola del navegador.
- Los duplicados de personajes GLB conservan pose, tinte, emoción y transform.
- La altura de la etiqueta flotante de personajes GLB se calcula desde el hueso de la
  cabeza (el bounding box de mallas skinned no es fiable).

### Cambiado
- Los assets GLB (base64) se conservan en memoria durante toda la sesión: deshacer o
  cargar escenas que los referencian ya no muestra marcadores de "asset faltante".
- Al guardar/exportar, solo se incluyen los assets GLB realmente usados por la escena.
- Las escenas guardadas ahora incluyen la pose retargeteada de los personajes GLB.

### Corregido
- **La app se veía "muerta" al abrir `index.html` con doble clic**: la interfaz
  cargaba (CSS) pero sin escena 3D ni botones. Causa: los navegadores bloquean los
  módulos ES (`src/app.js`) desde `file://` por seguridad (CORS, origen null).
  Solución: usar el lanzador `.bat` (o cualquier servidor local).
- **Dirección inferida invertida 180°**: el generador de prompts asumía que los
  personajes miran hacia −Z cuando la app los orienta hacia +Z; un personaje de cara
  a la cámara se describía "de espaldas" y los perfiles izquierdo/derecho estaban
  intercambiados.
- El botón «Maniquí» del panel de personajes no tenía función asignada tras la
  reestructuración.

---

## [0.2.0] - 2026-07-02

### Añadido
- **Dirección de personajes en las tomas**: al guardar una toma, un campo de texto
  por personaje visible para describir hacia dónde mira, avanza o dirige su atención;
  si se deja vacío se usa la orientación inferida por su rotación.
- **Prompts detallados por personaje**: cada personaje en cuadro incluye en el prompt
  su dirección (orientación en escena + relación con la cámara), su **Transform 3D**
  (posición, rotación XYZ, escala) y su **pose corporal** completa (preset + rotación
  de cada articulación + offset de cadera).
- Las tomas guardan el estado de personajes y props visibles (`characterStates`,
  `propStates`) para poder regenerar el prompt más tarde.

### Cambiado
- **Reestructuración del proyecto**: de un único `index.html` autocontenido a
  `index.html` + `styles.css` + `src/app.js` + `src/promptTools.js` (generación de
  prompts como módulo separado).
- Interfaz simplificada sin emojis en botones y etiquetas.

---

## [0.1.0] - 2026-07-02

### Añadido
- Versión inicial de **Blockout Director** como aplicación web local en un único
  `index.html` (Three.js 0.160 vía CDN), según la especificación de
  `Blockout_Director_Prompt.md`:
  - **Entorno**: 6 skyboxes con preajustes de iluminación, 6 suelos, sol ajustable
    (intensidad, color, altura, giro), luz ambiental, sombras, niebla y grid.
  - **Personajes maniquí** articulados (12 articulaciones) con nombre, rol narrativo,
    emoción, notas, 15 poses predefinidas y poses personalizadas guardables.
  - **Props**: mesa, silla, cubo, esfera, cilindro, pared, puerta y luces puntuales
    con color/intensidad/alcance; importación de modelos GLB con autoescalado.
  - **Cámaras cinematográficas**: múltiples cámaras con FOV, tipo de plano, frustum
    punteado, panel de Perspectivas para mirar y reencuadrar por cualquier cámara,
    y preview final picture-in-picture.
  - **Trayectorias de cámara**: timeline con keyframes (posición + rotación + FOV),
    5 interpolaciones (lineal, ease in/out/in-out, Catmull-Rom), reproducción con
    loop y ruta punteada visible en 3D.
  - **Capturas**: fotogramas JPG 1600×900 limpios (sin ayudas visuales) con galería
    y descarga.
  - **Tomas**: encuadre + notas de dirección + miniatura + prompt generado
    automáticamente para herramientas de IA.
  - **Persistencia**: guardar/abrir/duplicar escenas en el navegador, autoguardado,
    exportar/importar como archivo `.json` (incluye GLB y capturas).
  - Deshacer/rehacer, duplicar, selección con gizmos (mover/rotar/escalar),
    etiquetas flotantes, atajos de teclado y guía integrada.
- Escena de ejemplo "Reunión en la galería" con cinco personajes, mobiliario y dos
  cámaras configuradas.
