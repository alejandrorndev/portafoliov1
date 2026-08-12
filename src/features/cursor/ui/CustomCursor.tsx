'use client'

import { useEffect, useRef } from 'react'
import { usePointerFine, usePrefersReducedMotion } from '@/shared/hooks'

/**
 * Cursor personalizado: un punto que sigue al raton y un anillo que lo alcanza
 * con retraso.
 *
 * Tres guardas que el original no tenia. Alli `cursor: none` era global y el
 * cursor se dibujaba siempre, de modo que en una tablet el usuario se quedaba
 * sin cursor y con un punto persiguiendo su ultimo toque:
 *
 *   1. Solo con (pointer: fine) — raton o trackpad.
 *   2. Nada con prefers-reduced-motion: es un elemento en movimiento perpetuo.
 *   3. `cursor: none` se aplica solo mientras este componente esta montado,
 *      via el atributo data-cursor en <html>.
 *
 * Las posiciones se escriben directamente en el DOM, sin pasar por el estado
 * de React: un re-render por cada mousemove a 120 Hz es justo lo que vuelve
 * lento un cursor que existe para sentirse rapido.
 */
export function CustomCursor() {
  const fine = usePointerFine()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.dataset.cursor = 'custom'

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let frame = 0

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
    }

    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null
      const interactive = target?.closest('a, button, [role="button"], input, textarea')
      ring.dataset.hover = interactive ? 'true' : undefined
      dot.dataset.hover = interactive ? 'true' : undefined
    }

    // El anillo se acerca un 9% por fotograma: da el retraso elastico sin
    // necesidad de una libreria de animacion.
    const follow = () => {
      ringX += (mouseX - ringX) * 0.09
      ringY += (mouseY - ringY) * 0.09
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      frame = requestAnimationFrame(follow)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    frame = requestAnimationFrame(follow)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(frame)
      delete document.documentElement.dataset.cursor
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden="true">
      <div
        ref={dotRef}
        className="bg-cyan data-[hover=true]:bg-purple pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] transition-[width,height,background-color] duration-150 data-[hover=true]:h-4 data-[hover=true]:w-4"
      />
      <div
        ref={ringRef}
        className="border-purple/50 ease-brand data-[hover=true]:border-purple/70 pointer-events-none fixed top-0 left-0 z-[9998] h-8 w-8 rounded-full border transition-[width,height,border-color] duration-250 data-[hover=true]:h-13 data-[hover=true]:w-13"
      />
    </div>
  )
}
