/* ============================================================
   i18n - diccionario ES -> EN y utilidades de traducción.
   El español es el idioma fuente: las claves son el texto ES tal
   cual aparece en el código; si falta una clave, se muestra el ES.
   Los identificadores persistidos (poses, tipos de plano, skies…)
   se guardan siempre en español y solo se traducen al mostrarse.
   ============================================================ */

const DICT = {
  // --- barra superior / genéricos ---
  'Deshacer (Ctrl+Z)': 'Undo (Ctrl+Z)',
  'Rehacer (Ctrl+Y)': 'Redo (Ctrl+Y)',
  'Mover': 'Move', 'Mover (W)': 'Move (W)',
  'Rotar': 'Rotate', 'Rotar (E)': 'Rotate (E)',
  'Escalar': 'Scale', 'Escalar (R)': 'Scale (R)',
  'Capturar': 'Capture',
  'Capturar fotograma de la vista actual': 'Capture a frame of the current view',
  'Guardar toma': 'Save shot',
  'Trayectoria': 'Trajectory',
  'Trayectorias': 'Trajectories',
  'Proyectos': 'Projects',
  'Proyectos guardados': 'Saved projects',
  'Nueva': 'New', 'Nueva escena': 'New scene',
  'Guardar': 'Save', 'Guardar en navegador': 'Save in browser',
  'Abrir': 'Open', 'Abrir escena guardada': 'Open saved scene',
  'Exportar': 'Export', 'Exportar JSON': 'Export JSON',
  'Importar': 'Import', 'Importar JSON': 'Import JSON',
  'Guía': 'Guide', 'Guia rapida': 'Quick guide', 'Guía rápida': 'Quick guide',
  'About': 'About', 'Acerca de Blockout Director': 'About Blockout Director',
  'Cambiar idioma (ES/EN)': 'Switch language (ES/EN)',
  'Blockout Director - Consola de dirección 3D': 'Blockout Director - 3D directing console',
  'Consola de dirección 3D': '3D directing console',

  // --- rail de pestañas / drawer ---
  'Colocar actores': 'Place Actors',
  'Entorno': 'Environment',
  'Ocultar panel': 'Hide panel',

  // --- presets de cámara / preview ---
  'Cámara desde vista': 'Camera from view',
  'Sobre el hombro': 'Over the shoulder',
  'Vista superior': 'Top view',
  'Vista lateral': 'Side view',
  'Los presets crean o reencuadran una cámara y la activan en el viewport.': 'Presets create or reframe a camera and set it as the active view.',
  'Cámara "{n}" reencuadrada': 'Camera "{n}" reframed',
  'Cámara activa: {n}': 'Active camera: {n}',
  'Cámara del preview final': 'Final preview camera',
  'Selecciona un elemento de la escena para ver sus detalles.': 'Select a scene element to see its details.',

  // --- poses y articulaciones ---
  'Doble clic: volver a 0°': 'Double-click: back to 0°',
  'Sobrescribir la pose seleccionada con la pose actual': 'Overwrite the selected pose with the current pose',
  'Borrar la pose seleccionada': 'Delete the selected pose',
  'Solo se pueden modificar las poses personalizadas': 'Only custom poses can be edited',
  'Pose "{n}" actualizada': 'Pose "{n}" updated',
  'Pose "{n}" borrada': 'Pose "{n}" deleted',
  'Cada keyframe guarda posición, rotación y pose del personaje.': 'Each keyframe stores the character position, rotation and pose.',
  'clic: ir · arrastrar: mover · clic derecho: eliminar': 'click: go · drag: move · right-click: delete',

  // --- editor de nodos ---
  'Dirección cinematográfica': 'Cinematic direction',
  'Editor de nodos': 'Node editor',
  'Planifica escenas, tomas, personajes y referencias con nodos': 'Plan scenes, shots, characters and references with nodes',
  'Planifica escena, tomas, personajes y referencias como un grafo visual.': 'Plan the scene, shots, characters and references as a visual graph.',
  'Añadir nodo': 'Add node',
  'Ajustar a la vista': 'Fit to view',
  'Clic derecho: añadir nodo · arrastra desde un puerto para conectar · rueda: zoom': 'Right-click: add node · drag from a port to connect · wheel: zoom',
  'Nodo de Escena': 'Scene Node',
  'Nodo de Toma': 'Shot Node',
  'Nodo de Personaje': 'Character Node',
  'Referencia Visual': 'Visual Reference',
  'Video de Referencia': 'Reference Video',
  'Descripción / Nota': 'Description / Note',
  'Descripción general': 'General description',
  'Intención narrativa': 'Narrative intention',
  'Intención visual': 'Visual intention',
  'Estado': 'Status',
  'Notas de dirección': 'Direction notes',
  'Toma del proyecto': 'Project shot',
  'Captura / referencia': 'Capture / reference',
  'Número de toma': 'Shot number',
  'Ángulo de cámara': 'Camera angle',
  'Movimiento de cámara': 'Camera movement',
  'FOV / lente': 'FOV / lens',
  'Notas técnicas': 'Technical notes',
  'Notas de continuidad': 'Continuity notes',
  'Actor del editor': 'Editor actor',
  'Imagen de referencia': 'Reference image',
  'Emoción / intención': 'Emotion / intention',
  'Postura / actitud': 'Posture / attitude',
  'Vestuario / apariencia': 'Wardrobe / appearance',
  'Notas de dirección actoral': 'Acting direction notes',
  'Imagen': 'Image',
  'Tipo de referencia': 'Reference type',
  'Video': 'Video',
  'Texto': 'Text',
  'Borrador': 'Draft', 'En desarrollo': 'In progress', 'Aprobada': 'Approved', 'Finalizada': 'Finished',
  'Iluminación': 'Lighting', 'Composición': 'Composition', 'Vestuario': 'Wardrobe',
  'Locación': 'Location', 'Otro': 'Other',
  '— sin vincular —': '— not linked —',
  'Actor vinculado': 'Linked actor',
  'Toma vinculada': 'Linked shot',
  'Ver en escena': 'Show in scene',
  'Subir': 'Upload',
  'Subir video': 'Upload video',
  'Plegar / desplegar': 'Collapse / expand',
  'Entrada': 'Input', 'Salida': 'Output',
  '{n} seleccionado en la escena': '{n} selected in the scene',
  'El video supera 24 MB: puede que no se guarde en el navegador (usa Exportar).': 'The video exceeds 24 MB: it may not be saved in the browser (use Export).',

  // --- panel de escena / entorno ---
  'Outliner': 'Outliner',
  'World Settings': 'World Settings',
  'Light Settings': 'Light Settings',
  'Details': 'Details',
  'Datos de escena': 'Scene details',
  'Sin elementos en la escena. Agrega personajes, props o cámaras.': 'No scene elements yet. Add characters, props or cameras.',
  'Las cámaras creadas aparecen en Outliner.': 'Created cameras appear in the Outliner.',
  'Escena': 'Scene',
  'Nombre': 'Name',
  'Nombre de la escena': 'Scene name',
  'Descripción': 'Description',
  'Descripción de la escena (se usa en los prompts generados)': 'Scene description (used in generated prompts)',
  'Entorno e iluminación': 'Environment & lighting',
  'Suelo': 'Floor',
  'Sombras': 'Shadows',
  'Niebla': 'Fog',
  'Etiquetas': 'Labels',
  'Sol': 'Sun',
  'Altura sol': 'Sun height',
  'Giro sol': 'Sun spin',
  'Ambiente': 'Ambient',
  'Día': 'Day', 'Amanecer': 'Sunrise', 'Atardecer': 'Sunset',
  'Noche': 'Night', 'Interior': 'Indoor', 'Espacio': 'Space',
  'Madera': 'Wood', 'Concreto': 'Concrete', 'Pasto': 'Grass',
  'Arena': 'Sand', 'Negro': 'Black', 'Blanco': 'White',

  // --- personajes / props ---
  'Personajes': 'Characters',
  'Personaje': 'Character',
  'Maniquí': 'Mannequin',
  'Cambiar modelo (GLB)...': 'Change model (GLB)...',
  'Importar un .glb y usarlo como modelo de personaje por defecto': 'Import a .glb and use it as the default character model',
  'Props y objetos': 'Props & objects',
  'Importar GLB': 'Import GLB',
  'Tomas': 'Shots',
  'Capturas': 'Captures',
  'Mesa': 'Table', 'Silla': 'Chair', 'Cubo': 'Cube', 'Esfera': 'Sphere',
  'Cilindro': 'Cylinder', 'Pared': 'Wall', 'Puerta': 'Door', 'Luz': 'Light',
  'Modelo actual: {n} (con poses retargeteadas a su esqueleto)': 'Current model: {n} (poses retargeted to its skeleton)',
  'Sin GLB cargado: «+ Personaje» crea maniquíes. Usa «Cambiar modelo» para usar tu personaje.': 'No GLB loaded: "+ Character" creates mannequins. Use "Change model" to use your character.',
  '"{n}" es ahora tu modelo de personaje por defecto': '"{n}" is now your default character model',
  'Modelo reescalado automáticamente a tamaño humano': 'Model automatically rescaled to human size',
  'Asset GLB no disponible: se muestra un marcador': 'GLB asset unavailable: a placeholder is shown',
  'Error al procesar el GLB': 'Error processing the GLB',
  'No se pudo leer el archivo GLB': 'Could not read the GLB file',

  // --- inspector ---
  'Propiedades': 'Properties',
  'Cámara': 'Camera',
  'Rol narrativo': 'Narrative role',
  'Protagonista, antagonista...': 'Protagonist, antagonist...',
  'Emoción / expresión': 'Emotion / expression',
  'Tenso, alegre, sorprendido...': 'Tense, cheerful, surprised...',
  'Notas narrativas': 'Narrative notes',
  'Qué hace en la escena...': 'What they do in the scene...',
  'Dirección': 'Direction',
  '— sin objetivos —': '— no targets —',
  'Girar el personaje hacia el objetivo': 'Turn the character toward the target',
  'Mirar': 'Look',
  '(tinte)': '(tint)',
  'Colores originales del modelo': 'Original model colors',
  'Solo tinte, sin textura': 'Tint only, no texture',
  'Oculta los mapas del material del GLB y deja visible solo el color/tinte seleccionado.': 'Hides the GLB material maps and shows only the selected color/tint.',
  'Este GLB no tiene esqueleto compatible: puedes moverlo, rotarlo y escalarlo, pero sin poses.': 'This GLB has no compatible skeleton: you can move, rotate and scale it, but without poses.',
  'Luz puntual': 'Point light',
  'Intensidad': 'Intensity',
  'Alcance': 'Range',
  'Alcance 0 = infinito.': 'Range 0 = infinite.',
  'Tipo de plano': 'Shot type',
  'Objetivo': 'Lens',
  'Encuadre': 'Frame',
  'Regla de tercios': 'Rule of thirds',
  'Copiar prompt de la toma': 'Copy shot prompt',
  'Ver por cámara': 'View through camera',
  'Vista libre': 'Free view',
  'Vista libre (Director)': 'Free view (Director)',
  'Vista libre actual': 'Current free view',
  'Posición': 'Position',
  'Rotación (°)': 'Rotation (°)',
  'Escala': 'Scale',
  'Duplicar': 'Duplicate',
  'Eliminar': 'Delete',
  'Eliminar cámara': 'Delete camera',
  'Duplicado': 'Duplicated',
  'copia': 'copy',
  '{a} ahora mira hacia {b}': '{a} is now facing {b}',
  'Textura oculta: solo tinte': 'Texture hidden: tint only',
  'Textura restaurada': 'Texture restored',

  // --- poses ---
  'Pose': 'Pose',
  'Guardar pose actual como preset...': 'Save current pose as preset...',
  'Ajuste manual de articulación': 'Manual joint adjustment',
  'Guardar pose': 'Save pose',
  'Nombre del preset': 'Preset name',
  'Pose personalizada': 'Custom pose',
  'Personalizada': 'Custom',
  'Pose "{n}" guardada en la biblioteca': 'Pose "{n}" saved to the library',
  'De pie': 'Standing', 'De pie relajado': 'Standing relaxed', 'Caminando': 'Walking',
  'Corriendo': 'Running', 'Sentado': 'Sitting', 'Sentado hablando': 'Sitting talking',
  'Hablando': 'Talking', 'Señalando': 'Pointing', 'Agachado': 'Crouching',
  'Defensivo': 'Defensive', 'Triste': 'Sad', 'Sorprendido': 'Surprised',
  'Enojado': 'Angry', 'Manos en cintura': 'Hands on hips', 'Alcanzar objeto': 'Reaching for object',
  'Cadera': 'Hips', 'Columna': 'Spine', 'Pecho': 'Chest', 'Cuello / cabeza': 'Neck / head',
  'Hombro izq.': 'L shoulder', 'Codo izq.': 'L elbow', 'Hombro der.': 'R shoulder', 'Codo der.': 'R elbow',
  'Pierna izq.': 'L leg', 'Rodilla izq.': 'L knee', 'Pie izq.': 'L foot',
  'Pierna der.': 'R leg', 'Rodilla der.': 'R knee', 'Pie der.': 'R foot',

  // --- cámaras / perspectivas / preview ---
  'Perspectivas': 'Perspectives',
  'Crear cámara desde la vista actual': 'Create camera from current view',
  'Preview final': 'Final preview',
  '"{n}" creada desde la vista actual': '"{n}" created from the current view',
  '-- sin camaras --': '-- no cameras --',
  'Crea una camara primero': 'Create a camera first',
  'Plano general': 'Wide shot', 'Plano medio': 'Medium shot', 'Primer plano': 'Close-up',
  'Plano detalle': 'Detail shot', 'Contrapicado': 'Low angle', 'Picado': 'High angle',
  'Toma lateral': 'Side shot', 'Cámara subjetiva': 'POV camera',
  'Cámara de seguimiento': 'Tracking camera', 'Cámara fija': 'Static camera',

  // --- timeline / trayectorias ---
  'Cámaras': 'Cameras',
  'Reproducir / pausar (anima todo lo que tenga keyframes)': 'Play / pause (animates everything with keyframes)',
  'Detener y volver al inicio': 'Stop and return to start',
  'Capturar fotograma en este punto': 'Capture frame at this point',
  'Exportar video WebM de la trayectoria': 'Export WebM video of the trajectory',
  'Keyframe aquí': 'Keyframe here',
  'Sin entidad seleccionada.': 'No entity selected.',
  'Cada keyframe guarda posición, rotación y FOV de la cámara.': 'Each keyframe stores camera position, rotation and FOV.',
  'Cada keyframe guarda posición y rotación del objeto.': 'Each keyframe stores object position and rotation.',
  'Sin keyframes: mueve la entidad seleccionada y pulsa + Keyframe aquí.': 'No keyframes: move the selected entity and press + Keyframe here.',
  'Eliminar keyframe': 'Delete keyframe',
  'Ir a este keyframe': 'Go to this keyframe',
  'Keyframe en t={t}s actualizado': 'Keyframe at t={t}s updated',
  'Keyframe en t={t}s añadido': 'Keyframe at t={t}s added',
  'Selecciona una entidad en el timeline': 'Select an entity in the timeline',
  'Necesitas al menos 2 keyframes para reproducir': 'You need at least 2 keyframes to play',
  'Crea primero una cámara, personaje o prop para animarlo': 'First create a camera, character or prop to animate',
  'Lineal': 'Linear', 'Suave (Catmull-Rom)': 'Smooth (Catmull-Rom)',
  'Mostrar/ocultar editor de keyframes': 'Show/hide keyframe editor',
  'clic: ir · clic derecho: eliminar': 'click: go · right-click: delete',
  'Sin entidades: crea cámaras, personajes o props.': 'No entities yet: create cameras, characters or props.',

  // --- exportación de video ---
  'Exportando video...': 'Exporting video...',
  'Cancelar': 'Cancel',
  'Exportación de video cancelada': 'Video export cancelled',
  'Video exportado ({s} s, {w}x{h} WebM)': 'Video exported ({s} s, {w}x{h} WebM)',
  'Tu navegador no soporta la grabación de video (MediaRecorder)': 'Your browser does not support video recording (MediaRecorder)',

  // --- capturas / tomas ---
  'Captura': 'Capture',
  'Toma': 'Shot',
  '{n} - captura guardada': '{n} - capture saved',
  'Descargar JPG': 'Download JPG',
  'Cerrar': 'Close',
  'Aplicar': 'Apply',
  'Copiar prompt': 'Copy prompt',
  'Regenerar con estado actual': 'Regenerate with current state',
  'Notas': 'Notes',
  'Prompt regenerado': 'Prompt regenerated',
  'Toma "{n}" aplicada': 'Shot "{n}" applied',
  'Toma guardada con prompt generado': 'Shot saved with generated prompt',
  'Copiado al portapapeles': 'Copied to clipboard',
  'No se pudo copiar': 'Could not copy',
  'Direccion de personajes visibles': 'Direction of visible characters',
  'Escribe hacia donde mira, avanza o dirige su atencion cada personaje. Si lo dejas vacio, se usara la orientacion inferida por rotacion.': 'Write where each character looks, moves or directs their attention. If left empty, the orientation inferred from rotation is used.',
  'Notas de direccion': 'Direction notes',
  'Intencion de la toma, movimiento, atmosfera...': 'Shot intention, movement, atmosphere...',

  // --- persistencia / proyectos ---
  'Guardar escena': 'Save scene',
  'Se guarda en este navegador. Las capturas no se incluyen aqui: usa Exportar para generar un archivo completo con capturas y modelos GLB.': 'Saved in this browser. Captures are not included here: use Export to generate a full file with captures and GLB models.',
  'Escena "{n}" guardada en el navegador': 'Scene "{n}" saved in browser',
  'Guardada sin los modelos GLB (superan el límite del navegador). Usa «Exportar» para conservarlos.': 'Saved without the GLB models (they exceed the browser limit). Use "Export" to keep them.',
  'Almacenamiento del navegador lleno: usa «Exportar» para guardar como archivo.': 'Browser storage is full: use "Export" to save as a file.',
  'Abrir escena': 'Open scene',
  'No hay escenas guardadas en este navegador. Usa Guardar o Importar primero.': 'No scenes saved in this browser. Use Save or Import first.',
  'Cargar': 'Load',
  'Escena "{n}" cargada': 'Scene "{n}" loaded',
  'Sin espacio para duplicar': 'No space to duplicate',
  'Escena exportada como archivo JSON (incluye GLB y capturas)': 'Scene exported as a JSON file (includes GLB and captures)',
  'Este archivo no es una escena de Blockout Director': 'This file is not a Blockout Director scene',
  'No se pudo leer el archivo JSON': 'Could not read the JSON file',
  'Escena "{n}" importada': 'Scene "{n}" imported',
  'Se creara una escena vacia. La actual se puede recuperar con Deshacer (Ctrl+Z), o desde Abrir si la guardaste.': 'An empty scene will be created. The current one can be recovered with Undo (Ctrl+Z), or from Open if you saved it.',
  'Crear escena vacia': 'Create empty scene',
  'Escena nueva creada': 'New scene created',
  'Nada que deshacer': 'Nothing to undo',
  'Nada que rehacer': 'Nothing to redo',

  // --- lanzador de proyectos ---
  'Nuevo proyecto': 'New project',
  'Escena de ejemplo': 'Sample scene',
  'Importar archivo...': 'Import file...',
  'Ir a la escena': 'Go to scene',
  'Proyectos guardados en este navegador': 'Projects saved in this browser',
  'Autoguardado': 'Autosave',
  'Escena de ejemplo cargada': 'Sample scene loaded',
  'Bienvenido a Blockout Director - pulsa Guía para empezar': 'Welcome to Blockout Director - press Guide to get started',

  // --- about ---
  'Blockout Director es una consola de direccion 3D para crear escenas de referencia antes de producir una imagen, video, storyboard o secuencia.': 'Blockout Director is a 3D directing console for creating reference scenes before producing an image, video, storyboard or sequence.',
  'Para que sirve': 'What it is for',
  'Sirve para ordenar personajes, props, luces y camaras en un espacio virtual, definir poses, encuadres, direccion de mirada, relacion espacial y continuidad visual.': 'It helps arrange characters, props, lights and cameras in a virtual space, defining poses, framing, gaze direction, spatial relationships and visual continuity.',
  'Intencionalidad': 'Intention',
  'Su intencion es convertir una idea abstracta en una referencia clara: una escena que se pueda mirar, ajustar, capturar y compartir sin depender de herramientas complejas de modelado o animacion final.': 'Its intention is to turn an abstract idea into a clear reference: a scene that can be viewed, adjusted, captured and shared without relying on complex final modeling or animation tools.',
  'Uso recomendado': 'Recommended use',
  'Crea o importa un proyecto desde el lanzador.': 'Create or import a project from the launcher.',
  'Coloca personajes y objetos para bloquear la composicion.': 'Place characters and objects to block out the composition.',
  'Ajusta poses, transforms, camaras e iluminacion.': 'Adjust poses, transforms, cameras and lighting.',
  'Guarda tomas con prompt, captura imagenes o exporta video WebM para previz.': 'Save shots with prompts, capture images or export WebM video for previs.',
  'Exporta un JSON cuando necesites respaldar o compartir la escena completa.': 'Export a JSON file when you need to back up or share the full scene.',
  'Blockout Director esta pensado como un puente entre la imaginacion, la direccion visual y las herramientas creativas asistidas por IA.': 'Blockout Director is designed as a bridge between imagination, visual direction and AI-assisted creative tools.',

  // --- guía ---
  '<b>Blockout Director</b> es tu set virtual: monta la escena, dirige las camaras y captura fotogramas de referencia para mantener consistencia en herramientas de IA generativa.': '<b>Blockout Director</b> is your virtual set: build the scene, direct the cameras and capture reference frames to keep consistency across generative AI tools.',
  'Flujo de trabajo': 'Workflow',
  'Configura <b>Entorno</b> (skybox, suelo, iluminacion).': 'Set up the <b>Environment</b> (skybox, floor, lighting).',
  'Anade <b>Personajes</b> (maniquies o GLB) y asignales rol, emocion y pose.': 'Add <b>Characters</b> (mannequins or GLB) and assign them role, emotion and pose.',
  'Coloca <b>Props</b> y luces puntuales.': 'Place <b>Props</b> and point lights.',
  'Navega hasta un buen encuadre y pulsa <b>Cámara desde vista</b> en Colocar actores, o elige un preset de perspectiva (primer plano, plano medio, general...).': 'Navigate to a good framing and press <b>Camera from view</b> in Place Actors, or pick a perspective preset (close-up, medium shot, wide...).',
  'En el inspector de la camara elige <b>objetivo</b> (14-135 mm), <b>encuadre</b> (16:9, 9:16, 2.39:1, 1:1) y activa la <b>regla de tercios</b> para componer la toma.': 'In the camera inspector pick a <b>lens</b> (14-135 mm), a <b>frame</b> (16:9, 9:16, 2.39:1, 1:1) and enable the <b>rule of thirds</b> to compose the shot.',
  'Anima camaras, personajes y props con <b>Trayectorias</b>: selecciona la entidad en el timeline, muevela y anade keyframes. Al reproducir, todo lo que tenga keyframes se anima a la vez.': 'Animate cameras, characters and props with <b>Trajectories</b>: pick the entity in the timeline, move it and add keyframes. On playback, everything with keyframes animates at once.',
  'El panel <b>Trayectorias</b> muestra la jerarquia completa de la escena con los keyframes de cada objeto animado; el boton de filas muestra u oculta el editor de keyframes.': 'The <b>Trajectories</b> panel shows the full scene hierarchy with the keyframes of every animated object; the rows button shows or hides the keyframe editor.',
  '<b>Capturar</b> genera un JPG limpio con el encuadre de la camara; <b>Guardar toma</b> ademas guarda encuadre, notas y un prompt listo para IA; el boton de video exporta la trayectoria como WebM.': '<b>Capture</b> renders a clean JPG with the camera frame; <b>Save shot</b> also stores framing, notes and an AI-ready prompt; the video button exports the trajectory as WebM.',
  '<b>Guardar</b> en el navegador o <b>Exportar</b> como archivo .json (incluye GLB y capturas). En <b>Proyectos</b> encuentras todo lo guardado.': '<b>Save</b> in the browser or <b>Export</b> as a .json file (includes GLB and captures). In <b>Projects</b> you will find everything you saved.',
  'Controles': 'Controls',
  'Navegación estilo Unreal: mantén <b>clic derecho</b> y vuela con <b>WASD</b> mientras el ratón mira alrededor (<b>Q/E</b> baja/sube, <b>Shift</b> acelera, la rueda ajusta la velocidad).': 'Unreal-style navigation: hold <b>right click</b> and fly with <b>WASD</b> while the mouse looks around (<b>Q/E</b> down/up, <b>Shift</b> speeds up, the wheel adjusts speed).',
  'Orbitar: <b>Alt+clic izquierdo</b>. Paneo: <b>botón central</b>. Zoom: <b>rueda</b>. Clic izquierdo: <b>seleccionar</b>.': 'Orbit: <b>Alt+left click</b>. Pan: <b>middle button</b>. Zoom: <b>wheel</b>. Left click: <b>select</b>.',
  'Clic sobre un objeto: seleccionar. <b>W/E/R</b>: mover / rotar / escalar.': 'Click an object: select. <b>W/E/R</b>: move / rotate / scale.',
  // HUD de vuelo libre
  'Vuelo libre': 'Free flight',
  'mover': 'move',
  'bajar/subir': 'down/up',
  'rápido': 'faster',
  'rueda: velocidad': 'wheel: speed',
  '<b>F</b>: centrar vista en la seleccion. <b>Supr</b>: eliminar. <b>Ctrl+D</b>: duplicar. <b>Ctrl+Z / Ctrl+Y</b>: deshacer / rehacer.': '<b>F</b>: focus view on selection. <b>Del</b>: delete. <b>Ctrl+D</b>: duplicate. <b>Ctrl+Z / Ctrl+Y</b>: undo / redo.',
  'Desde el Outliner o los presets de camara puedes mirar por cualquier camara y reencuadrarla navegando.': 'From the Outliner or the camera presets you can look through any camera and reframe it by navigating.',
  'Consejo: entra a la vista de una camara, encuadra navegando y anade keyframes en distintos momentos para crear un travelling suave.': 'Tip: enter a camera view, frame by navigating and add keyframes at different times to create a smooth dolly move.',

  // --- escena de ejemplo ---
  'Reunión en la galería': 'Meeting at the gallery',
  'Cuatro personajes conversan alrededor de una mesa de madera en una sala interior; un quinto se dirige a la puerta.': 'Four characters talk around a wooden table in an interior room; a fifth one heads to the door.',
  'Hombre de tweed': 'Man in tweed',
  'Hombre de traje oscuro': 'Man in a dark suit',
  'Hombre de traje rojo': 'Man in a red suit',
  'Mujer de vestido gris': 'Woman in a gray dress',
  'Hombre de abrigo marrón': 'Man in a brown coat',
  'Secundario': 'Supporting', 'Protagonista': 'Protagonist', 'Testigo': 'Witness', 'Antagonista': 'Antagonist',
  'Interesado': 'Interested', 'Serio': 'Serious', 'Inquieta': 'Restless',
  'Se dirige a la puerta': 'Heads to the door',

  // --- prompts para IA ---
  'el fondo de la escena (-Z)': 'the back of the scene (-Z)',
  'fondo-derecha (-Z/+X)': 'back-right (-Z/+X)',
  'la derecha de la escena (+X)': 'the right of the scene (+X)',
  'frente-derecha (+Z/+X)': 'front-right (+Z/+X)',
  'el frente de la escena (+Z)': 'the front of the scene (+Z)',
  'frente-izquierda (+Z/-X)': 'front-left (+Z/-X)',
  'la izquierda de la escena (-X)': 'the left of the scene (-X)',
  'fondo-izquierda (-Z/-X)': 'back-left (-Z/-X)',
  'relacion con camara no determinada': 'relation to camera undetermined',
  'de frente a la camara': 'facing the camera',
  'de espaldas a la camara': 'back to the camera',
  'perfil izquierdo hacia la camara': 'left profile to the camera',
  'perfil derecho hacia la camara': 'right profile to the camera',
  'orientado hacia {d}': 'oriented toward {d}',
  'modelo GLB sin rig editable; conservar la postura visible del modelo': 'GLB model without editable rig; keep the visible posture of the model',
  'sin detalle de articulaciones guardado': 'no joint detail stored',
  'offset vertical de cadera {v} m': 'hip vertical offset {v} m',
  'rotacion XYZ': 'XYZ rotation',
  'pose neutra, articulaciones en 0°': 'neutral pose, joints at 0°',
  'No hay personajes visibles desde esta camara.': 'No characters visible from this camera.',
  'Ej. mira hacia la puerta, camina hacia camara, apunta al antagonista': 'E.g. looks at the door, walks toward camera, points at the antagonist',
  'Fotograma cinematografico - {shot} desde la camara "{cam}" (lente {mm} mm, FOV {fov}°, encuadre {ratio}, {angle}).': 'Cinematic frame - {shot} from camera "{cam}" ({mm} mm lens, FOV {fov}°, {ratio} frame, {angle}).',
  'angulo picado (desde arriba)': 'high angle (from above)',
  'angulo contrapicado (desde abajo)': 'low angle (from below)',
  'a la altura de los personajes': 'at character eye level',
  'tenue': 'dim', 'media': 'medium', 'intensa': 'intense',
  'Ambiente: cielo tipo {sky}, suelo de {floor}, iluminacion {light}{fog}.': 'Environment: {sky} sky, {floor} floor, {light} lighting{fog}.',
  ', con niebla atmosferica': ', with atmospheric fog',
  'Personajes en cuadro:': 'Characters in frame:',
  'emocion': 'emotion',
  'direccion': 'direction',
  'Transform 3D: posicion {p}, rotacion XYZ {r}, escala {s}.': '3D transform: position {p}, XYZ rotation {r}, scale {s}.',
  'Pose corporal': 'Body pose',
  'preset "{n}"; ': 'preset "{n}"; ',
  'Sin personajes en cuadro.': 'No characters in frame.',
  'Props visibles': 'Visible props',
  'Mantener exactamente la composicion, posiciones, escala y relacion espacial entre personajes de la imagen de referencia adjunta.': 'Keep exactly the composition, positions, scale and spatial relations between characters from the attached reference image.'
};

