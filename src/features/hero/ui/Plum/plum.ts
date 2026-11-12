/*
 * -----------------------------------------------------------------------------
 * Ramas de ciruelo ("plum") que crecen desde los bordes de la pantalla.
 * -----------------------------------------------------------------------------
 * Adaptado de ArtPlum.vue, de antfu.me (https://github.com/antfu/antfu.me).
 *
 *   MIT License — Copyright (c) 2020-2021 Anthony Fu
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the
 *   "Software"), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish,
 *   distribute, sublicense, and/or sell copies of the Software, and to permit
 *   persons to whom the Software is furnished to do so, subject to the
 *   following conditions: The above copyright notice and this permission
 *   notice shall be included in all copies or substantial portions of the
 *   Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Cambios respecto al original: la logica se separa del canvas y de Vue —recibe
 * una funcion de dibujo y una de azar—, lo que permite probarla y dibujar el
 * arbol entero de una vez cuando el usuario pidio menos movimiento.
 * -----------------------------------------------------------------------------
 */

const R180 = Math.PI
const R90 = Math.PI / 2
const R15 = Math.PI / 12

/** Pasos durante los que una rama se bifurca con mas probabilidad. */
const MIN_BRANCH = 30
/**
 * Longitud maxima de cada segmento, en px CSS. El original usa 6; con 10 el
 * grueso del dibujo llega ~25% mas cerca del centro y, como cada segmento
 * cubre mas, el arbol termina antes y con menos trazos (medido con 200
 * semillas en 1440x900 y 390x844).
 */
export const SEGMENT_MAX = 10
/** Margen fuera de pantalla a partir del cual una rama deja de crecer. */
export const BOUNDS_MARGIN = 100
/** Por debajo de este ancho nacen ramas solo arriba y abajo: en movil, cuatro saturan. */
const NARROW_WIDTH = 500

export type DrawSegment = (x1: number, y1: number, x2: number, y2: number) => void

type Step = () => void

export type Plum = {
  /** Ejecuta una tanda de crecimiento. Devuelve `false` cuando ya no queda nada por crecer. */
  tick: () => boolean
}

export function createPlum({
  width,
  height,
  draw,
  random = Math.random,
}: {
  width: number
  height: number
  draw: DrawSegment
  random?: () => number
}): Plum {
  let pending: Step[] = []

  // Comparte contador toda la rama que nace de una misma semilla: los primeros
  // MIN_BRANCH pasos de cada arbol se ramifican mas, despues se aclara.
  const step = (x: number, y: number, rad: number, counter: { value: number }) => {
    const length = random() * SEGMENT_MAX
    counter.value += 1

    const nx = x + length * Math.cos(rad)
    const ny = y + length * Math.sin(rad)
    draw(x, y, nx, ny)

    const outOfBounds =
      nx < -BOUNDS_MARGIN ||
      nx > width + BOUNDS_MARGIN ||
      ny < -BOUNDS_MARGIN ||
      ny > height + BOUNDS_MARGIN
    if (outOfBounds) return

    const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5
    const left = rad + random() * R15
    const right = rad - random() * R15

    if (random() < rate) pending.push(() => step(nx, ny, left, counter))
    if (random() < rate) pending.push(() => step(nx, ny, right, counter))
  }

  // Punto al azar en el 60% central del borde.
  const middle = () => random() * 0.6 + 0.2

  pending = [
    () => step(middle() * width, -5, R90, { value: 0 }),
    () => step(middle() * width, height + 5, -R90, { value: 0 }),
  ]
  if (width >= NARROW_WIDTH) {
    pending.push(
      () => step(-5, middle() * height, 0, { value: 0 }),
      () => step(width + 5, middle() * height, R180, { value: 0 }),
    )
  }

  return {
    tick() {
      const current = pending
      pending = []

      // La mitad de los pasos espera a la siguiente tanda. Es lo que hace que
      // el crecimiento se vea organico y no como un frente que avanza parejo.
      for (const next of current) {
        if (random() < 0.5) pending.push(next)
        else next()
      }

      return pending.length > 0
    },
  }
}
