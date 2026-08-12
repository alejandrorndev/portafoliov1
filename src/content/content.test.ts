import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/i18n/config'
import { getExperience, getProfile, getProjects, getSkillCategories } from './index'
import { experienceSchema, projectsSchema } from './schemas'

/*
 * La validacion Zod ya corre al importar '@/content': si algun dato fuera
 * invalido, este archivo ni siquiera cargaria. Estos tests cubren lo que un
 * esquema no puede ver por si solo — que la resolucion por idioma sea
 * correcta— y dejan probado que los esquemas efectivamente rechazan.
 */

describe('capa de contenido', () => {
  it('carga sin errores de validacion en todos los idiomas', () => {
    for (const locale of LOCALES) {
      expect(() => getProfile(locale)).not.toThrow()
      expect(() => getSkillCategories(locale)).not.toThrow()
      expect(() => getProjects(locale)).not.toThrow()
      expect(() => getExperience(locale)).not.toThrow()
    }
  })

  it('resuelve el texto al idioma pedido', () => {
    expect(getProfile('es').headline).toBe('Desarrollador de Software')
    expect(getProfile('en').headline).toBe('Software Developer')
  })

  it('entrega texto plano, nunca objetos Localized', () => {
    for (const locale of LOCALES) {
      for (const project of getProjects(locale)) {
        expect(typeof project.title).toBe('string')
        expect(typeof project.description).toBe('string')
        expect(typeof project.type).toBe('string')
      }
    }
  })

  it('devuelve el mismo numero de entradas en cada idioma', () => {
    const [first, ...rest] = LOCALES
    const reference = {
      projects: getProjects(first).length,
      skills: getSkillCategories(first).length,
      experience: getExperience(first).length,
    }

    for (const locale of rest) {
      expect(getProjects(locale)).toHaveLength(reference.projects)
      expect(getSkillCategories(locale)).toHaveLength(reference.skills)
      expect(getExperience(locale)).toHaveLength(reference.experience)
    }
  })

  it('no deja texto sin traducir entre idiomas', () => {
    // Detecta el copy-paste de "lo traduzco luego": una descripcion identica
    // en ambos idiomas casi siempre es un olvido, no una coincidencia.
    // Se excluyen titulos y nombres propios, que legitimamente no cambian.
    const untranslated = getProjects('es')
      .map((esProject, index) => ({ es: esProject, en: getProjects('en')[index]! }))
      .filter(({ es, en }) => es.description === en.description)
      .map(({ es }) => es.id)

    expect(untranslated).toEqual([])
  })

  it('marca como actual exactamente el empleo sin fecha de fin', () => {
    const current = getExperience('es').filter((item) => item.isCurrent)
    expect(current).toHaveLength(1)
    expect(current[0]?.company).toBe('Homepower Colombia S.A.S')
  })

  it('ordena la experiencia de mas reciente a mas antigua', () => {
    const starts = getExperience('es').map((item) => Number(item.period.start))
    expect(starts).toEqual([...starts].sort((a, b) => b - a))
  })
})

describe('los esquemas rechazan datos invalidos', () => {
  const validProject = {
    id: 'demo',
    type: { es: 'a', en: 'a' },
    title: { es: 'b', en: 'b' },
    description: { es: 'c', en: 'c' },
    tags: ['x'],
    icon: '⚡',
    gradient: ['#000000', '#ffffff'],
    links: { github: 'https://example.com' },
  }

  it('exige todos los idiomas', () => {
    const result = projectsSchema.safeParse([{ ...validProject, title: { en: 'solo inglés' } }])
    expect(result.success).toBe(false)
  })

  it('exige al menos un enlace', () => {
    const result = projectsSchema.safeParse([{ ...validProject, links: {} }])
    expect(result.success).toBe(false)
  })

  it('rechaza enlaces que no sean https', () => {
    const result = projectsSchema.safeParse([
      { ...validProject, links: { github: 'http://example.com' } },
    ])
    expect(result.success).toBe(false)
  })

  it('rechaza ids duplicados', () => {
    const result = projectsSchema.safeParse([validProject, validProject])
    expect(result.success).toBe(false)
  })

  it('rechaza ids que no sean kebab-case', () => {
    const result = projectsSchema.safeParse([{ ...validProject, id: 'Demo Project' }])
    expect(result.success).toBe(false)
  })

  it('rechaza un acento fuera de la paleta', () => {
    const result = experienceSchema.safeParse([
      {
        id: 'demo',
        period: { start: '2024', end: null },
        company: 'ACME',
        role: { es: 'a', en: 'a' },
        description: { es: 'b', en: 'b' },
        stack: ['x'],
        accent: 'turquesa',
      },
    ])
    expect(result.success).toBe(false)
  })
})
