import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { RichText, Section, SectionHeading } from '@/shared/ui'
import { AvatarOrbit } from './AvatarOrbit'

export async function AboutSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)

  return (
    <Section id="about" labelledBy="about-heading" alt>
      <SectionHeading
        id="about-heading"
        tag={t('sections.about.tag')}
        title={t('sections.about.title')}
        accent={t('sections.about.accent')}
      />

      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <AvatarOrbit />

        <div className="text-center lg:text-left">
          <h3 className="font-display text-2xl font-bold">{profile.fullName}</h3>
          <p className="text-purple mt-1 text-xs tracking-[0.2em] uppercase">{profile.role}</p>

          <div className="mt-7 space-y-4">
            {profile.bio.map((paragraph, index) => (
              <p key={index} className="text-muted leading-loose">
                <RichText emphasisClassName="text-cyan">{paragraph}</RichText>
              </p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {profile.stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-surface border-hairline hover:border-purple hover:shadow-glow-purple ease-brand rounded-2xl border p-4 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
              >
                {/*
                  dd antes que dt en el DOM invertiria el orden de lectura, asi
                  que el numero se marca como dd y va debajo por CSS.
                */}
                <dt className="sr-only">{t(`stats.${stat.labelKey}`)}</dt>
                <dd>
                  <span className="text-gradient font-display block text-3xl font-bold">
                    {stat.value}
                    {stat.suffix}
                  </span>
                  <span aria-hidden="true" className="text-muted mt-1 block text-xs tracking-wide">
                    {t(`stats.${stat.labelKey}`)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
