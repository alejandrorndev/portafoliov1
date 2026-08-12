/**
 * Script que se inyecta al principio del <body> y corre antes del pintado.
 *
 * Marca `data-motion="on"` en <html>, que es el interruptor del que cuelga
 * todo el estado oculto de los reveals en globals.css.
 *
 * Exige dos condiciones, y ambas importan:
 *
 *   - que el usuario no haya pedido menos movimiento;
 *   - que exista IntersectionObserver.
 *
 * La segunda es la que evita un fallo silencioso: sin IntersectionObserver
 * nada dispararia los reveals, y como el estado oculto solo existe bajo este
 * atributo, comprobarlo aqui garantiza que el contenido se vea entero en vez
 * de quedarse invisible para siempre.
 *
 * Tiene que ejecutarse antes del pintado y no tras la hidratacion: si esperase
 * a React, cada seccion se veria un instante antes de ocultarse para volver a
 * entrar.
 */
export const MOTION_FLAG_SCRIPT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){document.documentElement.dataset.motion='on'}}catch(e){}`
