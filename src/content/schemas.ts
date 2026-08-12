import { z } from 'zod'
import type { Locale } from '@/i18n/config'
import { ACCENTS } from './types'

/**
 * Envuelve un esquema para exigirlo en todos los idiomas.
 *
 * El `satisfies Record<Locale, T>` es la parte que importa: si manana se
 * agrega 'pt' a LOCALES, esta linea deja de compilar hasta que se agregue la
 * clave. Sin el, un idioma nuevo pasaria la validacion con los objetos a
 * medias.
 */
const localized = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ es: inner, en: inner } satisfies Record<Locale, T>)

const nonEmpty = z.string().trim().min(1)
const accent = z.enum(ACCENTS)

/** Los ids se usan como key de React y como ancla de URL. */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Debe ser kebab-case en minúsculas')

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Debe ser un hexadecimal de 6 dígitos')

const httpsUrl = z.url().startsWith('https://', 'Debe usar https')

export const socialLinkSchema = z.object({
  id: slug,
  label: nonEmpty,
  href: z.string().min(1),
  icon: z.string().nullable(),
})

export const statSchema = z.object({
  id: slug,
  value: z.number().int().nonnegative(),
  suffix: z.string(),
  labelKey: nonEmpty,
})

export const profileSchema = z.object({
  fullName: nonEmpty,
  displayName: z.object({ first: nonEmpty, last: nonEmpty }),
  brand: nonEmpty,
  email: z.email(),
  location: localized(nonEmpty),
  available: z.boolean(),
  headline: localized(nonEmpty),
  role: localized(nonEmpty),
  summary: localized(nonEmpty),
  bio: z.array(localized(nonEmpty)).min(1),
  typewriterRoles: z.array(localized(nonEmpty)).min(1),
  socials: z.array(socialLinkSchema).min(1),
  stats: z.array(statSchema).min(1),
})

export const skillCategorySchema = z.object({
  id: slug,
  title: localized(nonEmpty),
  accent,
  items: z
    .array(
      z.object({
        name: nonEmpty,
        icon: nonEmpty,
      }),
    )
    .min(1),
})

export const projectSchema = z.object({
  id: slug,
  type: localized(nonEmpty),
  title: localized(nonEmpty),
  description: localized(nonEmpty),
  tags: z.array(nonEmpty).min(1),
  icon: nonEmpty,
  gradient: z.tuple([hexColor, hexColor]),
  links: z
    .object({
      demo: httpsUrl.optional(),
      github: httpsUrl.optional(),
    })
    // Una tarjeta de proyecto sin ningun enlace no le sirve a nadie: es
    // justo lo que un reclutador va a querer abrir.
    .refine((links) => Boolean(links.demo ?? links.github), {
      message: 'Un proyecto necesita al menos un enlace (demo o github)',
    }),
})

export const experienceItemSchema = z.object({
  id: slug,
  period: z.object({ start: nonEmpty, end: nonEmpty.nullable() }),
  company: nonEmpty,
  role: localized(nonEmpty),
  description: localized(nonEmpty),
  stack: z.array(nonEmpty).min(1),
  accent,
})

/** Ningun id puede repetirse: se usan como key de React. */
const uniqueIds = <T extends { id: string }>(items: T[], ctx: z.RefinementCtx) => {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      ctx.addIssue({ code: 'custom', message: `id duplicado: "${item.id}"` })
    }
    seen.add(item.id)
  }
}

export const skillCategoriesSchema = z.array(skillCategorySchema).min(1).superRefine(uniqueIds)
export const projectsSchema = z.array(projectSchema).min(1).superRefine(uniqueIds)
export const experienceSchema = z.array(experienceItemSchema).min(1).superRefine(uniqueIds)
