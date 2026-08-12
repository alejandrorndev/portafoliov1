'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Avisa cuando un elemento entra en el viewport. Una sola vez.
 *
 * `once` no es una comodidad: un reveal que se repite al subir y bajar
 * convierte el scroll en un parpadeo constante. El original ya usaba
 * `once: true` en ScrollTrigger.
 *
 * El observer se desconecta al disparar, asi que no quedan observadores vivos
 * por cada elemento revelado de la pagina.
 *
 * No lleva respaldo para navegadores sin IntersectionObserver: en ese caso el
 * script de motion-flag no marca `data-motion`, no existe estado oculto, y el
 * contenido se ve directamente. La comprobacion esta alli, una sola vez, en
 * lugar de repetida en cada elemento.
 */
export function useInView<T extends HTMLElement>(options?: {
  /** Margen extra para adelantar o retrasar el disparo. */
  rootMargin?: string
  threshold?: number
  /**
   * `true` (por defecto) dispara una vez y se desconecta: es lo que quieren
   * los reveals. `false` sigue informando de entradas y salidas, que es lo que
   * necesita la escena 3D para apagar su bucle de render al salir de pantalla.
   */
  once?: boolean
}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  const rootMargin = options?.rootMargin ?? '0px 0px -8% 0px'
  const threshold = options?.threshold ?? 0
  const once = options?.once ?? true

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}
