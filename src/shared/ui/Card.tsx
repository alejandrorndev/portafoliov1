import { cn } from '@/shared/lib/cn'
import { ACCENT_BORDER_HOVER, ACCENT_GLOW_HOVER, type Accent } from './accent'

/**
 * Contenedor de cristal con borde y elevacion al pasar el cursor.
 *
 * Unifica `.skill-box` y `.p-card`. El color de acento se recibe como prop en
 * vez de deducirse de la posicion: en el original lo fijaban reglas
 * `:nth-child(2..4)`, de modo que reordenar las tarjetas cambiaba sus colores.
 */
export function Card({
  accent = 'purple',
  interactive = true,
  className,
  children,
  ...props
}: {
  accent?: Accent
  /** `false` para tarjetas que no reaccionan al cursor. */
  interactive?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface border-hairline rounded-2xl border backdrop-blur-md',
        'ease-brand transition-all duration-300',
        interactive && [
          'hover:-translate-y-1.5',
          ACCENT_BORDER_HOVER[accent],
          ACCENT_GLOW_HOVER[accent],
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
