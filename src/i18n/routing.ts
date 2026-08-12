import { defineRouting } from 'next-intl/routing'
import { DEFAULT_LOCALE, LOCALES } from './config'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,

  /*
   * 'always' mantiene el prefijo de idioma en todas las rutas, incluido el
   * idioma por defecto: /es y /en, nunca / a secas.
   *
   * Con 'as-needed' el espanol viviria en / y el ingles en /en, lo que deja
   * dos URLs para el mismo contenido en espanol (/ y /es) y obliga a
   * canonicalizar a mano. Un prefijo explicito hace que hreflang, sitemap y
   * canonical sean simetricos y sin casos especiales.
   */
  localePrefix: 'always',
})
