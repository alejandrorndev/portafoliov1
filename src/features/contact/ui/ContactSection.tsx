import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { DevIcon, GradientText, Section, SectionHeading } from '@/shared/ui'

/**
 * Seccion de contacto.
 *
 * El formulario funcional entra en la Fase 6, junto con la descarga del CV y
 * el aviso de privacidad. Hasta entonces el canal es el correo directo, igual
 * que en el original.
 */
export async function ContactSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)

  return (
    <Section id="contact" labelledBy="contact-heading" alt>
      <SectionHeading
        id="contact-heading"
        tag={t('sections.contact.tag')}
        title={t('sections.contact.title')}
        accent={t('sections.contact.accent')}
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted leading-loose">{t('contact.intro')}</p>

        <a
          href={`mailto:${profile.email}`}
          className="font-display mt-10 inline-block text-xl font-bold break-all transition-[filter] hover:drop-shadow-[0_0_12px_rgb(139_92_246/0.6)] sm:text-3xl"
        >
          <GradientText>{profile.email}</GradientText>
        </a>

        <ul className="mt-12 flex flex-wrap justify-center gap-3">
          {profile.socials.map((social) => {
            const external = social.href.startsWith('http')

            return (
              <li key={social.id}>
                <a
                  href={social.href}
                  {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="bg-surface border-hairline hover:border-purple hover:text-purple hover:shadow-glow-purple ease-brand flex items-center gap-2.5 rounded-xl border px-6 py-3 text-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
                >
                  {social.icon ? <DevIcon name={social.icon} className="text-lg" /> : null}
                  {social.label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
