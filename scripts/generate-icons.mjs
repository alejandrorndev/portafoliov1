// @ts-check
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/*
 * -----------------------------------------------------------------------------
 * Vendoriza como SVG los iconos de devicon que el contenido usa.
 * -----------------------------------------------------------------------------
 * devicon se distribuye como fuente de iconos, y esa fuente pesa 1.46 MB en
 * woff (no publica woff2). Para los ~28 iconos que este sitio usa, los SVG
 * sueltos suman ~45 KB: unas 30 veces menos, y sin bloquear el render
 * esperando una fuente.
 *
 * El script lee los nombres directamente de src/content, asi que solo entra lo
 * que de verdad se usa. Si alguien agrega un icono y olvida re-ejecutarlo,
 * icons.test.ts falla: la desincronizacion no puede pasar inadvertida.
 *
 * Uso: pnpm icons
 * -----------------------------------------------------------------------------
 */

const ROOT = resolve(import.meta.dirname, '..')
const DEVICON = resolve(ROOT, 'node_modules/devicon/icons')
const CONTENT = resolve(ROOT, 'src/content')
const OUTPUT = resolve(ROOT, 'src/shared/ui/icons.generated.ts')

/** Recoge los `icon: 'nombre'` de los archivos de contenido. */
function collectIconNames() {
  const names = new Set()

  for (const file of readdirSync(CONTENT).filter((name) => name.endsWith('.ts'))) {
    const source = readFileSync(resolve(CONTENT, file), 'utf8')
    for (const [, name] of source.matchAll(/\bicon:\s*'([a-z0-9-]+)'/g)) {
      names.add(name)
    }
  }

  return [...names].sort()
}

/** devicon agrupa por familia: 'nodejs-plain' vive en icons/nodejs/. */
function iconPath(name) {
  const family = name.split('-')[0]
  return resolve(DEVICON, family, `${name}.svg`)
}

/** Extrae viewBox y contenido interno, sin la envoltura <svg>. */
function parseSvg(source, name) {
  const openTag = source.match(/<svg\b[^>]*>/i)
  if (!openTag) throw new Error(`${name}: no se encontró la etiqueta <svg>`)

  const viewBox = openTag[0].match(/viewBox="([^"]+)"/i)?.[1]
  if (!viewBox) throw new Error(`${name}: el SVG no declara viewBox`)

  const body = source
    .slice(source.indexOf(openTag[0]) + openTag[0].length, source.lastIndexOf('</svg>'))
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return { viewBox, body }
}

const names = collectIconNames()
const icons = {}
const missing = []

for (const name of names) {
  try {
    icons[name] = parseSvg(readFileSync(iconPath(name), 'utf8'), name)
  } catch {
    missing.push(name)
  }
}

if (missing.length > 0) {
  console.error(`\nNo se encontraron estos iconos en devicon:\n  ${missing.join('\n  ')}\n`)
  process.exit(1)
}

const entries = Object.entries(icons)

const file = `// GENERADO POR scripts/generate-icons.mjs — NO EDITAR A MANO.
// Regenerar con: pnpm icons

export type IconName =
${entries.map(([name]) => `  | '${name}'`).join('\n')}

export type IconData = { viewBox: string; body: string }

export const ICONS: Record<IconName, IconData> = {
${entries
  .map(([name, { viewBox, body }]) => `  '${name}': ${JSON.stringify({ viewBox, body })},`)
  .join('\n')}
}
`

writeFileSync(OUTPUT, file, 'utf8')

const bytes = entries.reduce((total, [, icon]) => total + icon.body.length, 0)
console.log(`${entries.length} iconos → ${(bytes / 1024).toFixed(1)} KB  (${OUTPUT})`)