let lang = 'es';
try { if (localStorage.getItem('bd_lang') === 'en') lang = 'en'; } catch {}

export function getLang() { return lang; }

export function setLang(l) {
  lang = l === 'en' ? 'en' : 'es';
  try { localStorage.setItem('bd_lang', lang); } catch {}
}

export function t(s, vars) {
  let out = lang === 'en' ? (DICT[s] ?? s) : s;
  if (vars) for (const k in vars) out = out.split('{' + k + '}').join(vars[k]);
  return out;
}

/* Traduce los elementos estáticos del HTML marcados con data-i18n
   (texto), data-i18n-title (tooltip) y data-i18n-ph (placeholder).
   El texto original en español se captura una sola vez, de modo que
   se puede alternar de idioma cuantas veces se quiera. */
export function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    let src = el.dataset.i18nSrc;
    if (!src) {
      if (!tn) return;
      src = tn.textContent.trim();
      el.dataset.i18nSrc = src;
    }
    if (tn) {
      const lead = /^\s/.test(tn.textContent) ? ' ' : '';
      const tail = /\s$/.test(tn.textContent) ? ' ' : '';
      tn.textContent = lead + t(src) + tail;
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    if (!el.dataset.i18nTitleSrc) el.dataset.i18nTitleSrc = el.title;
    el.title = t(el.dataset.i18nTitleSrc);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    if (!el.dataset.i18nPhSrc) el.dataset.i18nPhSrc = el.placeholder;
    el.placeholder = t(el.dataset.i18nPhSrc);
  });
}
