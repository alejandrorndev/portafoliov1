import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectQuality, supportsWebGL } from './capability'

/*
 * Estas dos funciones deciden si el visitante ve una escena 3D o un fondo
 * estatico. Si `supportsWebGL` diera un falso positivo, R3F reventaria al
 * montar y el hero se quedaria roto; si `detectQuality` no bajara el detalle
 * en movil, el sitio se arrastraria justo en el dispositivo desde el que mas
 * gente abre un enlace.
 */

const originalGetContext = HTMLCanvasElement.prototype.getContext

function mockWebGL(available: boolean | 'throws') {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    if (available === 'throws') throw new Error('contexto no disponible')
    return available ? ({} as RenderingContext) : null
  }) as unknown as typeof originalGetContext
}

function mockDevice({ width, cores, memory }: { width: number; cores?: number; memory?: number }) {
  vi.stubGlobal('innerWidth', width)
  Object.defineProperty(window.navigator, 'hardwareConcurrency', {
    value: cores ?? 8,
    configurable: true,
  })
  Object.defineProperty(window.navigator, 'deviceMemory', {
    value: memory ?? 8,
    configurable: true,
  })
}

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext
  vi.unstubAllGlobals()
})

describe('supportsWebGL', () => {
  it('detecta que hay WebGL', () => {
    mockWebGL(true)
    expect(supportsWebGL()).toBe(true)
  })

  it('detecta que no lo hay', () => {
    mockWebGL(false)
    expect(supportsWebGL()).toBe(false)
  })

  it('no propaga la excepción si crear el contexto falla', () => {
    // Pasa de verdad: driver en lista negra, aceleracion desactivada, o
    // demasiados contextos WebGL vivos en la pestaña. Comprobar que el
    // constructor existe no basta.
    mockWebGL('throws')
    expect(() => supportsWebGL()).not.toThrow()
    expect(supportsWebGL()).toBe(false)
  })
})

describe('detectQuality', () => {
  it('da calidad máxima en un escritorio potente', () => {
    mockDevice({ width: 1920, cores: 16, memory: 16 })
    expect(detectQuality()).toBe(1)
  })

  it('recorta mucho en un móvil', () => {
    mockDevice({ width: 390, cores: 8, memory: 8 })
    expect(detectQuality()).toBeLessThanOrEqual(0.4)
  })

  it('recorta todavía más en un móvil con pocos recursos', () => {
    mockDevice({ width: 390, cores: 4, memory: 2 })
    expect(detectQuality()).toBeLessThanOrEqual(0.25)
  })

  it('no se fía solo del ancho de pantalla', () => {
    // Una pantalla grande conectada a una maquina modesta existe, y el ancho
    // por si solo la daria por potente.
    mockDevice({ width: 1920, cores: 2, memory: 2 })
    expect(detectQuality()).toBeLessThan(1)
  })

  it('nunca sale del rango 0..1', () => {
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
      for (const cores of [1, 4, 16]) {
        mockDevice({ width, cores })
        const quality = detectQuality()
        expect(quality).toBeGreaterThan(0)
        expect(quality).toBeLessThanOrEqual(1)
      }
    }
  })

  it('sobrevive a navegadores que no exponen núcleos ni memoria', () => {
    vi.stubGlobal('innerWidth', 1440)
    Object.defineProperty(window.navigator, 'hardwareConcurrency', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(window.navigator, 'deviceMemory', {
      value: undefined,
      configurable: true,
    })

    expect(() => detectQuality()).not.toThrow()
    expect(detectQuality()).toBeGreaterThan(0)
  })
})
