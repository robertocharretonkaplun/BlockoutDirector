# Changelog

Todos los cambios notables de **Blockout Director** se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

---

## [0.17.4] - 2026-07-13

### Cambiado
- Se retiró también el botón **Proyectos** de la barra superior: el lanzador
  se abre desde **Archivo > Proyectos…**. La barra queda solo con logo, menús
  y las herramientas de trabajo (Mover/Rotar/Escalar, Capturar, Guardar toma,
  Trayectoria, Production).

## [0.17.3] - 2026-07-13

### Cambiado
- **Barra superior mínima**: se retiraron también los botones Exportar e
  Importar (viven en el menú **Archivo**) y Guía (en **Ayuda**). El conmutador
  de idioma ES/EN pasa al menú **Ayuda** (el lanzador de proyectos conserva el
  suyo). En la barra quedan: logo, menús, Mover/Rotar/Escalar, Capturar,
  Guardar toma, Trayectoria, Production y Proyectos.

## [0.17.2] - 2026-07-13

### Cambiado
- **Barra superior más limpia**: se retiraron los botones de Deshacer/Rehacer
  (ahora solo en el menú **Edición** y con Ctrl+Z / Ctrl+Y) y los botones
  Nueva, Guardar y Abrir (ahora solo en el menú **Archivo**). Quedan en la
  barra Proyectos, Exportar, Importar y Guía junto a las herramientas de
  transformación y captura.

## [0.17.1] - 2026-07-13

### Corregido
- **Los menús de la barra principal no se veían al hacer clic**: el `#topbar`
  recorta su contenido (overflow) y los desplegables quedaban ocultos bajo la
  barra. Ahora se montan como capa flotante sobre `<body>` con posición fija
  (y se reencajan si se salen de la ventana), por lo que se muestran siempre.

## [0.17.0] - 2026-07-13

### Añadido
- **Barra de menú principal** estilo software profesional (Archivo / Edición /
  Vista / Director / Herramientas / Ventana / Ayuda) en la barra superior, con
  submenús, marcas de estado y atajos visibles. Organiza todas las funciones
  existentes y las nuevas sin saturar la interfaz.
- **Archivo**: Nueva/Abrir/Importar/Guardar/Guardar como, **Exportar prompt**
  (modal con copiar y descarga .txt) y **Exportar video con formato**: WebM y
  MP4 (H.264) cuando el navegador lo soporta (Chrome/Edge recientes), para
  mejor compatibilidad con editores y herramientas de IA.
- **Edición**: Deshacer/Rehacer/Duplicar/Eliminar y **Agrupar/Desagrupar
  objetos** mediante colecciones.
- **Vista**: Vista libre, submenú «Ver por cámara», conmutadores de
  cuadrícula/sombras/niebla/etiquetas y mostrar/ocultar todos los props.
- **Director**: Ajustes de cámara (Pitch/Yaw/Roll y FOV explícitos), Guardar
  toma, Trayectorias, Editor de keyframes, Ajustes de prompt, Visibilidad de
  props y Notas de escena.
- **Sistema de visibilidad por entidad**: Visible / Solo viewport (se ve al
  editar pero queda fuera de capturas, preview, video y prompt) / Oculto;
  más «Auxiliar», «Bloqueado» (no seleccionable con clic) y excepción de
  prompt por objeto (según reglas / incluir siempre / omitir siempre).
  Disponible en el inspector, en el ojo del Outliner y en Director >
  Visibilidad de props. Se guarda con la escena.
- **Reglas de exclusión del prompt** (Director > Ajustes de prompt): omitir
  ocultos/solo-viewport, props con «copia/copy» en el nombre, duplicados por
  tipo y nombre base, y props auxiliares; con excepciones manuales por objeto.
- **Colecciones de escena** (Ventana > Colecciones / Edición > Agrupar):
  agrupan personajes, props y cámaras para mostrar/ocultar/bloquear y aplicar
  transformaciones en bloque (ΔX/ΔY/ΔZ, giro Y, escala). Viajan con la escena.
