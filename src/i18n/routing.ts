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

  /*
   * Rutas traducidas. La clave es la ruta interna —la que se usa en el codigo
   * y la que corresponde a la carpeta de app/—; el valor es lo que ve el
   * usuario en cada idioma.
   *
   * Sirve de algo: /en/privacidad en un sitio en ingles se lee como un
   * descuido, y ademas la palabra de la URL es una señal para los buscadores.
   */
  pathnames: {
    '/': '/',
    '/privacy': {
      es: '/privacidad',
      en: '/privacy',
    },
  },
})
