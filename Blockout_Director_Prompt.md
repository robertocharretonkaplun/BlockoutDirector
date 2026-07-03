# Blockout Director — Prompt Maestro para Diseño de Herramienta 3D

## Rol que debe asumir la IA

Actúa como **diseñador técnico de herramientas 3D**, **arquitecto de software**, **especialista en dirección cinematográfica virtual** y **desarrollador de herramientas para creación de escenas con IA**.

Tu tarea es ayudarme a diseñar una herramienta llamada **Blockout Director**.

---

## Nombre del proyecto

**Blockout Director**

---

## Descripción general

Quiero desarrollar una herramienta 3D tipo **consola directora** para crear, dirigir y guardar escenas cinematográficas con personajes, objetos, props, cámaras, skybox e iluminación.

La herramienta debe ayudar a resolver uno de los problemas más importantes al crear imágenes, películas, dramas o cinemáticas con inteligencia artificial: **mantener la consistencia visual entre fotogramas cuando existen múltiples personajes, objetos y locaciones complejas**.

Blockout Director debe funcionar como un entorno 3D interactivo donde el usuario pueda montar una escena, colocar personajes, definir poses, controlar cámaras, crear trayectorias cinematográficas, capturar fotogramas y guardar la escena completa para reutilizarla después.

El objetivo es que el usuario pueda usar esta herramienta como una especie de **set virtual**, **storyboard 3D**, **previz tool** o **director console** para preparar imágenes de referencia que después puedan enviarse a herramientas de generación de imágenes o video con IA.

---

## Objetivo principal

Diseñar una herramienta 3D que permita:

- Crear escenas 3D consistentes.
- Colocar personajes y props.
- Controlar poses de personajes.
- Configurar skybox, iluminación y entorno.
- Crear cámaras fijas y cámaras animadas.
- Generar trayectorias de cámara por puntos o keyframes.
- Capturar fotogramas desde distintas cámaras.
- Guardar y cargar escenas completas.
- Exportar referencias visuales para herramientas externas de IA.
- Mantener continuidad visual entre varias tomas de una misma historia.

---

## Contexto de uso

La herramienta está pensada para creadores que trabajan con:

- Películas generadas con IA.
- Dramas o series hechas con IA.
- Storyboards visuales.
- Cinemáticas de videojuegos.
- Previsualización de escenas.
- Composición de personajes en espacios 3D.
- Diseño de tomas consistentes.
- Generación de referencias para imagen o video con IA.

El usuario debe poder construir una escena 3D como si estuviera dirigiendo un pequeño set virtual.

---

## Problema que debe resolver

Cuando se trabaja con IA generativa, es difícil mantener consistencia entre diferentes imágenes o videos si existen:

- Múltiples personajes.
- Distintos objetos importantes.
- Una locación compleja.
- Continuidad entre planos.
- Cambios de cámara.
- Cambios de pose.
- Variaciones de iluminación.
- Necesidad de repetir la misma escena desde distintos ángulos.

Blockout Director debe permitir que el usuario controle estos elementos manualmente dentro de un espacio 3D para generar referencias visuales coherentes.

---

# Funciones principales

## 1. Gestión del entorno 3D

La herramienta debe permitir crear y configurar un entorno 3D base.

Debe incluir:

- Crear una escena vacía.
- Cargar o cambiar un skybox.
- Agregar escenarios, fondos o locaciones.
- Importar assets 3D manualmente.
- Agregar props y objetos dentro de la escena.
- Posicionar, rotar y escalar objetos.
- Ajustar iluminación básica.
- Navegar libremente por la escena.
- Visualizar la escena desde cámara libre o desde cámaras creadas.
- Organizar objetos en una jerarquía de escena.

### Elementos mínimos del entorno

- Skybox.
- Luces.
- Cámara principal.
- Grid o piso de referencia.
- Personajes.
- Props.
- Objetos de escenografía.
- Puntos de cámara.
- Capturas guardadas.

---

## 2. Importación y gestión de assets

La herramienta debe contar con un sistema para administrar assets.

Debe permitir:

- Importar modelos 3D.
- Importar personajes 3D.
- Importar props.
- Importar escenarios.
- Cargar texturas o materiales.
- Organizar assets por categorías.
- Previsualizar assets antes de colocarlos.
- Arrastrar assets a la escena.
- Reutilizar assets en diferentes escenas.

### Categorías sugeridas

- Personajes.
- Props.
- Locaciones.
- Decoración.
- Cámaras.
- Luces.
- Skyboxes.
- Poses.
- Escenas guardadas.

---

## 3. Gestión de personajes

La herramienta debe permitir trabajar con uno o varios personajes dentro de una escena.

Debe incluir:

- Importar personajes 3D de referencia.
- Colocar personajes dentro del escenario.
- Mover, rotar y escalar personajes.
- Nombrar personajes.
- Asignar rol narrativo a cada personaje.
- Agregar descripción visual del personaje.
- Asignar poses.
- Guardar configuraciones del personaje.
- Reutilizar personajes en otras escenas.
- Mantener consistencia visual entre tomas.

### Información de cada personaje

Cada personaje debería guardar:

- Nombre.
- Descripción.
- Rol dentro de la historia.
- Modelo 3D utilizado.
- Materiales.
- Posición.
- Rotación.
- Escala.
- Pose actual.
- Expresión o estado emocional, si aplica.
- Notas narrativas.
- Cámaras asociadas, si aplica.

---

## 4. Sistema de poses

Blockout Director debe incluir un sistema para controlar poses de personajes.

Debe permitir:

- Seleccionar un personaje.
- Aplicar poses predefinidas.
- Crear poses personalizadas.
- Guardar poses como presets.
- Reutilizar poses.
- Ajustar manualmente huesos o controles básicos del rig, si el personaje lo permite.
- Guardar el estado completo de pose, posición, rotación y expresión.
- Asociar poses con una intención narrativa.

### Ejemplos de poses

- De pie neutral.
- Caminando.
- Sentado.
- Mirando hacia otro personaje.
- Señalando.
- Hablando.
- Corriendo.
- Agachado.
- Defensivo.
- Triste.
- Enojado.
- Sorprendido.
- Interactuando con un objeto.

---

## 5. Sistema de cámaras cinematográficas

La herramienta debe permitir crear, configurar y administrar cámaras dentro de la escena.

Debe incluir:

- Crear múltiples cámaras.
- Posicionar cámaras libremente.
- Rotar cámaras para definir encuadres.
- Ajustar campo de visión.
- Ajustar profundidad de campo, si aplica.
- Guardar cámaras como tomas.
- Previsualizar lo que ve cada cámara.
- Capturar imagen desde la cámara seleccionada.
- Cambiar entre cámaras.
- Nombrar cada cámara.
- Definir tipo de plano.

### Tipos de toma sugeridos

- Plano general.
- Plano medio.
- Primer plano.
- Plano detalle.
- Contrapicado.
- Picado.
- Toma lateral.
- Over the shoulder.
- Cámara subjetiva.
- Cámara de seguimiento.
- Cámara fija.

---

## 6. Animación de cámara por puntos o keyframes

Blockout Director debe permitir animar cámaras mediante una secuencia de puntos o keyframes.

Debe incluir:

- Crear puntos de cámara en la escena.
- Asociar puntos a una cámara.
- Definir posición y rotación de la cámara en cada punto.
- Ajustar duración entre puntos.
- Ajustar tipo de interpolación.
- Previsualizar el movimiento.
- Reproducir, pausar y reiniciar la animación.
- Guardar trayectorias de cámara.
- Reutilizar trayectorias.
- Permitir que una cámara se quede fija en ciertos puntos.
- Capturar frames específicos de la trayectoria.

### Tipos de interpolación sugeridos

- Lineal.
- Suave.
- Ease In.
- Ease Out.
- Ease In Out.
- Bezier.
- Catmull-Rom.
- Cinemática personalizada.

### Ejemplo de uso

El usuario coloca una cámara en una posición inicial, crea varios puntos alrededor de los personajes y genera una animación cinematográfica donde la cámara se mueve suavemente siguiendo la trayectoria definida.

---

## 7. Sistema de tomas

La herramienta debe permitir guardar tomas específicas de la escena.

Cada toma debería incluir:

