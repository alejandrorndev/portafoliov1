'use client'

import { cn } from '@/shared/lib/cn'
import { useInView } from '@/shared/hooks'

export type RevealDirection = 'up' | 'left' | 'right' | 'scale'

/**
 * Revela su contenido al entrar en el viewport.
 *
 * Sustituye a `.rv`, `.rv-l` y `.rv-r` del original, que dependian de GSAP +
 * ScrollTrigger. Aqui el estado oculto lo pone CSS bajo `[data-motion='on']` y
 * este componente solo alterna `data-visible`: la transicion la ejecuta el
 * compositor del navegador, sin JavaScript por fotograma.
 *
 * Sin JS, sin IntersectionObserver o con `prefers-reduced-motion`, el atributo
 * `data-motion` nunca aparece: no hay estado oculto que revelar y el contenido
 * se ve tal cual, sin que este componente tenga que enterarse.
 */
export function Reveal({
  as = 'div',
  direction = 'up',
  delay = 0,
  className,
  children,
}: {
  as?: 'div' | 'li' | 'section' | 'p' | 'span'
  direction?: RevealDirection
  /** Retardo en milisegundos, para escalonar hermanos. */
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const { ref, inView } = useInView<HTMLDivElement>()

  // TypeScript intersecta las props de todas las etiquetas posibles y el ref
  // deja de encajar con ninguna. Se comprueba contra 'div' —solo se le pasan
  // atributos HTML genericos, validos en cualquiera de las etiquetas
  // permitidas— y en ejecucion se renderiza la que llego por `as`.
  const Tag = as as 'div'

  return (
    <Tag
      ref={ref}
      data-reveal={direction}
      data-visible={inView ? 'true' : undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  )
}
