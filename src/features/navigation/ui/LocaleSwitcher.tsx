'use client'

import { useTranslations } from 'next-intl'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

/**
 * Cambio de idioma.
 *
 * `usePathname` de next-intl devuelve la ruta SIN el prefijo de idioma, asi
 * que el enlace conserva la seccion en la que esta el usuario en lugar de
 * devolverlo a la portada.
 *
 * Se usan enlaces reales y no un `<select>` con onChange: asi funcionan con
 * clic derecho, se pueden abrir en otra pestaña, y los rastreadores ven las
 * dos versiones del sitio enlazadas entre si.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const t = useTranslations()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('localeSwitcher.label')}>
      {LOCALES.map((locale) => {
        const isCurrent = locale === current

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            aria-current={isCurrent ? 'true' : undefined}
            className={cn(
              'rounded px-2 py-1 text-xs font-semibold tracking-widest uppercase transition-colors',
              isCurrent ? 'text-cyan' : 'text-muted hover:text-ink',
            )}
          >
            <span className="sr-only">{LOCALE_LABELS[locale]}</span>
            <span aria-hidden="true">{locale}</span>
          </Link>
        )
      })}
    </div>
  )
}
