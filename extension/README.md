# HaxBall Global Lab — extensión de diagnóstico (v0.1)

## Qué hace
- Muestra FPS aproximados y tiempo medio entre frames de la página donde se ejecuta.
- Mide el tiempo entre una tecla y el siguiente `requestAnimationFrame` disponible.
- Permite marcar momentos durante una prueba y exportar las marcas a CSV.
- No bloquea teclas, no intercepta ni cambia paquetes de red y no altera la física de HaxBall.

## Qué NO hace
- No mide el ping real del juego.
- No reduce la latencia de red.
- No implementa predicción ni rollback todavía.
- La métrica “tecla → siguiente frame” es un indicador local, no una medida exacta de cuándo se ve el movimiento del jugador. El juego puede ejecutarse en un iframe y el navegador puede aislar su contexto.

## Instalar en Chrome
1. Abrí esta carpeta en tu PC o descargá el repositorio como ZIP desde GitHub.
2. En Chrome, abrí `chrome://extensions`.
3. Activá **Modo de desarrollador**.
4. Elegí **Cargar descomprimida** y seleccioná la carpeta `extension`.
5. Abrí o recargá el HaxBall original. El panel debe aparecer en la esquina superior derecha.
6. Jugá una prueba normal y otra con el mismo escenario pero distinta extrapolación. Usá “Marcar prueba” en cada caso y exportá el CSV.

## Permisos y privacidad
La extensión solo se inyecta en páginas de HaxBall indicadas en `manifest.json`. No usa permisos de red, almacenamiento, historial ni acceso a otras páginas. Las marcas se guardan en memoria y se descargan únicamente cuando apretás “Exportar CSV”.

## Próximo paso técnico
Primero validar si la extensión aparece dentro del marco que contiene el juego y si las métricas son estables. Luego investigar si el cliente oficial expone algún estado accesible. Si no, el siguiente paso sería un prototipo visual aislado o una integración con un cliente compatible; una extensión externa no puede hacer rollback real sin acceso al estado y a la simulación autoritativa.
