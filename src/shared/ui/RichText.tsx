import { Fragment } from 'react'
import { cn } from '@/shared/lib/cn'

const EMPHASIS = /(\*\*[^*]+\*\*)/g

/**
 * Renderiza el enfasis ligero de los textos de contenido.
 *
 * El contenido guarda `**asi**` en vez de `<strong>asi</strong>`. La diferencia
 * importa: guardar HTML obligaria a renderizar con `dangerouslySetInnerHTML`,
 * y a partir de ahi cualquier texto que entre a la capa de contenido —hoy los
 * escribe una persona, mañana podria traerlos un CMS— seria un vector de
 * inyeccion. Aqui el dato sigue siendo texto plano y React lo escapa como a
 * cualquier otro.
 */
export function RichText({
  children,
  className,
  emphasisClassName = 'text-purple',
}: {
  children: string
  className?: string
  emphasisClassName?: string
}) {
  const parts = children.split(EMPHASIS)

  return (
    <span className={cn(className)}>
      {parts.map((part, index) => {
        const match = part.startsWith('**') && part.endsWith('**') && part.length > 4

        return match ? (
          <strong key={index} className={cn('font-semibold', emphasisClassName)}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      })}
    </span>
  )
}