- Cámara utilizada.
- Posición de cámara.
- Rotación de cámara.
- FOV.
- Personajes visibles.
- Poses de personajes.
- Props relevantes.
- Iluminación.
- Notas de dirección.
- Descripción visual.
- Prompt textual asociado.
- Captura de referencia.

### Ejemplos de tomas

- “Toma 01 - Plano general de la ciudad”.
- “Toma 02 - Primer plano del protagonista”.
- “Toma 03 - Cámara lateral durante conversación”.
- “Toma 04 - Travelling hacia el personaje”.
- “Toma 05 - Over the shoulder del antagonista”.

---

## 8. Generación y captura de fotogramas

Blockout Director debe permitir capturar fotogramas desde la escena 3D.

Debe incluir:

- Botón para capturar imagen desde la cámara activa.
- Captura desde cámaras fijas.
- Captura desde puntos específicos de una trayectoria.
- Guardar imágenes como referencias.
- Exportar imágenes.
- Asociar capturas con una escena o toma.
- Generar variaciones manteniendo la composición base.
- Enviar referencias a herramientas externas de IA, si se implementa integración.

### Uso esperado de las capturas

Las capturas deben servir como referencia visual para herramientas de IA generativa, ayudando a conservar:

- Posición de personajes.
- Composición.
- Ángulo de cámara.
- Escala.
- Locación.
- Props.
- Continuidad visual.
- Relación espacial entre personajes.

---

## 9. Guardado, carga e importación de escenas

La herramienta debe permitir guardar escenas completas.

Cada escena guardada debe incluir:

- Nombre de la escena.
- Descripción.
- Skybox.
- Iluminación.
- Personajes.
- Poses de personajes.
- Props.
- Objetos.
- Cámaras.
- Trayectorias de cámara.
- Tomas guardadas.
- Capturas relacionadas.
- Notas narrativas.
- Configuración del entorno.

Debe permitir:

- Guardar escena.
- Cargar escena.
- Duplicar escena.
- Exportar escena.
- Importar escena.
- Crear versiones de una misma escena.
- Continuar editando una escena previamente guardada.

---

## 10. Integración narrativa con IA

La herramienta debe contemplar un flujo donde una IA pueda ayudar a generar estructura narrativa.

El usuario debería poder escribir una idea de historia y la IA debería ayudar a proponer:

- Personajes.
- Locaciones.
- Props.
- Acciones.
- Poses.
- Emociones.
- Tipo de iluminación.
- Cámaras sugeridas.
- Tomas sugeridas.
- Descripciones visuales.
- Prompts para generación de imagen o video.

### Ejemplo de entrada del usuario

> Crea una escena de dos personajes discutiendo en una estación espacial abandonada.

### Respuesta esperada de la IA

La IA debería sugerir:

- Personaje 1: protagonista.
- Personaje 2: antagonista.
- Locación: pasillo principal de estación espacial abandonada.
- Props: luces parpadeantes, cables sueltos, consola dañada.
- Iluminación: fría, tenue, con luces rojas de emergencia.
- Cámara 1: plano general.
- Cámara 2: primer plano del protagonista.
- Cámara 3: over the shoulder del antagonista.
- Poses: tensión, confrontación, manos levantadas, mirada directa.
- Prompt visual base para generación con IA.

---

# Flujo de trabajo deseado

El flujo ideal de Blockout Director debe ser:

1. El usuario crea una nueva escena.
2. El usuario selecciona o importa un skybox.
3. El usuario agrega locación o escenario.
4. El usuario importa personajes.
5. El usuario coloca los personajes en la escena.
6. El usuario asigna poses.
7. El usuario coloca props y objetos.
8. El usuario ajusta iluminación.
9. El usuario crea cámaras.
10. El usuario define tomas fijas.
11. El usuario crea trayectorias de cámara si necesita movimiento.
12. El usuario captura fotogramas.
13. El usuario guarda la escena.
14. El usuario exporta las capturas.
15. El usuario usa las capturas como referencia para herramientas externas de IA.
16. El usuario puede volver a abrir la escena para mantener continuidad en nuevas tomas.

---

# Arquitectura modular sugerida

Propón una arquitectura modular para desarrollar Blockout Director.

La herramienta debe contemplar los siguientes módulos:

## 1. Scene Manager

