import { describe, expect, it } from 'vitest'
import { getProfile, getSkillCategories } from '@/content'
import { ICONS } from './icons.generated'

/*
 * icons.generated.ts se produce con `pnpm icons` a partir de los nombres que
 * aparecen en src/content. Es un artefacto commiteado, o sea que puede quedar
 * desincronizado: basta agregar una tecnologia y no volver a ejecutar el
 * script. El sintoma seria un hueco silencioso donde deberia ir un icono.
 *
 * Estos tests convierten esa desincronizacion en un fallo de CI.
 */

const referenced = new Set<string>([
  ...getSkillCategories('es').flatMap((category) => category.items.map((item) => item.icon)),
  ...getProfile('es')
    .socials.map((social) => social.icon)
    .filter((icon): icon is NonNullable<typeof icon> => icon !== null),
])

describe('iconos vendorizados', () => {
  it('todo icono referenciado por el contenido esta generado', () => {
    const missing = [...referenced].filter((name) => !(name in ICONS))

    expect(missing, 'faltan iconos: ejecuta `pnpm icons`').toEqual([])
  })

  it('no se generan iconos que nadie usa', () => {
    const unused = Object.keys(ICONS).filter((name) => !referenced.has(name))

    expect(unused, 'iconos huérfanos: ejecuta `pnpm icons`').toEqual([])
  })

  it('cada icono trae viewBox y contenido', () => {
    for (const [name, icon] of Object.entries(ICONS)) {
      expect(icon.viewBox, `${name} sin viewBox`).toMatch(/^[\d.\s-]+$/)
      expect(icon.body.length, `${name} sin contenido`).toBeGreaterThan(0)
    }
  })

  it('el conjunto se mantiene por debajo del presupuesto de peso', () => {
    // La razon de existir de todo esto: la fuente de devicon pesa 1.46 MB.
    // Si este numero se dispara, alguien metio iconos con wordmark enormes.
    const kb = Object.values(ICONS).reduce((total, icon) => total + icon.body.length, 0) / 1024

    expect(kb).toBeLessThan(100)
  })
})
