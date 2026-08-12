import type { ResolvedProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { absoluteUrl } from './site-url'

/**
 * Datos estructurados de tipo `Person` (schema.org).
 *
 * Es lo que permite a un buscador entender que esta pagina describe a una
 * persona concreta —con su cargo, su ubicacion y sus perfiles— en vez de tratar
 * el texto como prosa suelta. Es la diferencia entre aparecer como un
 * resultado mas y aparecer como una entidad reconocida al buscar tu nombre.
 *
 * `sameAs` es la parte que mas pesa: enlaza esta pagina con tus perfiles de
 * GitHub y LinkedIn, y asi el buscador puede confirmar que hablan de la misma
 * persona.
 */
export function buildPersonSchema(profile: ResolvedProfile, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    url: absoluteUrl(`/${locale}`),
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    description: profile.summary.replaceAll('**', ''),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Medellín',
      addressCountry: 'CO',
    },
    sameAs: profile.socials
      .filter((social) => social.href.startsWith('https://'))
      .map((social) => social.href),
  }
}