- **Atajos configurables** (Herramientas > Atajos de teclado): alternar Vista
  Libre/Cámara (C), cambiar cámara activa (N), crear keyframe (K), reproducir
  (P), ocultar selección (H), duplicar (Ctrl+D), abrir Trayectorias (T) y
  exportar prompt (Shift+E). Reasignables y persistentes.
- **Cursor infinito** (Herramientas > Preferencias): Pointer Lock en el vuelo
  libre para que el ratón no se detenga en el borde de la pantalla.
- **Modo de rotación por trayectoria** (Herramientas > Modo de rotación y
  selector en el panel de Trayectorias): cuaternión (camino más corto, sin
  gimbal lock) o Euler (permite vueltas de más de 360° entre keyframes).
- **Ajustes de niebla** (Herramientas > Ajustes de niebla): modo lineal
  (distancia inicial/final) o exponencial (densidad), color propio o del
  cielo. Se guarda con la escena.
- **Outliner**: reordenar personajes, props y cámaras con arrastrar y soltar
  (afecta el orden de las pistas del timeline y del prompt) y botón de ojo
  para ocultar/mostrar.

## [0.16.1] - 2026-07-10

### Corregido
- **Roll de cámara (Dutch angle) editable**: el campo Z de «Rotación (°)» ahora
  inclina la cámara de verdad. Las cámaras (y la Vista Libre) usan orden de
  ejes YXZ, de modo que X = picado/contrapicado, Y = paneo y Z = roll puros; el
  control de órbita ya no borra el roll en cada frame (se conserva al navegar,
  volar y cambiar de vista). Las escenas, tomas y keyframes antiguos se siguen
  leyendo con su orden original (XYZ), sin cambiar su orientación.
- **Rotación X positiva permitida (contrapicados y nadir)**: se eliminó el tope
  polar de la órbita que impedía mirar hacia arriba, y el vuelo libre acepta
  pitch hasta ±89.9° (antes ±87.6°).
- **Las sombras cubren toda la cuadrícula**: el volumen de sombra del sol pasó
  de ±24 m a ±60 m (con mapa de 4096 px y el sol a 60 m), por lo que ya no se
  cortan antes del borde de la cuadrícula de 80x80 m.
- **Deshacer/Rehacer ya no expulsa de la vista de cámara**: si estabas mirando
  por una cámara, tras el undo/redo se restaura esa misma vista en lugar de
  volver a la Vista Libre.
- **Ortografía de los prompts generados**: se añadieron los acentos que
  faltaban (cinematográfico, cámara, iluminación, emoción, dirección, posición,
  rotación, composición, relación, ángulo, atmosférica), con sus claves de
  traducción EN sincronizadas.
- **Timeline ya no queda fijo en 1 s al abrir/importar una escena**: los
  personajes y props GLB se cargan de forma asíncrona y el panel de
  Trayectorias se refrescaba antes de que existieran; ahora la duración y las
  pistas se recalculan al terminar de instanciarse cada GLB.

## [0.16.0] - 2026-07-08

### Añadido (Scene Graph)
- **Nodo de Personaje vinculado al actor (fuente única, sin duplicar texto)**:
  al vincular un actor, sus campos **Rol narrativo, Emoción y Notas
  narrativas** se comparten con los detalles del actor de la escena (marcados
  con un icono de enlace). Editarlos en el nodo actualiza al actor y
  viceversa; el título del nodo es el nombre del actor y renombrarlo renombra
  al actor. Los campos propios del nodo (imagen, postura, vestuario, notas de
  dirección actoral) siguen siendo de planeación. El mecanismo de vínculo es
  reutilizable para otros nodos.
