'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/shared/lib/cn'
import { NAV_SECTIONS, type NavSection } from '../model/sections'

/**
 * Enlaces de navegacion con resaltado de la seccion visible.
 *
 * Un solo IntersectionObserver vigila las seis secciones a la vez, con una
 * banda estrecha en mitad de la pantalla: asi la seccion "activa" es la que
 * el usuario esta mirando, no la que asoma por el borde.
 *
 * `aria-current="location"` es lo que hace que esto sirva de algo con lector
 * de pantalla; el original solo pintaba una clase CSS.
 */
export function NavLinks() {
  const t = useTranslations()
  const [active, setActive] = useState<NavSection | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    )

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.id as NavSection)
      },
      // Banda de un 20% centrada verticalmente.
      { rootMargin: '-40% 0px -40% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label={t('a11y.mainNav')}>
      <ul className="flex items-center gap-8">
        {NAV_SECTIONS.map((section) => {
          const isActive = active === section

          return (
            <li key={section}>
              <a
                href={`#${section}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'relative text-xs tracking-widest uppercase transition-colors',
                  'after:from-purple after:to-cyan after:ease-brand after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-gradient-to-r after:transition-[width] after:duration-300',
                  isActive
                    ? 'text-cyan after:w-full'
                    : 'text-muted hover:text-cyan after:w-0 hover:after:w-full',
                )}
              >
                {t(`nav.${section}`)}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
