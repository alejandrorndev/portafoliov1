import { getTranslations } from 'next-intl/server'
import { getExperience } from '@/content'
import type { Locale } from '@/i18n/config'
import { ACCENT_BG, ACCENT_TEXT, Section, SectionHeading, Tag } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

export async function ExperienceSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const items = getExperience(locale)

  return (
    <Section id="experience" labelledBy="experience-heading">
      <SectionHeading
        id="experience-heading"
        tag={t('sections.experience.tag')}
        title={t('sections.experience.title')}
        accent={t('sections.experience.accent')}
      />

      <ol className="relative mx-auto max-w-3xl">
        {/* La linea de la cronologia es decorativa; el orden lo da el <ol>. */}
        <span
          aria-hidden="true"
          className="via-cyan from-purple to-pink absolute inset-y-0 left-0 w-px bg-gradient-to-b"
        />

        {items.map((item) => (
          <li key={item.id} className="relative pb-12 pl-12 last:pb-0">
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]',
                ACCENT_BG[item.accent],
              )}
            />

            {item.isCurrent ? (
              <p className="bg-cyan mb-2 inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.15em] text-black uppercase">
                {t('experience.current')}
              </p>
            ) : null}

            <p className={cn('text-xs tracking-[0.2em] uppercase', ACCENT_TEXT[item.accent])}>
              {item.period.start} — {item.period.end ?? t('experience.present')}
            </p>

            <h3 className="font-display mt-1.5 text-xl font-bold">{item.company}</h3>
            <p className="text-muted mt-0.5 text-sm tracking-wide">{item.role}</p>
            <p className="text-muted mt-3.5 text-sm leading-loose">{item.description}</p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {item.stack.map((tech) => (
                <li key={tech}>
                  <Tag>{tech}</Tag>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
