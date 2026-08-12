/*
 * -----------------------------------------------------------------------------
 * Generacion de las nubes de particulas de la escena.
 * -----------------------------------------------------------------------------
 * Portado de docs/legacy/index.html conservando radios, densidades y colores.
 *
 * Dos cambios respecto al original:
 *
 *   1. Math.random() se sustituye por un PRNG sembrado. La escena queda igual
 *      en cada carga —antes cambiaba en cada recarga— y, sobre todo, estas
 *      funciones se vuelven comprobables: sin semilla no hay forma de afirmar
 *      nada sobre 6.700 posiciones aleatorias.
 *
 *   2. Todas aceptan un factor de calidad que escala el numero de particulas.
 *      Es la palanca para que un telefono de gama media no tenga que dibujar
 *      las mismas 6.700 que un escritorio.
 *
 * Son funciones puras que devuelven Float32Array: ni tocan Three.js ni el DOM.
 * -----------------------------------------------------------------------------
 */

export type ParticleCloud = {
  positions: Float32Array
  colors: Float32Array
  count: number
}

/**
 * PRNG mulberry32: 32 bits de estado, distribucion uniforme suficiente para
 * repartir puntos y muchisimo mas barato que cualquier alternativa.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Descompone 0xRRGGBB en tres canales 0..1. */
function toRgb(hex: number): [number, number, number] {
  return [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255]
}

/** Escala un conteo por calidad, sin bajar nunca de 1 particula. */
const scaled = (count: number, quality: number) => Math.max(1, Math.round(count * quality))

/**
 * Campo de estrellas: cascara esferica entre r=60 y r=220.
 *
 * La mezcla de color viene del original: mayoria blancas, algunas azuladas y
 * unas pocas doradas.
 */
export function createStarfield(quality = 1, seed = 1): ParticleCloud {
  const count = scaled(3500, quality)
  const random = createRandom(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2
    // acos(2u-1) reparte los puntos de forma uniforme sobre la esfera; usar
    // el angulo directamente los amontonaria en los polos.
    const phi = Math.acos(2 * random() - 1)
    const radius = 60 + random() * 160

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    const tint = random()
    const rgb: [number, number, number] =
      tint < 0.6 ? [1, 1, 1] : tint < 0.82 ? [0.65, 0.8, 1] : [1, 0.85, 0.45]

    colors[i * 3] = rgb[0]
    colors[i * 3 + 1] = rgb[1]
    colors[i * 3 + 2] = rgb[2]
  }

  return { positions, colors, count }
}

export type DiskRing = {
  innerRadius: number
  outerRadius: number
  /** Velocidad angular relativa: los anillos interiores giran mas rapido. */
  speed: number
  size: number
  opacity: number
  cloud: ParticleCloud
}

/** [radio interior, exterior, particulas, velocidad, color1, color2, opacidad, tamaño] */
const DISK_BANDS: readonly [number, number, number, number, number, number, number, number][] = [
  [1.25, 1.9, 700, 2.2, 0xffffff, 0x67e8f9, 0.95, 0.048],
  [1.9, 3.0, 1000, 1.4, 0x06b6d4, 0x8b5cf6, 0.85, 0.052],
  [3.0, 4.5, 900, 0.8, 0xa78bfa, 0xec4899, 0.7, 0.056],
  [4.5, 6.5, 700, 0.4, 0xbe185d, 0x6d28d9, 0.55, 0.062],
  [6.5, 9.0, 400, 0.2, 0x4c1d95, 0x1e1b4b, 0.35, 0.07],
]

/**
 * Disco de acrecion: cinco bandas concentricas que giran a distinta velocidad.
 *
 * Esa diferencia de velocidad es lo que da la sensacion de rotacion
 * kepleriana, con el material interior adelantando al exterior.
 */
export function createAccretionDisk(quality = 1, seed = 2): DiskRing[] {
  return DISK_BANDS.map(([inner, outer, baseCount, speed, from, to, opacity, size], band) => {
    const count = scaled(baseCount, quality)
    const random = createRandom(seed + band * 97)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const [r1, g1, b1] = toRgb(from)
    const [r2, g2, b2] = toRgb(to)

    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2
      // El exponente 1.4 concentra material cerca del borde interior, donde
      // la banda brilla mas.
      const radius = inner + random() ** 1.4 * (outer - inner)
      const normalized = (radius - inner) / (outer - inner)
      const height = (random() - 0.5) * 0.22 * (1 - normalized * 0.6)

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius

      const mix = random()
      colors[i * 3] = r1 + (r2 - r1) * mix
      colors[i * 3 + 1] = g1 + (g2 - g1) * mix
      colors[i * 3 + 2] = b1 + (b2 - b1) * mix
    }

    return {
      innerRadius: inner,
      outerRadius: outer,
      speed,
      size,
      opacity,
      cloud: { positions, colors, count },
    }
  })
}

/**
 * Chorros relativistas: dos conos de particulas saliendo por los polos.
 *
 * Se abren y se apagan con la distancia, como en el original.
 */
export function createJets(quality = 1, seed = 3): ParticleCloud {
  const count = scaled(1000, quality)
  const random = createRandom(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const t = random() ** 1.5
    const side = i < count / 2 ? 1 : -1
    const angle = random() * Math.PI * 2
    const spread = t * 0.55

    positions[i * 3] = Math.cos(angle) * spread
    positions[i * 3 + 1] = side * (1.15 + t * 8)
    positions[i * 3 + 2] = Math.sin(angle) * spread

    const brightness = 1 - t * 0.35
    colors[i * 3] = 0.25 * brightness
    colors[i * 3 + 1] = 0.65 * brightness
    colors[i * 3 + 2] = brightness
  }

  return { positions, colors, count }
}

const NEBULA_COLORS = [0x8b5cf6, 0x3344bb, 0xcc2255, 0xff6600] as const

/** Polvo de nebulosa: una caja difusa de puntos grandes y muy translucidos. */
export function createNebula(quality = 1, seed = 4): ParticleCloud {
  const count = scaled(600, quality)
  const random = createRandom(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * 40
    positions[i * 3 + 1] = (random() - 0.5) * 20
    positions[i * 3 + 2] = (random() - 0.5) * 15 - 5

    const hex = NEBULA_COLORS[Math.floor(random() * NEBULA_COLORS.length)] ?? NEBULA_COLORS[0]
    const [r, g, b] = toRgb(hex)
    colors[i * 3] = r
    colors[i * 3 + 1] = g
    colors[i * 3 + 2] = b
  }

  return { positions, colors, count }
}

/** [radio interior, exterior, color, opacidad] */
export const PHOTON_RINGS: readonly [number, number, number, number][] = [
  [1.12, 1.16, 0xffffff, 0.95],
  [1.18, 1.24, 0x67e8f9, 0.55],
  [1.28, 1.4, 0x06b6d4, 0.25],
  [1.45, 1.7, 0x8b5cf6, 0.1],
]

export const LENSING_RINGS: readonly [number, number, number, number][] = [
  [2.1, 2.14, 0x88bbff, 0.22],
  [3.4, 3.46, 0x5577cc, 0.12],
  [5.5, 5.58, 0x3355aa, 0.07],
]

/** Inclinacion del disco respecto a la camara. */
export const DISK_TILT = Math.PI / 5.5

/** Cuenta total de particulas para un factor de calidad dado. */
export function totalParticles(quality = 1): number {
  return (
    createStarfield(quality).count +
    createAccretionDisk(quality).reduce((sum, ring) => sum + ring.cloud.count, 0) +
    createJets(quality).count +
    createNebula(quality).count
  )
}