Responsable de administrar la escena completa.

Debe manejar:

- Creación de escenas.
- Carga de escenas.
- Guardado de escenas.
- Jerarquía de objetos.
- Estado general de la escena.
- Referencias a personajes, props, cámaras y luces.

---

## 2. Asset Manager

Responsable de administrar los assets disponibles.

Debe manejar:

- Importación de modelos.
- Organización por categorías.
- Previsualización de assets.
- Colocación de assets en la escena.
- Referencias a archivos externos.
- Validación de assets.

---

## 3. Character Manager

Responsable de administrar personajes.

Debe manejar:

- Creación de personajes en escena.
- Datos de personaje.
- Transformaciones.
- Modelo asociado.
- Rol narrativo.
- Estado visual.
- Relación con poses.

---

## 4. Pose Manager

Responsable de controlar poses.

Debe manejar:

- Biblioteca de poses.
- Aplicación de poses.
- Guardado de poses.
- Edición de poses.
- Asociación de poses con personajes.
- Compatibilidad con rigs.

---

## 5. Camera Manager

Responsable de administrar cámaras.

Debe manejar:

- Creación de cámaras.
- Selección de cámara activa.
- Configuración de FOV.
- Configuración de encuadres.
- Captura desde cámara.
- Guardado de tomas.

---

## 6. Camera Path Manager

Responsable de administrar trayectorias de cámara.

Debe manejar:

- Puntos de cámara.
- Keyframes.
- Interpolación.
- Duración.
- Previsualización.
- Reproducción.
- Guardado de trayectorias.

---

## 7. Lighting Manager

Responsable de administrar luces.

Debe manejar:

- Luz direccional.
- Luz ambiental.
- Luces puntuales.
- Intensidad.
- Color.
- Sombras.
- Presets de iluminación.

---

## 8. Skybox Manager

Responsable de administrar skyboxes.

Debe manejar:

- Carga de skyboxes.
- Cambio de skybox.
- Presets de entorno.
- Asociación del skybox con una escena guardada.

---

## 9. Shot Manager

Responsable de administrar tomas.

Debe manejar:

- Guardado de tomas.
- Lista de tomas.
- Cámaras asociadas.
- Personajes visibles.
- Notas de dirección.
- Capturas asociadas.

---

## 10. Frame Capture Manager

Responsable de capturar imágenes desde cámaras.

Debe manejar:

- Captura de imagen.
- Resolución de salida.
- Nombre de archivo.
- Asociación con escena y toma.
- Exportación de referencias.

---

## 11. Save / Load System

Responsable de persistencia de datos.

Debe manejar:

- Guardado de escenas.
- Carga de escenas.
- Exportación.
- Importación.
- Versionado.
- Serialización.

---

## 12. AI Story Integration System

Responsable de conectar la herramienta con flujos de IA.

Debe manejar:

- Generación de personajes desde una idea.
- Generación de locaciones.
- Generación de props.
- Sugerencia de tomas.
- Sugerencia de poses.
- Generación de prompts visuales.
- Envío de capturas a herramientas externas.

---

# Estructura de datos sugerida

Propón una estructura de datos para guardar escenas.

Ejemplo base:

```json
{
  "projectName": "Blockout Director",
  "sceneName": "Scene_001",
  "description": "Two characters talking inside an abandoned spaceship hallway.",
  "environment": {
    "skybox": "Space_Station_Interior",
    "lightingPreset": "Cold Emergency Lights",
    "ambientIntensity": 0.7
  },
  "characters": [
    {
      "id": "char_001",
      "name": "Alex",
      "role": "Protagonist",
      "modelPath": "Assets/Characters/Alex.fbx",
      "position": [0, 0, 0],
      "rotation": [0, 180, 0],
      "scale": [1, 1, 1],
      "pose": "Standing_Tense",
      "emotion": "Concerned",
      "notes": "Looking at the antagonist."
    }
  ],
  "props": [
    {
      "id": "prop_001",
      "name": "Damaged Console",
      "modelPath": "Assets/Props/Console.fbx",
      "position": [2, 0, 1],
      "rotation": [0, 45, 0],
      "scale": [1, 1, 1]
    }
  ],
  "cameras": [
    {
      "id": "cam_001",
      "name": "Wide Shot",
      "type": "Static",
      "position": [0, 2, -6],
      "rotation": [15, 0, 0],
      "fov": 45
    }
  ],
  "cameraPaths": [
    {
      "id": "path_001",
      "name": "Slow Push In",
      "cameraId": "cam_001",
      "keyframes": [
        {
          "time": 0,
          "position": [0, 2, -6],
          "rotation": [15, 0, 0]
        },
        {
          "time": 3,
          "position": [0, 1.8, -3],
          "rotation": [10, 0, 0]
        }
      ],
      "interpolation": "EaseInOut"
    }
  ],
  "shots": [
    {
      "id": "shot_001",
      "name": "Opening Wide Shot",
      "cameraId": "cam_001",
      "description": "Shows both characters in the hallway.",
      "prompt": "A cinematic wide shot of two characters arguing inside an abandoned space station hallway."
    }
  ]
}
```

