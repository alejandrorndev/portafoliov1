import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getExperience, getProfile, getProjects, getSkillCategories } from '@/content'
import { LOCALES, type Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import {
  ACCENTS,
  Button,
  Card,
  Chip,
  GradientText,
  RichText,
  SectionHeading,
  Tag,
} from '@/shared/ui'

/*
 * Muestrario del sistema de diseño (Fase 2).
 *
 * No es la landing: es la forma de ver cada primitivo con contenido real y
 * comprobar que los tokens portados se ven como el original. Lo reemplaza la
 * composicion de secciones en la Fase 3.
 */
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations()
  const profile = getProfile(locale)
  const skills = getSkillCategories(locale)
  const projects = getProjects(locale)
  const experience = getExperience(locale)

  const firstSkill = skills[0]
  const firstProject = projects[0]

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <header className="mb-20 flex items-center justify-between gap-4">
        <span className="font-display text-xl font-bold tracking-widest">
          <GradientText>{profile.brand}</GradientText>
        </span>
        <nav className="flex gap-4 text-sm">
          {LOCALES.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className={l === locale ? 'text-cyan font-bold' : 'text-muted hover:text-ink'}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <SectionHeading id="showcase" tag={t('sections.skills.tag')} title="Design" accent="System" />

      <div className="space-y-16">
        {/* Tipografia */}
        <section aria-label="Tipografía">
          <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">Tipografía</h3>
          <p className="font-display text-4xl font-bold">
            {profile.displayName.first} <GradientText>{profile.displayName.last}</GradientText>
          </p>
          <p className="text-muted mt-2">{profile.role}</p>
          <p className="mt-4 max-w-lg leading-relaxed">
            <RichText>{profile.summary}</RichText>
          </p>
        </section>

        {/* Botones */}
        <section aria-label="Botones">
          <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">Botones</h3>
          <div className="flex flex-wrap gap-3">
            <Button href="#showcase">{t('hero.viewProjects')}</Button>
            <Button href="https://github.com/alejandrorndev" variant="ghost">
              {t('hero.github')}
            </Button>
          </div>
        </section>

        {/* Acentos */}
        <section aria-label="Acentos">
          <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">
            Acentos · pasa el cursor
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACCENTS.map((accent) => (
              <Card key={accent} accent={accent} className="p-5">
                <p className="text-sm font-semibold capitalize">{accent}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Chips */}
        {firstSkill ? (
          <section aria-label="Chips">
            <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">
              Chips · {firstSkill.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {firstSkill.items.map((item) => (
                <Chip key={item.name} icon={item.icon}>
                  {item.name}
                </Chip>
              ))}
            </div>
          </section>
        ) : null}

        {/* Tarjeta de proyecto */}
        {firstProject ? (
          <section aria-label="Tarjeta">
            <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">Tarjeta</h3>
            <Card className="max-w-md overflow-hidden">
              <div
                aria-hidden="true"
                className="flex h-32 items-center justify-center text-4xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${firstProject.gradient[0]}, ${firstProject.gradient[1]})`,
                  opacity: 0.85,
                }}
              >
                {firstProject.icon}
              </div>
              <div className="p-5">
                <p className="text-purple text-xs tracking-widest uppercase">{firstProject.type}</p>
                <h4 className="font-display mt-1 text-lg font-bold">{firstProject.title}</h4>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {firstProject.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {firstProject.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        {/* Experiencia */}
        <section aria-label="Experiencia">
          <h3 className="text-muted mb-4 text-xs tracking-widest uppercase">Experiencia</h3>
          <ul className="space-y-3">
            {experience.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline gap-3">
                <span className="font-display font-bold">{item.company}</span>
                <span className="text-muted text-sm">
                  {item.period.start} — {item.period.end ?? t('experience.present')}
                </span>
                {item.isCurrent ? (
                  <span className="bg-cyan rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest text-black uppercase">
                    {t('experience.current')}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-muted mt-20 text-xs">Fase 2 — design system</p>
    </main>
  )
}
