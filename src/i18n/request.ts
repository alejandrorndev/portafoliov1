import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Resuelve el idioma y sus mensajes de UI para cada peticion renderizada en
 * servidor. Lo consume el plugin de next-intl declarado en next.config.ts.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale

  // requestLocale viene del segmento [locale] de la URL, que es texto libre:
  // /fr o /..%2f llegan hasta aqui. Validar contra la lista evita intentar
  // cargar un archivo de mensajes arbitrario a partir de la entrada del
  // usuario.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
