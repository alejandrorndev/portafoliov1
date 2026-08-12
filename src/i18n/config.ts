/**
 * Fuente unica de verdad de los idiomas del sitio.
 *
 * Todo lo demas —routing, middleware, tipos de contenido, esquemas de
 * validacion, hreflang— se deriva de aqui. Agregar un idioma es agregarlo a
 * esta tupla; a partir de ahi el compilador va senalando cada lugar que falta
 * traducir en vez de dejar huecos silenciosos.
 */
export const LOCALES = ['es', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

/** Nombre de cada idioma en su propio idioma, para el selector. */
export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}
