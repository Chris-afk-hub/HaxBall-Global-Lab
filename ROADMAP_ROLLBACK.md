# HaxBall Global Lab — Ruta hacia un juego propio con rollback

Actualizado: 29 de octubre de 2026

## Decisión de arquitectura

Explorar un juego de fútbol 2D multijugador propio, inspirado en la jugabilidad simple de HaxBall, con motor de físicas y protocolo de red controlados por el proyecto. No modificar ni afirmar compatibilidad con el cliente oficial de HaxBall. Usar código, gráficos, sonidos y marca propios.

## Qué puede y qué no puede lograr rollback

Rollback no reduce el tiempo que tardan los paquetes en viajar ni transforma una conexión de 200 ms en una conexión de 20 ms. La predicción local puede hacer que los controles del propio jugador respondan de inmediato; al llegar entradas remotas o confirmaciones del servidor, el juego puede restaurar un estado anterior y volver a simular los pasos siguientes.

El problema es que la simulación puede diferir: choques entre jugadores, pelota, goles, rebotes y contactos simultáneos pueden corregirse de forma visible. En un juego de fútbol con físicas compartidas, la pelota es especialmente difícil porque todos los jugadores influyen sobre ella. Rollback es una técnica útil, pero no la única: interpolación, predicción, reconciliación y compensación de acciones son técnicas complementarias con distintos compromisos.

## Arquitectura inicial propuesta

- Cliente web: HTML5 Canvas para renderizado, teclado y controles táctiles más adelante.
- Simulación determinista: paso fijo de simulación, reglas de colisión explícitas y pruebas de repetibilidad.
- Servidor autoritativo: valida entradas y determina el estado confirmado para evitar que cada cliente decida por separado los goles.
- Transporte: WebSocket para el primer prototipo por simplicidad; evaluar WebRTC/UDP-like transport solo si el entorno de despliegue y la necesidad técnica lo justifican.
- Protocolo: número de secuencia por entrada, tick de simulación, marcas de tiempo y estados confirmados.
- Predicción local: simular de inmediato el movimiento del jugador local.
- Reconciliación: al recibir estado confirmado, comparar con el estado predicho y corregir.
- Rollback experimental: guardar un historial acotado de estados e inputs; restaurar el estado previo y volver a simular cuando llegue una entrada tardía.
- Instrumentación: mostrar ping/RTT, jitter, pérdida de paquetes, cantidad de rollbacks, correcciones y discrepancia entre estados.

## Plan de desarrollo

### Fase 1 — prototipo jugable local
- [ ] Campo, pelota, dos jugadores y controles de teclado.
- [ ] Física de paso fijo y colisiones reproducibles.
- [ ] Reinicio de partido y marcador simple.
- [ ] Pruebas automáticas básicas para colisiones y goles.

### Fase 2 — multijugador online básico
- [ ] Servidor Node.js independiente del sitio estático de GitHub Pages.
- [ ] Sala de dos jugadores con servidor autoritativo.
- [ ] Medición de RTT, jitter y pérdida de mensajes.
- [ ] Prueba controlada con latencia artificial de 50, 100, 150 y 200 ms.

### Fase 3 — predicción y reconciliación
- [ ] Movimiento local inmediato.
- [ ] Corrección suave del estado confirmado.
- [ ] Comparar control, precisión y errores con la versión sin predicción.

### Fase 4 — rollback
- [ ] Historial de estados e inputs con ventana limitada.
- [ ] Re-simulación determinista al recibir inputs tardíos.
- [ ] Política para contactos de pelota, goles y situaciones donde la predicción diverge.
- [ ] Mostrar métricas de rollback y realizar pruebas repetibles.

### Fase 5 — pruebas entre regiones
- [ ] Medir desde Argentina y Estados Unidos con host en una región elegida.
- [ ] Comparar baseline y versiones sin predicción, con predicción y con rollback.
- [ ] Evaluar sensación de control y correcciones, no solo el ping.
- [ ] Probar hosting/región alternativa solo si las mediciones lo justifican.

## Criterios de éxito

No afirmar que se redujo el ping si solo mejora la respuesta visual. Evaluar por separado:
1. RTT real.
2. Latencia percibida al mover el jugador local.
3. Exactitud de colisiones y resultados.
4. Frecuencia y magnitud de correcciones.
5. Rendimiento estable con jitter y pérdida de paquetes.

## Limitaciones y riesgos

- Un servidor autoritativo evita resultados contradictorios, pero las confirmaciones siguen viajando por la red.
- Rollback funciona mejor cuando la simulación puede repetirse de forma determinista y los estados pueden restaurarse con precisión.
- En juegos con física continua y una pelota compartida, una colisión predicha incorrectamente puede cambiar el resultado de una jugada.
- El objetivo realista es mejorar la respuesta de controles y ocultar parte de la latencia sin romper la consistencia; no eliminar la latencia física.
- GitHub Pages solo sirve el cliente estático; el servidor de juego requiere un servicio que ejecute Node.js de forma continua.

## Primer entregable recomendado

Antes de desplegar servidores o prometer rollback, crear un juego local pequeño en Canvas con movimiento y física de paso fijo. Después convertirlo en multijugador autoritativo y medirlo con latencia artificial. Así podemos detectar errores antes de pagar o configurar un host.
