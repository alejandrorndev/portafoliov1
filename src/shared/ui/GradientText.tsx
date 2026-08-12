import { cn } from '@/shared/lib/cn'

/**
 * Texto relleno con el gradiente de marca.
 *
 * Encapsula el truco de `background-clip: text` que en el original aparecia
 * copiado en seis sitios distintos, incluido su fallback para modo de alto
 * contraste (ver la utilidad `text-gradient` en globals.css).
 */
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn('text-gradient', className)}>{children}</span>
}
