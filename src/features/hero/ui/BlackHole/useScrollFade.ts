'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { FADE_CUTOFF, fadeOpacity } from './fade'

/**
 * Desvanece la escena a medida que el hero sale de pantalla.
 *
 * La opacidad se escribe directamente en el DOM a traves de una ref, sin pasar
 * por el estado de React. Un re-render por cada evento de scroll es
 * exactamente lo que no puede ocurrir mientras hay 8.800 particulas
 * dibujandose detras.
 *
 * Lo unico que sí es estado es `visible`, un booleano que cambia dos veces en
 * toda la visita y que decide si el bucle de render sigue vivo.
 *
 * La medida se toma dentro de requestAnimationFrame: llamar a
 * getBoundingClientRect() directamente en el manejador de scroll fuerza al
 * navegador a recalcular el layout en mitad del scroll.
 */
export function useScrollFade(regionRef: RefObject<HTMLElement | null>) {
  const fadeRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const region = regionRef.current
    const fade = fadeRef.current
    if (!region || !fade) return

    let frame = 0

    const measure = () => {
      frame = 0
      const { top, height } = region.getBoundingClientRect()
      const opacity = fadeOpacity(top, height)

      fade.style.opacity = String(opacity)
      setVisible((previous) => {
        const next = opacity > FADE_CUTOFF
        return next === previous ? previous : next
      })
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [regionRef])

  return { fadeRef, visible }
}
