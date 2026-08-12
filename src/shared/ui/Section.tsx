import { cn } from '@/shared/lib/cn'

/**
 * Envoltorio de seccion: espaciado, ancho maximo y semantica.
 *
 * `scroll-mt-20` es lo que evita que la cabecera fija tape el titulo al saltar
 * desde el menu — en el original el ancla dejaba el encabezado debajo de la
 * barra.
 *
 * `aria-labelledby` conecta la seccion con su `<h2>`, de modo que un lector de
 * pantalla puede listar las secciones por su nombre. El markup original usaba
 * `<section id="about">` sin nombre accesible alguno.
 */
export function Section({
  id,
  labelledBy,
  alt = false,
  className,
  children,
}: {
  id: string
  /** Id del `<h2>` que titula la seccion. */
  labelledBy: string
  /** Fondo alterno, como `.s-alt` en el original. */
  alt?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('scroll-mt-20 px-6 py-24 sm:px-8 sm:py-28', alt && 'surface-alt', className)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}