---

# Interfaz de usuario sugerida

Diseña una interfaz clara para Blockout Director.

Debe considerar:

## Panel izquierdo

- Biblioteca de assets.
- Personajes.
- Props.
- Skyboxes.
- Poses.
- Escenas guardadas.

## Vista central

- Viewport 3D.
- Controles de navegación.
- Gizmos de transformación.
- Vista de cámara activa.

## Panel derecho

- Propiedades del objeto seleccionado.
- Transform.
- Pose.
- Materiales.
- Cámara.
- Luz.
- Notas narrativas.

## Panel inferior

- Timeline.
- Keyframes de cámara.
- Lista de tomas.
- Controles de reproducción.
- Capturas recientes.

## Barra superior

- Nuevo proyecto.
- Abrir.
- Guardar.
- Exportar.
- Importar.
- Capturar frame.
- Generar sugerencias con IA.
- Configuración.

---

# Resultado que necesito de la IA

Quiero que me entregues una propuesta técnica y creativa completa para desarrollar Blockout Director.

La respuesta debe incluir:

1. Descripción general de la herramienta.
2. Objetivo principal.
3. Problema que resuelve.
4. Público objetivo.
5. Funciones principales.
6. Flujo de trabajo del usuario.
7. Arquitectura modular.
8. Descripción de cada módulo.
9. Estructura de datos para guardar escenas.
10. Sistema de cámaras.
11. Sistema de trayectorias de cámara.
12. Sistema de poses.
13. Sistema de capturas.
14. Sistema de guardado y carga.
15. Integración posible con IA.
16. Propuesta de interfaz de usuario.
17. Recomendaciones técnicas de implementación.
18. Ejemplo de clases, componentes o pseudocódigo.
19. Posibles etapas de desarrollo.
20. Riesgos técnicos y soluciones recomendadas.

---

# Requisitos de respuesta

La respuesta debe ser:

- Clara.
- Ordenada.
- Técnica, pero fácil de entender.
- Pensada para convertir esta idea en una herramienta real.
- Modular.
- Escalable.
- Enfocada en desarrollo práctico.
- Orientada a producción.
- Útil para crear una primera versión funcional.

---

# Variante para pedir implementación en un motor específico

Si se desea aterrizar el proyecto a un motor específico, usar esta instrucción adicional:

> Adapta toda esta propuesta para desarrollarla en **[Unity / Unreal Engine 5 / Godot / Three.js / WebGL]**. Explica cómo se implementaría cada módulo dentro de esa tecnología, qué componentes se usarían y qué estructura de proyecto recomiendas.

---

# Variante para pedir una primera versión funcional

Si se desea pedir una versión inicial más concreta, usar esta instrucción adicional:

> Diseña una versión MVP de Blockout Director que pueda desarrollarse primero. Prioriza las funciones mínimas necesarias para crear una escena, importar personajes, colocar cámaras, guardar tomas, capturar frames y guardar/cargar escenas.

---

# Variante para pedir código base

Si se desea pedir código o estructura inicial, usar esta instrucción adicional:

> Genera una estructura base de proyecto para Blockout Director, incluyendo clases principales, responsabilidades, relaciones entre módulos y pseudocódigo para el sistema de escena, cámaras, poses, guardado/carga y captura de fotogramas.
