import { cn } from '@/shared/lib/cn'

export type ButtonVariant = 'fill' | 'ghost'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-7 py-3 ' +
  'text-xs font-bold tracking-widest uppercase ' +
  'ease-brand transition-all duration-200 ' +
  'hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  fill: 'from-purple to-cyan bg-gradient-to-br text-black hover:shadow-glow-purple',
  ghost:
    'border-purple/40 text-ink hover:border-purple hover:text-purple border hover:shadow-glow-purple',
}

/**
 * Clases del boton, para cuando hace falta pintar como boton algo que no puede
 * serlo — el `<Link>` de next-intl, por ejemplo.
 */
export function buttonStyles(variant: ButtonVariant = 'fill', className?: string): string {
  return cn(BASE, VARIANTS[variant], className)
}

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href)

type ButtonProps = {
  variant?: ButtonVariant
  /** Si se pasa, se renderiza un enlace en lugar de un boton. */
  href?: string
  /** Descarga el destino en lugar de abrirlo. Solo tiene efecto con `href`. */
  download?: boolean
  className?: string
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

/**
 * Boton o enlace con la apariencia de boton.
 *
 * A los enlaces externos les añade `rel="noopener noreferrer"`. El original
 * usaba `target="_blank"` a secas en los ocho enlaces salientes, lo que deja a
 * la pagina destino con acceso a `window.opener` y capacidad de redirigir la
 * pestaña de origen.
 */
export function Button({
  variant = 'fill',
  href,
  download,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = buttonStyles(variant, className)

  if (href) {
    const external = isExternal(href)

    return (
      <a
        href={href}
        className={classes}
        {...(download && { download: '' })}
        // Una descarga no debe abrirse en otra pestaña: dejaria una pestaña en
        // blanco tras completarse.
        {...(external && !download && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
