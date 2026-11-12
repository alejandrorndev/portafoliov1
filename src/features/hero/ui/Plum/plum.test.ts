import { describe, expect, it } from 'vitest'
import { BOUNDS_MARGIN, createPlum, SEGMENT_MAX } from './plum'

/** PRNG con semilla (mulberry32): mismo arbol en cada corrida. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Segment = [number, number, number, number]

function grow(width: number, height: number, seed: number) {
  const segments: Segment[] = []
  const plum = createPlum({
    width,
    height,
    random: seeded(seed),
    draw: (...segment) => segments.push(segment),
  })

  let ticks = 0
  while (plum.tick() && ticks < 10_000) ticks++

  return { segments, ticks }
}

describe('createPlum', () => {
  it.each([1, 2, 3, 42, 1234])('deja de crecer por si solo (semilla %i)', (seed) => {
    // Lo que distingue a este fondo de la escena 3D: el bucle termina y el
    // canvas queda quieto.
    const { ticks } = grow(1280, 800, seed)
    expect(ticks).toBeLessThan(10_000)
  })

  it('dibuja segmentos cortos', () => {
    const { segments } = grow(1280, 800, 7)
    expect(segments.length).toBeGreaterThan(0)

    for (const [x1, y1, x2, y2] of segments) {
      expect(Math.hypot(x2 - x1, y2 - y1)).toBeLessThanOrEqual(SEGMENT_MAX)
    }
  })

  it('no sigue creciendo lejos de la pantalla', () => {
    const { segments } = grow(1280, 800, 99)

    // Un segmento puede salirse como mucho un paso mas alla del margen.
    const limit = BOUNDS_MARGIN + SEGMENT_MAX
    for (const [x1, y1] of segments) {
      expect(x1).toBeGreaterThanOrEqual(-limit)
      expect(x1).toBeLessThanOrEqual(1280 + limit)
      expect(y1).toBeGreaterThanOrEqual(-limit)
      expect(y1).toBeLessThanOrEqual(800 + limit)
    }
  })

  it('en pantallas estrechas solo nace arriba y abajo', () => {
    const seedsFromSides = (width: number) => {
      const starts: Segment[] = []
      const plum = createPlum({
        width,
        height: 800,
        random: seeded(5),
        draw: (...segment) => starts.push(segment),
      })
      // Basta con forzar las semillas: en la primera tanda se ejecutan o
      // esperan, pero todas acaban arrancando desde un borde.
      while (plum.tick() && starts.length < 200);
      return starts.filter(([x1]) => x1 === -5 || x1 === width + 5).length
    }

    expect(seedsFromSides(390)).toBe(0)
    expect(seedsFromSides(1280)).toBeGreaterThan(0)
  })
})
