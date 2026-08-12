import { describe, expect, it } from 'vitest'
import { LOCALES } from './config'
import en from './messages/en.json'
import es from './messages/es.json'

/*
 * Los archivos de mensajes son JSON plano: TypeScript no puede exigir que
 * tengan las mismas claves. Una clave que exista en es.json y falte en en.json
 * no rompe el build —falla al renderizar, y solo en ingles—, que es
 * exactamente el tipo de error que nadie ve hasta que lo ve un reclutador.
 *
 * Estos tests cierran ese hueco.
 */

type Messages = Record<string, unknown>

const bundles: Record<string, Messages> = { es, en }

/** Aplana { a: { b: 'x' } } a ['a.b']. */
function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]

  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  )
}

/** Recupera todos los placeholders {asi} de un texto. */
function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort()
}

function leaves(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]]
  if (typeof value !== 'object' || value === null) return []

  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('mensajes de UI', () => {
  it('existe un archivo por cada idioma declarado', () => {
    expect(Object.keys(bundles).sort()).toEqual([...LOCALES].sort())
  })

  it('todos los idiomas tienen exactamente las mismas claves', () => {
    const reference = flatten(es).sort()

    for (const [locale, bundle] of Object.entries(bundles)) {
      const keys = flatten(bundle).sort()

      expect(
        reference.filter((key) => !keys.includes(key)),
        `faltan claves en ${locale}.json`,
      ).toEqual([])

      expect(
        keys.filter((key) => !reference.includes(key)),
        `sobran claves en ${locale}.json`,
      ).toEqual([])
    }
  })

  it('no hay valores vacios', () => {
    for (const [locale, bundle] of Object.entries(bundles)) {
      const empty = leaves(bundle)
        .filter(([, value]) => value.trim() === '')
        .map(([key]) => key)

      expect(empty, `valores vacíos en ${locale}.json`).toEqual([])
    }
  })

  it('los placeholders coinciden entre idiomas', () => {
    // Traducir "{name}" como "{nombre}" compila, pasa revision visual, y
    // luego imprime "{nombre}" literal en pantalla.
    const reference = new Map(leaves(es))

    for (const [locale, bundle] of Object.entries(bundles)) {
      for (const [key, value] of leaves(bundle)) {
        const expected = reference.get(key)
        if (expected === undefined) continue

        expect(placeholders(value), `placeholders distintos en ${locale}.json → ${key}`).toEqual(
          placeholders(expected),
        )
      }
    }
  })
})
