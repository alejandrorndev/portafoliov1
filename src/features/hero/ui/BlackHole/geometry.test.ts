import { describe, expect, it } from 'vitest'
import {
  createAccretionDisk,
  createJets,
  createNebula,
  createStarfield,
  totalParticles,
} from './geometry'

/*
 * La escena es la parte mas cara del sitio y la que mas facilmente se degrada
 * sin que se note: un radio mal portado o un factor de calidad que no reduce
 * nada solo se ve como "va lento en el movil".
 *
 * El PRNG sembrado es lo que hace esto comprobable. Con Math.random() no habria
 * forma de afirmar nada sobre 6.700 posiciones.
 */

/** Radio en el plano XZ: el disco es plano, la altura se comprueba aparte. */
const radiusXZ = (positions: Float32Array, i: number) =>
  Math.hypot(positions[i * 3]!, positions[i * 3 + 2]!)

const distance = (positions: Float32Array, i: number) =>
  Math.hypot(positions[i * 3]!, positions[i * 3 + 1]!, positions[i * 3 + 2]!)

describe('generación de la escena', () => {
  it('es determinista: la misma semilla da la misma nube', () => {
    // El original usaba Math.random(), asi que la escena cambiaba en cada
    // recarga y no habia nada que comparar entre builds.
    expect(createStarfield(1, 42).positions).toEqual(createStarfield(1, 42).positions)
  })

  it('semillas distintas dan nubes distintas', () => {
    expect(createStarfield(1, 1).positions).not.toEqual(createStarfield(1, 2).positions)
  })

  it('no produce NaN ni infinitos', () => {
    // Un solo NaN en el buffer de posiciones hace desaparecer la nube entera
    // en WebGL, sin ningun error en consola.
    const clouds = [
      createStarfield(),
      createJets(),
      createNebula(),
      ...createAccretionDisk().map((ring) => ring.cloud),
    ]

    for (const cloud of clouds) {
      expect(cloud.positions.every(Number.isFinite)).toBe(true)
      expect(cloud.colors.every(Number.isFinite)).toBe(true)
    }
  })

  it('mantiene los canales de color dentro de 0..1', () => {
    for (const cloud of [createStarfield(), createJets(), createNebula()]) {
      expect(Math.min(...cloud.colors)).toBeGreaterThanOrEqual(0)
      expect(Math.max(...cloud.colors)).toBeLessThanOrEqual(1)
    }
  })

  it('los buffers tienen tres componentes por partícula', () => {
    const cloud = createStarfield(0.5)
    expect(cloud.positions.length).toBe(cloud.count * 3)
    expect(cloud.colors.length).toBe(cloud.count * 3)
  })
})

describe('campo de estrellas', () => {
  it('reparte las estrellas en la cáscara esférica del original', () => {
    const cloud = createStarfield()

    for (let i = 0; i < cloud.count; i++) {
      const r = distance(cloud.positions, i)
      expect(r).toBeGreaterThanOrEqual(60)
      expect(r).toBeLessThanOrEqual(220)
    }
  })

  it('deja despejado el centro, donde va el agujero negro', () => {
    const cloud = createStarfield()
    const closest = Math.min(
      ...Array.from({ length: cloud.count }, (_, i) => distance(cloud.positions, i)),
    )

    expect(closest).toBeGreaterThan(9)
  })
})

describe('disco de acreción', () => {
  it('conserva las cinco bandas del original', () => {
    expect(createAccretionDisk()).toHaveLength(5)
  })

  it('mantiene cada partícula dentro del radio de su banda', () => {
    for (const ring of createAccretionDisk()) {
      for (let i = 0; i < ring.cloud.count; i++) {
        const r = radiusXZ(ring.cloud.positions, i)
        expect(r).toBeGreaterThanOrEqual(ring.innerRadius - 1e-6)
        expect(r).toBeLessThanOrEqual(ring.outerRadius + 1e-6)
      }
    }
  })

  it('mantiene el disco plano', () => {
    for (const ring of createAccretionDisk()) {
      for (let i = 0; i < ring.cloud.count; i++) {
        expect(Math.abs(ring.cloud.positions[i * 3 + 1]!)).toBeLessThanOrEqual(0.11)
      }
    }
  })

  it('gira más rápido cuanto más cerca del centro', () => {
    // Es lo que da la sensacion de rotacion kepleriana: el material interior
    // adelanta al exterior.
    const speeds = createAccretionDisk().map((ring) => ring.speed)
    expect(speeds).toEqual([...speeds].sort((a, b) => b - a))
  })

  it('las bandas no se solapan', () => {
    const rings = createAccretionDisk()
    for (let i = 1; i < rings.length; i++) {
      expect(rings[i]!.innerRadius).toBeGreaterThanOrEqual(rings[i - 1]!.outerRadius)
    }
  })
})

describe('chorros relativistas', () => {
  it('salen por los dos polos', () => {
    const cloud = createJets()
    const above = Array.from({ length: cloud.count }, (_, i) => cloud.positions[i * 3 + 1]!)

    expect(above.some((y) => y > 1)).toBe(true)
    expect(above.some((y) => y < -1)).toBe(true)
  })

  it('arrancan fuera del horizonte de sucesos', () => {
    // El horizonte tiene radio 1.1: un chorro que naciera dentro se veria
    // atravesando la esfera negra.
    const cloud = createJets()

    for (let i = 0; i < cloud.count; i++) {
      expect(Math.abs(cloud.positions[i * 3 + 1]!)).toBeGreaterThanOrEqual(1.15)
    }
  })

  it('se mantienen colimados', () => {
    const cloud = createJets()

    for (let i = 0; i < cloud.count; i++) {
      expect(radiusXZ(cloud.positions, i)).toBeLessThanOrEqual(0.56)
    }
  })
})

describe('escalado por calidad', () => {
  it('la calidad 1 conserva el conteo del original', () => {
    // 3.500 estrellas + 3.700 del disco + 1.000 de chorros + 600 de nebulosa.
    expect(totalParticles(1)).toBe(8800)
  })

  it('reduce el trabajo de forma proporcional', () => {
    expect(totalParticles(0.4)).toBeLessThan(totalParticles(1) * 0.45)
    expect(totalParticles(0.25)).toBeLessThan(totalParticles(1) * 0.3)
  })

  it('nunca deja una banda vacía', () => {
    // Con un factor muy bajo, redondear a cero haria desaparecer bandas
    // enteras del disco en vez de aligerarlas.
    for (const ring of createAccretionDisk(0.001)) {
      expect(ring.cloud.count).toBeGreaterThan(0)
    }
  })

  it('mantiene los radios al bajar la calidad', () => {
    const full = createAccretionDisk(1)
    const low = createAccretionDisk(0.3)

    expect(low.map((r) => [r.innerRadius, r.outerRadius])).toEqual(
      full.map((r) => [r.innerRadius, r.outerRadius]),
    )
  })
})