- **Nodo Prompt resultante**: agrega el contenido de todos los nodos
  conectados a su entrada (personajes, tomas, referencias, notas) en un prompt
  con encabezado de escena, más una instrucción inicial opcional. Tiene botón
  **Copiar prompt** y **Regenerar**, y se actualiza solo al cambiar las
  conexiones o los datos de los nodos conectados.

## [0.15.1] - 2026-07-08

### Corregido
- **El Scene Graph es único por escena y no se pierde**: las ediciones del
  Scene Graph se guardan de inmediato en el slot de su propia escena (antes
  solo se conservaban al guardar la escena entera, y podían perderse al
  cambiar de escena). Todos los caminos de cambio de escena (Abrir, Nueva,
  escena de ejemplo, «Abrir escena» de un Nodo de Escena) preservan primero
  la escena actual. Verificado: dos escenas mantienen grafos distintos que
  sobreviven al cambio de escena y a recargar la página.

## [0.15.0] - 2026-07-08

### Añadido
- **Dos grafos con propósitos distintos**, al estilo Level Blueprint vs.
  lógica de proyecto de Unreal:
  - **Production Graph** (nivel proyecto, botón en la barra superior): el mapa
    de la producción. Sus **Nodos de Escena** se vinculan a una escena
    guardada, muestran su miniatura y estado, y con **«Abrir escena»** cargan
    ese mundo 3D (guardando antes la escena actual). Se guarda en el proyecto
    (`bd_projects_v1`), independiente de las escenas.
  - **Scene Graph** (nivel escena, botón en World Settings): el desglose
    interno de una escena — tomas, personajes, referencias. Vive dentro de la
    escena y viaja con ella. Ya no ofrece el tipo «Escena».
- **Capa de proyecto ligera**: un proyecto agrupa el Production Graph y
  referencia escenas guardadas por nombre; las escenas 3D se siguen guardando
  por separado (sin llenar el almacenamiento). Migración automática: al
  arrancar se crea un proyecto inicial sembrado con un Nodo de Escena por cada
  escena ya guardada.
- La cabecera del editor muestra qué grafo está abierto (Production/Scene) y
  su contexto (proyecto o escena).

## [0.14.0] - 2026-07-08

### Añadido (editor de nodos)
- **Crear-y-conectar desde un pin** (flujo tipo Unreal): al arrastrar desde un
  puerto y soltar en un espacio vacío, aparece el menú de tipos de nodo; el
  nodo elegido se crea junto al cursor y queda **conectado automáticamente** a
  ese pin (respetando el sentido: desde una salida crea el nodo aguas abajo,
  desde una entrada lo crea aguas arriba).

### Cambiado (editor de nodos)
- **La rueda dentro de un nodo hace scroll de su contenido**, no zoom del
  grafo. El zoom con rueda sigue funcionando sobre el lienzo vacío.

## [0.13.1] - 2026-07-08

### Corregido
- **El menú de «Añadir nodo» / clic derecho no creaba nodos**: al pulsar una
  opción, el `pointerdown` burbujeaba al lienzo y ocultaba el menú antes de
  que el clic la activara. Ahora el lienzo ignora los eventos que nacen dentro
  del menú, de modo que la opción crea su nodo correctamente.

## [0.13.0] - 2026-07-08

### Añadido
- **Editor de Nodos Avanzado para dirección cinematográfica** (nuevo módulo
  `src/nodeGraph.js`), accesible desde **World Settings → Editor de nodos**.
  Lienzo a pantalla completa con **zoom** hacia el cursor, **paneo**, rejilla
  de fondo y **menú contextual** (clic derecho) para crear nodos. Seis tipos:
  - **Nodo de Escena** (descripción, intención narrativa/visual, estado,
    notas de dirección).
  - **Nodo de Toma** (vínculo a una toma del proyecto, captura/referencia,
    número, tipo de plano, ángulo, movimiento, FOV/lente, notas técnicas y de
    continuidad, estado).
  - **Nodo de Personaje** (vincula un **actor existente del editor**, con
    botón «Ver en escena» que lo selecciona en el viewport; imagen, emoción,
    postura, vestuario y notas de dirección actoral).
  - **Nodo de Referencia Visual** (subir imagen o **capturar desde el
    viewport**, categoría y descripción).
  - **Nodo de Video de Referencia** (subir video con preview reproducible).
  - **Nodo de Descripción / Nota** (texto libre).
  - **Conexiones libres** arrastrando entre puertos (entrada/salida), líneas
    bézier; clic en una línea la elimina. Nodos con **arrastrar**, edición
    inline de campos, **plegar**, **duplicar**, **renombrar** (título
    editable) y **eliminar** (botón o tecla Supr).
