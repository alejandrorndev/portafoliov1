import { describe, expect, it } from 'vitest'
import { FADE_CUTOFF, fadeOpacity } from './fade'

const HERO = 900

describe('fadeOpacity', () => {
  it('se ve entera con el hero arriba del todo', () => {
    expect(fadeOpacity(0, HERO)).toBe(1)
  })

  it('va a la mitad con medio hero desplazado', () => {
    expect(fadeOpacity(-HERO / 2, HERO)).toBeCloseTo(0.5)
  })

  it('llega a cero justo cuando el hero termina de salir', () => {
    expect(fadeOpacity(-HERO, HERO)).toBe(0)
  })

  it('no baja de cero al seguir bajando', () => {
    // Sin el limite, la opacidad se volveria negativa y el navegador la
    // trataria de forma impredecible.
    expect(fadeOpacity(-HERO * 4, HERO)).toBe(0)
  })

  it('no pasa de uno si el hero queda por debajo del viewport', () => {
    // Ocurre con scroll elastico en iOS y Safari de escritorio: `top` se
    // vuelve positivo y -top/height quedaria negativo.
    expect(fadeOpacity(200, HERO)).toBe(1)
  })

  it('sobrevive a una altura de cero', () => {
    // Pasa entre el primer render y el layout. Dividir ahi daria Infinity y la
    // escena parpadearia al cargar.
    expect(fadeOpacity(0, 0)).toBe(1)
    expect(fadeOpacity(-100, 0)).toBe(1)
  })

  it('el umbral de apagado corta antes de llegar a cero exacto', () => {
    // Mantener 8.800 particulas dibujandose para una opacidad de 0,004 es
    // gasto puro.
    expect(FADE_CUTOFF).toBeGreaterThan(0)
    expect(FADE_CUTOFF).toBeLessThan(0.1)

    const casiFuera = fadeOpacity(-HERO * 0.995, HERO)
    expect(casiFuera).toBeLessThan(FADE_CUTOFF)
  })

  it('decrece de forma monótona durante todo el recorrido', () => {
    const muestras = Array.from({ length: 20 }, (_, i) => fadeOpacity((-HERO * i) / 19, HERO))

    for (let i = 1; i < muestras.length; i++) {
      expect(muestras[i]!).toBeLessThanOrEqual(muestras[i - 1]!)
    }
  })
})
