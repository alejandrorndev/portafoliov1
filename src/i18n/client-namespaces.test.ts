import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CLIENT_NAMESPACES } from './config'

/*
 * -----------------------------------------------------------------------------
 * La lista de namespaces del cliente no puede quedarse corta.
 * -----------------------------------------------------------------------------
 * El layout solo envía al navegador los namespaces de CLIENT_NAMESPACES. Es lo
 * que evita serializar el aviso de privacidad entero en una portada que no lo
 * muestra.
 *
 * El riesgo es evidente: alguien añade un componente de cliente que traduce,
 * olvida ampliar la lista, y el fallo NO aparece al compilar. Aparece en
 * runtime, y solo cuando ese componente concreto se renderiza.
 *
 * Este test recorre los archivos marcados con 'use client', extrae los
 * namespaces que usan y exige que estén cubiertos.
 * -----------------------------------------------------------------------------
 */

const SRC = resolve(process.cwd(), 'src')

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (entry === '__fixtures__') continue
      walk(path, files)
    } else if (/\.tsx?$/.test(entry) && !/\.(test|spec)\.tsx?$/.test(entry)) {
      files.push(path)
    }
  }
  return files
}

/** Archivos que se ejecutan en el navegador. */
const clientFiles = walk(SRC).filter((file) =>
  /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8')),
)

/**
 * Namespaces que usa un archivo.
 *
 * La distincion que importa es el ambito. Con `useTranslations('contact.form')`
 * las llamadas posteriores son RELATIVAS a ese namespace —`t('name')` resuelve
 * `contact.form.name`—, asi que leerlas como claves absolutas daria namespaces
 * inventados. Solo cuando `useTranslations()` va sin argumento las claves de
 * `t()` son rutas completas.
 *
 *   useTranslations('contact.form') + t('name')     → contact
 *   useTranslations()               + t('nav.about') → nav
 *   useTranslations()               + t(`nav.${x}`)  → nav
 *
 * Limitación conocida: un archivo que mezclara ambas formas quedaría
 * infra-reportado. Ninguno lo hace, y mezclarlas seria confuso de leer.
 */
function namespacesIn(source: string): string[] {
  const found = new Set<string>()
  let scoped = false

  for (const [, key] of source.matchAll(/useTranslations\(\s*['"`]([\w.]+)/g)) {
    found.add(key!.split('.')[0]!)
    scoped = true
  }

  if (!scoped) {
    for (const [, key] of source.matchAll(/\bt(?:\.rich)?\(\s*['"`]([\w.]+)/g)) {
      found.add(key!.split('.')[0]!)
    }
  }

  return [...found]
}

describe('namespaces enviados al cliente', () => {
  it('encuentra los componentes de cliente', () => {
    // Si este número cae a cero, el escaneo dejó de funcionar y el resto del
    // archivo pasaría sin comprobar nada.
    expect(clientFiles.length).toBeGreaterThan(3)
  })

  it.each(clientFiles.map((file) => [relative(SRC, file), file]))(
    '%s solo usa namespaces disponibles en el cliente',
    (name, file) => {
      const used = namespacesIn(readFileSync(file, 'utf8'))
      const missing = used.filter(
        (namespace) => !(CLIENT_NAMESPACES as readonly string[]).includes(namespace),
      )

      expect(
        missing,
        `${name} usa ${missing.join(', ')}; añádelo a CLIENT_NAMESPACES en src/i18n/config.ts`,
      ).toEqual([])
    },
  )

  it('no sobran namespaces en la lista', () => {
    // Uno de más no rompe nada, pero devuelve el peso que esta lista existe
    // para ahorrar.
    const used = new Set(clientFiles.flatMap((file) => namespacesIn(readFileSync(file, 'utf8'))))
    const unused = CLIENT_NAMESPACES.filter((namespace) => !used.has(namespace))

    expect(unused, 'namespaces declarados que ya nadie usa en el cliente').toEqual([])
  })
})