- El grafo se **guarda dentro de la escena** (navegador, exportación JSON y
  undo/redo): nodos, posiciones, tipos, conexiones, textos, imágenes,
  vínculos a actores/tomas y estado de la vista (zoom/pan).

### Notas
- Los títulos por defecto de los nodos siguen el idioma activo (ES/EN); al
  renombrarlos, el nombre propio se conserva.
- Los videos incrustados grandes (>24 MB) pueden no caber en el
  almacenamiento del navegador: usa **Exportar** para conservarlos en el
  archivo del proyecto.

---

## [0.12.0] - 2026-07-07

### Cambiado
- **Rail derecho de pestañas verticales**: Outliner, Details y Preview final
  se organizan ahora igual que Colocar actores — una barra vertical en el
  borde derecho cuyas pestañas despliegan su panel (y se pliegan al volver a
  pulsarlas o con el botón »). La pestaña activa se recuerda entre sesiones y
  el viewport gana todo el ancho cuando ambos laterales están plegados.
- **Cabecera más alta (48 px)** con la **versión de la app** bajo el título
  de Blockout Director (mantener sincronizada con el `?v=` al publicar).

---

## [0.11.0] - 2026-07-07

### Corregido
- **Editar la rotación/posición de una cámara mientras se mira a través de
  ella** ya no se revierte al primer frame: la órbita se reapunta tras cada
  cambio del panel Details (antes `controls.update()` restauraba la
  orientación anterior y parecía que "solo aplicaba una vez").
- **FOV con paso de 0.5°** (antes solo enteros) y **zoom por keyframes
  fluido**: el helper del frustum ya no se reconstruye en cada frame durante
  la reproducción (causaba tirones al animar el FOV), solo cuando el cambio
  supera 1.5°.
- **Escala por eje (X/Y/Z) en Details**: antes un solo campo global pisaba
  cualquier escala no uniforme hecha con el gizmo.
- **Las articulaciones vuelven exactamente a 0°**: cada eje tiene ahora campo
  numérico junto al deslizador y doble clic en el deslizador restablece a 0
  (el deslizador solo, por resolución de píxeles, saltaba de -1 a 1).

### Añadido
- **Poses en keyframes**: los keyframes de personajes con esqueleto guardan la
  pose completa (articulaciones y cadera) y la reproducción interpola entre
  ellas → transiciones entre poses y animación de articulaciones sin
  herramientas extra. La exportación de video también restaura la pose.
- **Arrastrar keyframes** en las pistas del panel Trayectorias para moverlos
  en el tiempo (pasos de 0,1 s; clic va al keyframe, clic derecho lo borra).
- **Gestión de poses personalizadas**: botones para sobrescribir la pose
  seleccionada con la pose actual y para borrarla (los presets de fábrica
  quedan protegidos).
- **Inspector en tiempo real**: posición, rotación, escala y orientación del
  personaje se actualizan en vivo mientras se mueve la entidad en el viewport
  (gizmo, vuelo o reproducción).

### Notas
- El modo de interpolación del timeline ya se aplicaba en caliente por entidad
  (no hace falta rehacer keyframes): se selecciona la entidad en la pista y se
  cambia el modo en el selector.

---

## [0.10.0] - 2026-07-07

