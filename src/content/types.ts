import type { Locale } from '@/i18n/config'
// Import directo del modulo de acentos, no del barrel de shared/ui: ese barrel
// arrastra componentes de React, y este archivo lo cargan los datos durante el
// build. No hay razon para meter React en ese grafo.
import type { Accent } from '@/shared/ui/accent'
import type { IconName } from '@/shared/ui/icons.generated'

/**
 * Un valor que existe en todos los idiomas.
 *
 * Es el detalle que evita el error mas probable de un sitio bilingue: agregar
 * un proyecto en espanol y olvidar el ingles. Como es un `Record<Locale, T>`
 * completo, omitir un idioma no compila.
 */
export type Localized<T> = Record<Locale, T>

/**
 * Color de acento de un elemento.
 *
 * En el HTML original esto se resolvia con `:nth-child(2) { color: cyan }`, asi
 * que reordenar un array desbarataba la paleta. Como dato, el color viaja con
 * el contenido y el orden deja de importar.
 *
 * La definicion vive en el sistema de diseño: es vocabulario visual, no
 * contenido. Aqui solo se reexporta para que los archivos de datos no tengan
 * que conocer esa ruta.
 */
export { ACCENTS, type Accent } from '@/shared/ui/accent'

/**
 * Texto con enfasis ligero.
 *
 * Los parrafos del original marcaban palabras con `<strong>`. Guardar HTML en
 * los datos ataria el contenido a la vista y abriria la puerta a inyeccion al
 * renderizar; en su lugar se usa `**doble asterisco**` y un componente lo
 * convierte en `<strong>` al pintar. El dato sigue siendo texto plano.
 *
 * @example 'sistemas que no solo funcionan, sino que **escalan**'
 */
export type RichText = string

export type SocialLink = {
  id: string
  label: string
  href: string
  /** Icono vendorizado, o `null` si no lleva. */
  icon: IconName | null
}

export type Stat = {
  id: string
  value: number
  suffix: string
  /** Clave dentro del namespace `stats` de los mensajes de UI. */
  labelKey: string
}

export type Profile = {
  fullName: string
  displayName: { first: string; last: string }
  brand: string
  email: string
  location: Localized<string>
  available: boolean
  headline: Localized<string>
  role: Localized<string>
  /** Parrafo del hero. */
  summary: Localized<RichText>
  /** Parrafos de la seccion "Sobre mi". */
  bio: Localized<RichText>[]
  /** Roles que rota el typewriter del hero. */
  typewriterRoles: Localized<string>[]
  socials: SocialLink[]
  stats: Stat[]
  /**
   * Ruta al CV en PDF, una por idioma, relativa a `public/`.
   *
   * Opcional a proposito: mientras no exista, la seccion de contacto
   * simplemente no muestra el boton de descarga. Es preferible a un enlace que
   * lleva a un 404 — un reclutador que pulsa "Descargar CV" y recibe un error
   * no vuelve a intentarlo.
   */
  cv?: Localized<string>
}

export type SkillItem = {
  name: string
  /**
   * Icono vendorizado por scripts/generate-icons.mjs.
   * El tipo se genera a partir de los SVG disponibles, asi que un nombre mal
   * escrito no compila.
   */
  icon: IconName
}

export type SkillCategory = {
  id: string
  title: Localized<string>
  accent: Accent
  items: SkillItem[]
}

export type Project = {
  id: string
  /** Etiqueta de categoria, p.ej. "API REST · Backend". */
  type: Localized<string>
  title: Localized<string>
  description: Localized<string>
  /** Nombres de tecnologias: no se traducen. */
  tags: string[]
  /** Emoji que representa al proyecto. */
  icon: string
  /** Gradiente del preview: [desde, hasta] en hexadecimal. */
  gradient: readonly [string, string]
  links: {
    demo?: string
    github?: string
  }
}

export type ExperienceItem = {
  id: string
  /** Etiqueta del periodo. `null` en `end` significa "en curso". */
  period: { start: string; end: string | null }
  company: string
  role: Localized<string>
  description: Localized<string>
  /** Tecnologias: no se traducen. */
  stack: string[]
  accent: Accent
}
