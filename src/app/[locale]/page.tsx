import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getExperience, getProfile, getProjects, getSkillCategories } from '@/content'
import { LOCALES, type Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'

/*
 * Pagina de verificacion de la Fase 1.
 *
 * No es diseño: es la prueba de que la capa de contenido y el i18n funcionan de
 * punta a punta. Lee del port, resuelve al idioma activo y muestra lo que
 * encontro. Las secciones reales llegan en la Fase 3 y esto desaparece.
 */
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations()
  const profile = getProfile(locale)
  const skills = getSkillCategories(locale)
  const projects = getProjects(locale)
  const experience = getExperience(locale)

  const skillCount = skills.reduce((total, category) => total + category.items.length, 0)
  const current = experience.find((item) => item.isCurrent)

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between gap-4">
        <span className="text-xl font-black tracking-widest">{profile.brand}</span>
        <nav className="flex gap-3 text-sm">
          {LOCALES.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className={l === locale ? 'font-bold underline' : 'text-slate-500'}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <div>
        <h1 className="text-3xl font-black">
          {profile.displayName.first} {profile.displayName.last}
        </h1>
        <p className="text-slate-400">{profile.role}</p>
        <p className="text-sm text-slate-500">{profile.location}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <dt className="text-slate-500">{t('nav.skills')}</dt>
        <dd>
          {skillCount} / {skills.length}
        </dd>

        <dt className="text-slate-500">{t('nav.projects')}</dt>
        <dd>{projects.length}</dd>

        <dt className="text-slate-500">{t('nav.experience')}</dt>
        <dd>{experience.length}</dd>

        <dt className="text-slate-500">{t('experience.current')}</dt>
        <dd>{current ? current.company : '—'}</dd>
      </dl>

      <p className="text-xs text-slate-600">Fase 1 — contenido e i18n</p>
    </main>
  )
}
