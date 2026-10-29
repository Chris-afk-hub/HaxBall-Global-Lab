# HaxBall Global Lab — investigación técnica inicial

Actualizado: 29 de octubre de 2026

## Objetivo

Investigar formas realistas de mejorar la experiencia de partidas entre jugadores de Brasil y Estados Unidos, sin prometer eliminar la latencia física. El laboratorio actual registra mediciones manuales; todavía no está conectado a una sala de HaxBall ni recoge ping automáticamente.

## Hallazgos principales

### 1. Cómo funciona la conectividad de HaxBall

La documentación oficial explica que HaxBall usa WebRTC para conectar a los jugadores con el host de la sala. La ubicación del host y las rutas de red influyen en la experiencia. Referencia: https://www.haxball.com/about

El Headless Host oficial permite mantener una sala sin interfaz de juego y controlarla mediante JavaScript. Es útil para automatizar salas y bots, pero no es por sí mismo un sistema que elimine la latencia: https://github.com/haxball/haxball-issues/wiki/Headless-Host

### 2. Qué ofrece node-haxball

Repositorio: https://github.com/wxyz-abcd/node-haxball  
Documentación: https://github.com/wxyz-abcd/node-haxball/wiki

El proyecto describe una API para desarrollar hosts, clientes y aplicaciones independientes, con soporte para Node.js y navegador. Incluye renderizador personalizable, lectura/escritura de repeticiones y acceso a estados del juego. La versión para navegador depende de un proxy según su README.

Esto lo convierte en una herramienta prometedora para investigación y prototipos. No significa que podamos conectar dos salas oficiales y convertirlas automáticamente en una sola partida coherente.

### 3. Por qué dos hosts regionales no resuelven el problema por sí solos

En una partida compartida, el estado del balón, las colisiones, los goles y las posiciones deben mantenerse coherentes. Si Brasil y Estados Unidos simulan la misma pelota de forma independiente, las diferencias de latencia y el orden de los mensajes pueden producir resultados contradictorios.

Para que dos regiones colaboren en una sola simulación, haría falta un protocolo de sincronización diseñado y probado, además de control del cliente y del código de simulación. Eso es un proyecto de ingeniería importante, no un cambio de configuración.

### 4. Mejoras posibles y sus límites

- **Elegir mejor la región del host:** puede beneficiar a parte de los jugadores, pero no necesariamente a todos.
- **Medir RTT, variación de latencia (jitter) y pérdida de paquetes:** permite comparar las condiciones de red de forma objetiva.
- **Predicción local y reconciliación:** puede hacer que el movimiento del propio jugador se sienta más inmediato, pero requiere que cliente y servidor puedan reproducir la misma física y corregir predicciones.
- **Interpolación/extrapolación visual:** puede suavizar movimientos remotos; no reduce el ping real y puede añadir retraso visual.
- **Dos hosts regionales sincronizados:** queda como experimento avanzado, después de validar una simulación determinista y un protocolo de autoridad.

## Mediciones recibidas

### Línea base inicial — 29 de octubre de 2026

- Trayecto reportado: Argentina → Estados Unidos.
- Ping reportado: **202–212 ms**.
- Trayecto inverso (Estados Unidos → Argentina): todavía no medido; podría ser parecido, pero no debe darse por confirmado.
- Datos pendientes: ubicación exacta de la sala/host, ping de cada participante, conexión Wi-Fi o Ethernet, hora y si hubo tirones o pérdida de conexión.

Esta es una primera referencia comunicada por un participante, no una prueba controlada ni un promedio de varias sesiones. Antes de comparar resultados, hay que confirmar que el ping corresponde a una sala alojada en Estados Unidos y repetir la medición varias veces. No usar este único dato para concluir qué región de host es mejor.


## Hallazgo práctico: extrapolación y suavizado

La wiki de comandos de HaxBall documenta `/extrapolation <milliseconds>`. La extrapolación intenta contrarrestar el retraso de entrada, pero puede producir más “warping” o saltos visuales; la recomendación documentada es dejarla en 0 salvo que exista retraso de entrada. Fuente: https://github.com/haxball/haxball-issues/wiki/Chat-Commands

También existe un cliente independiente de HaxBall llamado Fut2D (beta para Windows) que ofrece un ajuste de “Prediction smoothing” para suavizar visualmente las correcciones de extrapolación. Su propia web aclara que no reduce el ping ni soluciona problemas de conexión/servidor y que no es un producto oficial de HaxBall: https://haxball.app/?lang=es

### Prueba segura propuesta

1. En la misma sala y durante sesiones comparables, probar primero `/extrapolation 0`.
2. Si el problema principal es retraso al responder a los controles, probar un valor moderado (por ejemplo 50 ms) y luego 100 ms, anotando sensaciones y saltos. Estos valores son puntos de prueba, no recomendaciones universales.
3. Volver a 0 si empeora la precisión, aparecen saltos o cuesta leer la pelota.
4. No cambiar región de host, conexión y extrapolación a la vez. El ping real puede permanecer igual aunque la imagen parezca más fluida.
5. Solo si se desea y se acepta usar un cliente de terceros, revisar Fut2D desde su web oficial y comparar la misma sala con la misma configuración. Es beta y no oficial; no hace falta instalarlo para la prueba básica con el comando.

## Plan de pruebas recomendado

