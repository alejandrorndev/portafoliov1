import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * ---------------------------------------------------------------------------
 * El contraste de la paleta, verificado en cada corrida.
 * ---------------------------------------------------------------------------
 * El token --color-muted del original daba 4.39:1 sobre el fondo y se quedaba
 * corto frente al 4.5:1 de WCAG AA. Como pintaba casi todos los parrafos, la
 * mayor parte del texto del sitio no cumplia.
 *
 * Un color se ajusta a ojo con facilidad y nadie recalcula el ratio. Este test
 * lee los tokens del CSS real —no una copia— y falla si alguno baja del
 * umbral, asi que la regresion no puede pasar desapercibida.
 * ---------------------------------------------------------------------------
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

/** Extrae los `--color-*: #rrggbb` del bloque @theme. */
function readColorTokens(): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const [, name, hex] of CSS.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[name!] = hex!
  }
  return tokens
}

/** Luminancia relativa segun WCAG 2.1. */
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter! + 0.05) / (darker! + 0.05)
}

const AA_NORMAL = 4.5

const tokens = readColorTokens()

/** Tokens que se usan para pintar texto sobre las superficies del sitio. */
const FOREGROUNDS = ['ink', 'muted', 'purple', 'cyan', 'gold', 'pink'] as const
const SURFACES = ['bg', 'bg-alt'] as const

describe('contraste de la paleta', () => {
  it('los tokens esperados existen en globals.css', () => {
    for (const name of [...FOREGROUNDS, ...SURFACES]) {
      expect(tokens[name], `falta --color-${name}`).toBeDefined()
    }
  })

  it.each(FOREGROUNDS)('--color-%s cumple WCAG AA sobre ambas superficies', (foreground) => {
    for (const surface of SURFACES) {
      const ratio = contrast(tokens[foreground]!, tokens[surface]!)

      expect(
        Number(ratio.toFixed(2)),
        `--color-${foreground} (${tokens[foreground]}) sobre --color-${surface} (${tokens[surface]})`,
      ).toBeGreaterThanOrEqual(AA_NORMAL)
    }
  })

  it('la funcion de contraste concuerda con valores conocidos', () => {
    // Blanco sobre negro es 21:1 exacto. Si esta asercion falla, el problema
    // esta en la formula y no en la paleta.
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 1)
    expect(contrast('#000000', '#000000')).toBeCloseTo(1, 5)
  })
})