### Añadido
- **Presets de perspectiva en Colocar actores**: la antigua sección
  Perspectivas del dock derecho se integra como lista desplegable en una nueva
  tarjeta **Cámaras** (pestaña Colocar actores) con: Vista libre (Director),
  Main Shot, Primer plano (85 mm), Plano medio (50 mm), Plano general (24 mm),
  Sobre el hombro, Vista superior y Vista lateral. Elegir un preset crea la
  cámara (o la reencuadra si ya existe, buscándola por nombre) con lente y
  tipo de plano acordes, y la convierte en la vista activa; Main Shot nunca se
  reencuadra. El desplegable refleja siempre la cámara activa (las cámaras
  que no son preset se muestran como «· nombre»). El botón **Cámara desde
  vista** sigue creando una cámara desde el encuadre actual.
- **Selector de cámara en el preview Main Shot**: la cabecera del panel de
  preview final ahora es un desplegable con todas las cámaras de la escena
  para probar composición y encuadre; la elección se recuerda y, si la cámara
  se elimina, el preview vuelve a Main Shot.

### Cambiado
- **Controles de cámara estilo editor profesional**: el vuelo libre
  (mirar + WASD) pasa del clic izquierdo al **clic derecho**, como en Unreal;
  el **clic izquierdo** queda reservado para seleccionar e interactuar con la
  escena (Alt+izquierdo orbita); el **botón central** panea y la **rueda**
  hace zoom (en vuelo ajusta la velocidad). El menú contextual del navegador
  queda desactivado sobre el viewport. Guía rápida actualizada.
- **El panel Details siempre está visible** como sección propia del dock
  derecho (bajo el Outliner): sin selección muestra la leyenda «Selecciona un
  elemento de la escena para ver sus detalles» en lugar de desaparecer.

### Corregido
- **Pantalla negra en GitHub Pages tras publicar**: el navegador podía
  combinar un `app.js` cacheado de la versión anterior con el `index.html`
  nuevo (Pages cachea 10 min), lo que rompía el arranque antes de iniciar el
  render. Los archivos propios (`styles.css`, `app.js` y sus imports) llevan
  ahora un sufijo de versión `?v=` que se actualiza en cada release e
  invalida la caché de forma atómica.

### Eliminado
- Panel **Perspectivas** del dock derecho (sustituido por los presets de
  cámara y el Outliner, donde ya se listaban las cámaras).



### Añadido
- **Rail vertical de pestañas estilo Unreal Engine** en el borde izquierdo:
  **Colocar actores** (personajes y props), **World Settings** (datos de
  escena), **Entorno** (skybox, suelo e iluminación) y **Tomas** (tomas y
  capturas). Cada pestaña despliega su contenido como panel lateral; volver a
  pulsarla (o el botón «) pliega el panel y devuelve el espacio al viewport.
  La pestaña activa se recuerda entre sesiones.
- Nuevo módulo `src/dock.js` con la lógica del rail y del panel desplegable.

### Cambiado
- **Dock derecho reorganizado como en Unreal**: Outliner arriba (ahora
  plegable), Details debajo, Perspectivas y el preview final (Main Shot)
  anclado al fondo. El Outliner ya no vive en el panel izquierdo.
- **Tema visual estilo UE5**: paleta gris neutro oscuro con separadores casi
  negros, campos hundidos, acento azul de selección más sobrio (pestañas,
  chips y filas activas), barra superior compacta y radios de 4 px en los
  controles.
- Los datos de escena (nombre y descripción) se declaran directamente en el
  panel World Settings del HTML; se elimina la reorganización de paneles por
  script (`setupPanelLayout`), sustituida por el rail de pestañas.



### Añadido
- **Controles de fotografía en el inspector de cámara**: selector de **objetivo**
  (14/24/35/50/85/135 mm, sincronizado en ambos sentidos con el deslizador de
  FOV y mostrado también en la etiqueta 3D de cada cámara), **encuadre** por
  cámara (16:9, 9:16 vertical, 2.39:1 cinemascope y 1:1) y conmutador de
  **regla de tercios**. Nuevo botón «Copiar prompt de la toma» que copia el
  prompt de la cámara sin pasar por «Guardar toma».
