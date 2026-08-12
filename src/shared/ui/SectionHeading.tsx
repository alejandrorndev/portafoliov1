import { cn } from '@/shared/lib/cn'
import { GradientText } from './GradientText'

/**
 * Encabezado de seccion: etiqueta, titulo con la ultima palabra en gradiente,
 * y la linea corta debajo.
 *
 * En el original este bloque estaba copiado cinco veces con la misma estructura
 * de cuatro divs. Aqui es un componente, y ademas conecta el `id` con el
 * `aria-labelledby` de cada `<section>`, cosa que el markup original no hacia.
 */
export function SectionHeading({
  id,
  tag,
  title,
  accent,
  className,
}: {
  /** Debe coincidir con el `aria-labelledby` de la seccion que lo contiene. */
  id: string
  tag: string
  title: string
  /** Ultima palabra del titulo, pintada con el gradiente. */
  accent: string
  className?: string
}) {
  return (
    <div className={cn('mb-16 text-center', className)}>
      <p className="text-purple mb-3 text-xs tracking-[0.2em] uppercase">{tag}</p>

      <h2 id={id} className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
        {title} <GradientText>{accent}</GradientText>
      </h2>

      <div
        aria-hidden="true"
        className="from-purple to-cyan mx-auto mt-5 h-0.5 w-12 rounded-full bg-gradient-to-r"
      />
    </div>
  )
}
