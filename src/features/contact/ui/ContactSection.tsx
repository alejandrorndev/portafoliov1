import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { Button, DevIcon, GradientText, Reveal, Section, SectionHeading } from '@/shared/ui'
import { ContactForm } from './ContactForm'

export async function ContactSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)

  return (
    <Section id="contact" labelledBy="contact-heading" alt>
      <Reveal>
        <SectionHeading
          id="contact-heading"
          tag={t('sections.contact.tag')}
          title={t('sections.contact.title')}
          accent={t('sections.contact.accent')}
        />
      </Reveal>

      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-muted leading-loose">{t('contact.intro')}</p>

        <ContactForm email={profile.email} />

        {/* El correo directo se mantiene: si el formulario falla, sigue
            habiendo una vía que no depende de nada. */}
        <a
          href={`mailto:${profile.email}`}
          className="font-display mt-12 inline-block text-lg font-bold break-all transition-[filter] hover:drop-shadow-[0_0_12px_rgb(139_92_246/0.6)] sm:text-2xl"
        >
          <GradientText>{profile.email}</GradientText>
        </a>

        {profile.cv ? (
          <div className="mt-8">
            {/* `download` fuerza la descarga en lugar de abrir el PDF en el
                visor del navegador, que en móvil suele ser incómodo. */}
            <Button href={profile.cv} variant="ghost" download>
              {t('contact.downloadCv')}
            </Button>
          </div>
        ) : null}

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
      </Reveal>
    </Section>
  )
}
