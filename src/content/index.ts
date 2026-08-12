import type { Locale } from '@/i18n/config'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'
import { experienceSchema, profileSchema, projectsSchema, skillCategoriesSchema } from './schemas'
import { skillCategories } from './skills'
import type { ExperienceItem, Localized, Profile, Project, RichText, SkillCategory } from './types'

export type { Accent, RichText, SkillItem, SocialLink, Stat } from './types'

/*
 * ---------------------------------------------------------------------------
 * El unico contrato publico de la capa de contenido.
 * ---------------------------------------------------------------------------
 * Los componentes llaman a estas funciones y reciben texto plano ya resuelto
 * al idioma activo. Nunca ven `Localized<T>`, ni saben que los datos vienen de
 * archivos .ts: podrian venir de un CMS, de una API o de una base de datos y
 * ni una linea de UI cambiaria.
 *
 * ESLint impide importar '@/content/projects' y compania desde fuera de esta
 * carpeta, asi que esa promesa no depende de que alguien la recuerde.
 * ---------------------------------------------------------------------------
 */

/** Colapsa un valor traducido al idioma pedido. */
const t = <T>(value: Localized<T>, locale: Locale): T => value[locale]

// --- Formas ya resueltas a un idioma -----------------------------------------

export type ResolvedProfile = Omit<
  Profile,
  'location' | 'headline' | 'role' | 'summary' | 'bio' | 'typewriterRoles' | 'cv'
> & {
  location: string
  headline: string
  role: string
  summary: RichText
  bio: RichText[]
  typewriterRoles: string[]
  /** `undefined` mientras no exista el PDF; la vista omite el botón. */
  cv: string | undefined
}

export type ResolvedSkillCategory = Omit<SkillCategory, 'title'> & { title: string }

export type ResolvedProject = Omit<Project, 'type' | 'title' | 'description'> & {
  type: string
  title: string
  description: string
}

export type ResolvedExperienceItem = Omit<ExperienceItem, 'role' | 'description'> & {
  role: string
  description: string
  /** Derivado de `period.end === null`, no un campo que se pueda desincronizar. */
  isCurrent: boolean
}

// --- Validacion ---------------------------------------------------------------

/*
 * Se ejecuta al importar este modulo, y como el import ocurre durante el build,
 * un dato invalido tumba el build en vez de la pagina en produccion.
 */
function assertValid<T>(
  label: string,
  schema: {
    safeParse: (data: unknown) => {
      success: boolean
      error?: { issues: readonly { path: PropertyKey[]; message: string }[] }
    }
  },
  data: T,
): T {
  const result = schema.safeParse(data)
  if (!result.success && result.error) {
    const problems = result.error.issues
      .map((issue) => `  · ${issue.path.join('.') || '(raíz)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Contenido inválido en "${label}":\n${problems}`)
  }
  return data
}

const validatedProfile = assertValid('profile', profileSchema, profile)
const validatedSkills = assertValid('skills', skillCategoriesSchema, skillCategories)
const validatedProjects = assertValid('projects', projectsSchema, projects)
const validatedExperience = assertValid('experience', experienceSchema, experience)

// --- API publica ---------------------------------------------------------------

export function getProfile(locale: Locale): ResolvedProfile {
  const p = validatedProfile
  return {
    ...p,
    location: t(p.location, locale),
    headline: t(p.headline, locale),
    role: t(p.role, locale),
    summary: t(p.summary, locale),
    bio: p.bio.map((paragraph) => t(paragraph, locale)),
    typewriterRoles: p.typewriterRoles.map((role) => t(role, locale)),
    cv: p.cv ? t(p.cv, locale) : undefined,
  }
}

export function getSkillCategories(locale: Locale): ResolvedSkillCategory[] {
  return validatedSkills.map((category) => ({
    ...category,
    title: t(category.title, locale),
  }))
}

export function getProjects(locale: Locale): ResolvedProject[] {
  return validatedProjects.map((project) => ({
    ...project,
    type: t(project.type, locale),
    title: t(project.title, locale),
    description: t(project.description, locale),
  }))
}

export function getExperience(locale: Locale): ResolvedExperienceItem[] {
  return validatedExperience.map((item) => ({
    ...item,
    role: t(item.role, locale),
    description: t(item.description, locale),
    isCurrent: item.period.end === null,
  }))
}
