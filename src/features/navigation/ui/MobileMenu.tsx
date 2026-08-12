'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { NAV_SECTIONS } from '../model/sections'

/**
 * Menu de navegacion en movil.
 *
 * El original no tenia ninguno: por debajo de 900px hacia
 * `.nav-links { display: none }` y no ponia nada en su lugar, asi que en un
 * telefono no habia forma de saltar entre secciones.
 *
 * Se construye sobre `<dialog>` nativo en vez de un div con estado propio. El
 * navegador ya resuelve —y mejor de lo que se resolveria a mano— la trampa de
 * foco, el cierre con Escape, dejar inerte el fondo y devolver el foco al
 * boton al cerrar. Escribir todo eso a mano es la via habitual para que un
 * menu movil quede inaccesible sin que nadie lo note.
 */
export function MobileMenu() {
  const t = useTranslations()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      // El fondo no debe poder desplazarse mientras el menu esta abierto.
      document.body.style.overflow = 'hidden'
    } else if (dialog.open) {
      dialog.close()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t('a11y.openMenu')}
        className="text-muted hover:text-ink -mr-2 p-2 transition-colors md:hidden"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        // Escape dispara 'close' sin pasar por onClick: sin esto el estado de
        // React quedaria desincronizado del dialogo y el boton no volveria a
        // abrirlo.
        onClose={() => setOpen(false)}
        className="bg-bg/95 text-ink m-0 h-full max-h-none w-full max-w-none backdrop-blur-2xl backdrop:bg-black/60"
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('a11y.closeMenu')}
              className="text-muted hover:text-ink -mr-2 p-2 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          <nav aria-label={t('a11y.mainNav')} className="mt-8 flex flex-col gap-2">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => setOpen(false)}
                className="hover:text-cyan border-hairline border-b py-4 text-lg tracking-wide transition-colors"
              >
                {t(`nav.${section}`)}
              </a>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  )
}

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
