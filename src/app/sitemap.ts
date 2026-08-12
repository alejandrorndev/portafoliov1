import type { MetadataRoute } from 'next'
import { LOCALES } from '@/i18n/config'
import { absoluteUrl } from '@/shared/lib/site-url'

/**
 * Sitemap con las dos versiones de idioma de cada página.
 *
 * `alternates.languages` es lo que le dice al buscador que /es y /en son la
 * misma página traducida, no dos páginas distintas compitiendo entre sí. Es el
 * mismo hreflang de la metadata, declarado tambien aqui porque son dos canales
 * independientes y Google usa ambos.
 *
 * La página de privacidad se omite a proposito: lleva `noindex`, asi que
 * incluirla seria pedirle a Google que rastree algo que ya le dijimos que no
 * indexe.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, absoluteUrl(`/${locale}`)]))

  return LOCALES.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages },
  }))
}
