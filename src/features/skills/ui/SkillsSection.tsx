import { getTranslations } from 'next-intl/server'
import { getSkillCategories } from '@/content'
import type { Locale } from '@/i18n/config'
import { ACCENT_TEXT, Card, Chip, Reveal, Section, SectionHeading } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

export async function SkillsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const categories = getSkillCategories(locale)

  return (
    <Section id="skills" labelledBy="skills-heading">
      <Reveal>
        <SectionHeading
          id="skills-heading"
          tag={t('sections.skills.tag')}
          title={t('sections.skills.title')}
          accent={t('sections.skills.accent')}
        />
      </Reveal>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          // El escalonado usa el indice del array, no :nth-child: si se
          // reordenan las categorias, el retardo viaja con cada una.
          <Reveal as="li" key={category.id} delay={index * 90}>
            {/*
              Cada tarjeta lleva su acento como dato. En el original salia de
              :nth-child(), asi que reordenar las categorias las despintaba.
            */}
            <Card accent={category.accent} className="h-full p-6">
              <h3
                className={cn(
                  'flex items-center gap-2.5 text-[0.7rem] tracking-[0.2em] uppercase',
                  ACCENT_TEXT[category.accent],
                )}
              >
                <span aria-hidden="true" className="h-px w-4 bg-current" />
                {category.title}
              </h3>

              <ul className="mt-5 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <li key={item.name}>
                    <Chip icon={item.icon}>{item.name}</Chip>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
