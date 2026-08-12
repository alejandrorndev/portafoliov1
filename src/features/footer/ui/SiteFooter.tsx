import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'

/*
 * El pie del original decia "Built with Three.js · GSAP · Vanilla JS". Se
 * actualiza al stack real; el credito de Three.js vuelve en la Fase 5, cuando
 * Three.js vuelva a estar.
 */
const STACK = 'Next.js · TypeScript · Tailwind'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)

  return (
    <footer className="border-hairline border-t px-6 py-7 sm:px-8">
      <div className="text-muted mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs">
        <p>
          {t('footer.credit', { name: profile.fullName })} · {t('footer.location')}
        </p>
        <p>{t('footer.builtWith', { stack: STACK })}</p>
      </div>
    </footer>
  )
}
