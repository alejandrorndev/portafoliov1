import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { GradientText } from '@/shared/ui'
import { HeaderShell } from './HeaderShell'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { SkipLink } from './SkipLink'

/**
 * Cabecera del sitio.
 *
 * Componente de servidor. Solo tres piezas necesitan JavaScript —el compactado
 * al hacer scroll, el resaltado de la seccion activa y el menu movil— y cada
 * una esta aislada en su propio componente de cliente. Los enlaces son anclas
 * normales y funcionan aunque el JS no cargue.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const profile = getProfile(locale)

  return (
    <HeaderShell>
      <SkipLink />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <a href="#hero" className="font-display text-lg font-bold tracking-widest">
          <GradientText>{profile.brand}</GradientText>
        </a>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  )
}
