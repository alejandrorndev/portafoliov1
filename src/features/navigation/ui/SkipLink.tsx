import { useTranslations } from 'next-intl'

/**
 * Enlace de salto al contenido.
 *
 * Invisible hasta que recibe foco. Sin el, quien navega con teclado tiene que
 * tabular por toda la cabecera —logo, cinco enlaces, selector de idioma— en
 * cada carga de pagina antes de llegar al contenido.
 */
export function SkipLink() {
  const t = useTranslations()

  return (
    <a
      href="#main"
      className="bg-purple sr-only rounded-md px-4 py-2 text-sm font-semibold text-black focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]"
    >
      {t('a11y.skipToContent')}
    </a>
  )
}