- **Guías de encuadre en el viewport**: al mirar por una cámara, la zona que
  realmente captura su encuadre se marca con un recuadro y máscara oscura
  (letterbox/pillarbox) y, si la regla de tercios está activa, con sus líneas.
  El preview final (PiP) también respeta el encuadre y muestra los tercios.
- **El encuadre viaja por todo el pipeline**: capturas JPG, miniaturas de tomas
  y proyectos, y el video WebM exportado se generan con la relación de aspecto
  de la cámara (p. ej. 900x1600 en 9:16, 1600x669 en 2.39:1). El objetivo (mm)
  y el encuadre se incluyen en los prompts generados y se guardan/exportan con
  la escena (compatible con escenas antiguas, que quedan en 16:9).
- **Jerarquía + editor de keyframes en Trayectorias** (estilo dope sheet): el
  panel muestra todas las entidades agrupadas (Cámaras / Personajes / Props)
  con contador de keyframes, y cada fila tiene una pista con sus keyframes como
  marcadores en el tiempo (azul cámaras, ámbar objetos) y una línea de
  reproducción sincronizada con el scrub. Clic en un marcador salta a ese
  instante; clic derecho lo elimina; clic en el nombre selecciona la entidad en
  la escena (y viceversa: seleccionar en el viewport activa su fila). Un botón
  en la cabecera **activa/desactiva el editor de keyframes**, dejando solo la
  jerarquía.

### Cambiado
- **Layout acoplado estilo editor de motor de juego (UE)**: los paneles ya no
  flotan sobre el lienzo ni se superponen entre sí. El viewport 3D es un panel
  central que **se redimensiona** al hueco disponible; dock izquierdo (escena,
  entorno, personajes, props, tomas, capturas), dock derecho (Perspectivas +
  Propiedades con scroll + Preview final anclado abajo) y el panel de
  Trayectorias como **dock inferior** que empuja el viewport al abrirse (y se
  encoge al ocultar el editor de keyframes). La barra superior puede ocupar una
  o dos filas y los docks la siguen automáticamente. Selección por clic,
  etiquetas flotantes y guías de encuadre usan ahora coordenadas del viewport;
  toasts y HUD de vuelo se centran sobre el viewport. Escala de z-index
  documentada en la hoja de estilos.
- El selector de entidad del timeline se sustituye por la jerarquía con pistas;
  la fila de chips de keyframes de la entidad activa se conserva bajo la pista.
- La guía rápida documenta objetivo/encuadre/regla de tercios y el nuevo panel
  de trayectorias.

---

## [0.7.0] - 2026-07-03

### Añadido
- **Navegación de cámara estilo Unreal Engine («vuelo libre»)**: manteniendo
  pulsado el **clic izquierdo**, el ratón mira alrededor y **WASD** desplaza la
  cámara en la dirección de vista; **Q/E** baja/sube, **Shift** acelera y la
  **rueda** ajusta la velocidad de vuelo (con indicador en pantalla). Funciona
  tanto en la vista libre del director como reencuadrando cualquier cámara desde
  su perspectiva. Un **clic izquierdo corto** sigue seleccionando objetos, y
  **Esc** sale del vuelo.

### Cambiado
- **Reasignación de botones de navegación** (sustituye el esquema de 0.6.1 para
  adoptar el de Unreal): el clic izquierdo pasa a ser el vuelo; **orbitar** es
  ahora **botón central** o **Alt+clic izquierdo**; el **clic derecho** sigue
  haciendo paneo y la **rueda** hace zoom cuando no se está volando.
- La guía rápida documenta el nuevo esquema de navegación.

---

## [0.6.1] - 2026-07-03

