/**
 * Opacidad de la escena segun cuanto queda del hero en pantalla.
 *
 * `top` y `height` son los del rectangulo del hero. Mientras el hero esta
 * arriba del todo, `top` vale 0 y la escena se ve entera. A medida que se
 * desplaza, `top` se vuelve negativo; cuando su valor absoluto iguala la
 * altura del hero, este ha salido por completo y la escena esta invisible.
 *
 * Se aisla como funcion pura porque es la unica parte con logica: el resto es
 * escribir un numero en un estilo. Asi se puede comprobar sin montar nada.
 */
export function fadeOpacity(top: number, height: number): number {
  // Un hero de altura cero solo pasa entre el primer render y el layout.
  // Dividir ahi daria Infinity y la escena parpadearia al cargar.
  if (height <= 0) return 1

  const scrolled = Math.min(Math.max(-top / height, 0), 1)
  return 1 - scrolled
}

/**
 * Por debajo de esto la escena es invisible y se puede apagar su bucle de
 * render. No es 0 exacto: mantener 8.800 particulas dibujandose para una
 * opacidad de 0,004 es gasto puro.
 */
export const FADE_CUTOFF = 0.02