### Fase A — línea base

1. Conseguir participantes en Brasil y Estados Unidos (idealmente también Argentina).
2. Probar una sala con host en Brasil y luego otra con host en Estados Unidos.
3. Hacer pruebas en horarios cercanos y durante 5–10 minutos por sesión.
4. Anotar para cada jugador: región, host, ping mostrado por HaxBall, conexión (Wi-Fi/Ethernet), hora, tirones y desconexiones.
5. Repetir cada escenario al menos tres veces. Comparar medianas y no solamente el mejor resultado.

No mezclar el ping del juego con velocidad de descarga: son medidas diferentes. Si se dispone de herramientas de red, registrar además jitter y pérdida de paquetes.

### Fase B — investigar el cliente/host

1. Leer la documentación de node-haxball y sus ejemplos de cliente, host, renderer y estado de juego.
2. Crear un prototipo aislado, sin afectar salas oficiales ni cuentas de jugadores.
3. Verificar si se puede observar y reproducir la física de forma determinista.
4. Solo entonces probar predicción visual en un entorno de laboratorio.

### Fase C — decisión técnica

Comparar tres opciones:
- Mantener el host en la región que dé mejor resultado global.
- Probar un cliente experimental con predicción/interpolación.
- Diseñar un protocolo multirregional propio, solo si las fases anteriores justifican su coste.

## Criterios para considerar que una mejora funciona

- Comparar los mismos escenarios antes y después.
- Medir mediana y variabilidad del ping, pérdida de paquetes y desconexiones.
- Evaluar aparte la sensación de movimiento; una animación más suave no demuestra que el ping bajó.
- Repetir con jugadores reales en ambos países.
- Documentar fallos y resultados negativos, no solo los casos favorables.

## Estado actual

- [x] HaxBall Global Lab publicado en GitHub Pages.
- [x] Formulario manual para registrar ping, región y host.
- [x] Promedios, gráfico, historial y exportación CSV/JSON.
- [x] Investigación inicial de la arquitectura de HaxBall y node-haxball.
- [ ] Recolectar mediciones reales en Brasil y Estados Unidos.
- [x] Crear el primer prototipo visual local de latencia: `experiments/prototipo-latencia.html` (simulación conceptual; no se conecta a HaxBall ni reduce ping real).
- [ ] Revisar ejemplos concretos de node-haxball y seleccionar un prototipo ejecutable.
- [ ] Implementar y probar un experimento real de predicción/interpolación en una sala aislada.

## Fuentes

- HaxBall — About / tecnología: https://www.haxball.com/about
- node-haxball — repositorio y README: https://github.com/wxyz-abcd/node-haxball
- node-haxball — documentación: https://github.com/wxyz-abcd/node-haxball/wiki
- HaxBall Headless Host — guía de API: https://github.com/haxball/haxball-issues/wiki/Headless-Host
- Unity Netcode — patrones de latencia, predicción y reconciliación: https://mp-docs.dl.it.unity3d.com/netcode/2.2.0/learn/dealing-with-latency/

## Siguiente fase: diagnóstico en el cliente oficial

### Mejora oficial de latencia de entrada

El blog oficial de HaxBall publicó el 1 de mayo de 2023 una mejora de input lag. En Chromium (incluido Chrome) HaxBall usa una función de canvas desincronizado para reducir la latencia de renderizado, habilitada por defecto en esa publicación; existe una opción de vídeo llamada `Use low latency canvas` para desactivarla. También se modificó el procesamiento de entrada para responder directamente al evento HTML de teclado. Fuente: https://blog.haxball.com/

**Prueba recomendada:** en el cliente oficial, abrir los ajustes de vídeo y verificar que `Use low latency canvas` esté activado si la opción aparece. No cambiar otras opciones durante la primera comparación.

### Qué mide la extensión actual

La extensión `extension/` recoge FPS aproximados y tiempo entre fotogramas en el contexto donde se inyecta. Su medición de tecla al siguiente `requestAnimationFrame` es únicamente un indicador local, no mide cuándo llega la acción al host ni la latencia de red. Si el juego corre dentro de un iframe aislado, las métricas pueden corresponder al documento contenedor y no al canvas del juego. Hay que validar ese detalle antes de interpretar los resultados.

### Vía técnica para acceder al estado de juego

La investigación de `node-haxball` confirma que esa biblioteca de terceros implementa clientes/hosts y expone estado de sala y estado de juego a través de su propia API. Esto abre una vía para estudiar predicción y reconciliación en un cliente compatible, pero no demuestra que una extensión pueda leer o modificar el estado interno del cliente oficial. Fuente: https://github.com/wxyz-abcd/node-haxball

**Decisión de ingeniería:** no inyectar una segunda simulación ni alterar mensajes del cliente oficial hasta confirmar que existe un punto de integración seguro. Próximas etapas:
1. Validar la opción oficial de baja latencia y registrar una línea base estable.
2. Verificar si la extensión puede observar el documento/iframe del juego, sin interferir con el control.
3. Si el cliente oficial no expone su estado, crear un prototipo de predicción usando la API de un cliente compatible y comparar su comportamiento; no presentarlo como un parche del cliente oficial.
4. Solo plantear rollback si se puede reproducir la física y reconciliar el estado autoritativo. Una extensión que solo dibuja un overlay no puede conseguirlo.

