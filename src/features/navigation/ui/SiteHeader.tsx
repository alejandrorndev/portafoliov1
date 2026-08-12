import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { GradientText } from '@/shared/ui'
import { NAV_SECTIONS } from '../model/sections'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileMenu } from './MobileMenu'
import { SkipLink } from './SkipLink'

/**
 * Cabecera del sitio.
 *
 * Es un componente de servidor: solo el menu movil y el selector de idioma
 * necesitan JavaScript en el cliente, y estan aislados en sus propios
 * componentes. Los enlaces de navegacion son anclas normales y funcionan
 * aunque el JS no llegue a cargar.
 *
 * El resaltado de la seccion activa al hacer scroll entra en la Fase 4.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)

  return (
    <header className="bg-bg/80 border-hairline sticky top-0 z-50 border-b backdrop-blur-2xl">
      <SkipLink />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <a href="#hero" className="font-display text-lg font-bold tracking-widest">
          <GradientText>{profile.brand}</GradientText>
        </a>

        <nav aria-label={t('a11y.mainNav')} className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_SECTIONS.map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className="text-muted hover:text-cyan text-xs tracking-widest uppercase transition-colors"
                >
                  {t(`nav.${section}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