### Corregido
- **Navegación con clic izquierdo en GitHub Pages**: el botón izquierdo vuelve a
  estar asignado a orbitar la cámara (`THREE.MOUSE.ROTATE`), manteniendo la
  selección con un clic corto sobre objetos. Esto alinea el comportamiento real
  con la guía rápida: clic izquierdo + arrastrar orbita, rueda hace zoom y clic
  derecho hace paneo.

---

## [0.6.0] - 2026-07-03

### Añadido
- **Trayectorias para personajes y props**: el timeline ya no es solo de cámaras.
  El selector agrupa Cámaras / Personajes / Props; cada entidad guarda sus propios
  keyframes (posición + rotación; FOV solo en cámaras) y muestra su ruta punteada
  en ámbar (azul para cámaras). Al **reproducir o mover el scrub se anima todo lo
  que tenga keyframes a la vez**, como una secuencia real. Nuevo botón «Trayectoria»
  en el inspector de personajes y props, con contador de keyframes. Las trayectorias
  se guardan/exportan con la escena, viajan con undo/redo y al duplicar una entidad
  su ruta se duplica desplazada.
- **Lanzador de proyectos** (estilo Unreal): al abrir la app aparece un menú previo
  con todos los proyectos guardados en el navegador como tarjetas con miniatura,
  fecha y acciones (cargar, duplicar, eliminar), más el autoguardado etiquetado.
  Botones: Nuevo proyecto, Escena de ejemplo, Importar archivo e Ir a la escena.
  Reabrible en cualquier momento con el botón «Proyectos» de la barra superior.
  Las escenas guardadas ahora incluyen una miniatura 480x270 para el lanzador.
- **Interfaz bilingüe ES/EN**: botón de globo en la barra superior (y en el
  lanzador) que alterna español/inglés al instante: paneles, inspector, modales,
  timeline, guía, estados vacíos, escena de ejemplo y **los prompts generados para
  IA**. La preferencia persiste en el navegador. Los datos guardados (poses, tipos
  de plano…) usan identificadores en español y se traducen solo al mostrarse, así
  las escenas son compatibles entre idiomas.
- **Exportación de video WebM** (extra): nuevo botón de rollo de película en el
  timeline que graba la trayectoria completa —cámara, personajes y props animados—
  a 1600x900 y 60 fps usando MediaRecorder, con overlay de progreso y cancelación.
  Descarga `escena_camara.webm` listo para compartir como previz.
- **Modelo 3D para las cámaras**: las cámaras de la escena se representan ahora con
  `Slate/camera.glb` (videocámara real) en lugar del gizmo de caja+cono, con tinte
  negro mate y sin textura. El modelo se carga una vez al iniciar, se normaliza de
  tamaño, se orienta para que el objetivo apunte en la dirección de vista (a lo
  largo del frustum) y se clona por cámara. Si el GLB no está disponible, se usa el
  gizmo de caja+cono como respaldo.

### Cambiado
- **Reorganización de assets en carpeta `Slate/`**: el logo (`LogoAO.png`), el
  modelo de personaje (`exported-model.glb`) y el nuevo modelo de cámara
  (`camera.glb`) viven ahora en `Slate/`. Se actualizaron las referencias en
  `index.html` y `src/app.js` respetando el uso de mayúsculas para que funcione
  también en hosting sensible a mayúsculas (GitHub Pages, Netlify…).
- El hint del timeline indica qué guarda cada keyframe según el tipo de entidad.
- La guía rápida documenta las trayectorias multi-entidad, el lanzador de
  proyectos y la exportación de video.
- **Lanzador `.bat` mejorado**: el servidor local ahora envía
  `Cache-Control: no-store` (el navegador siempre carga la última versión de la
  app, sin Ctrl+F5), escucha solo en `127.0.0.1` (no queda expuesto a la red
  local), detecta Python (`python` o `py`) y avisa con instrucciones si no está
  instalado.

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
