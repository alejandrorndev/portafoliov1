'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/shared/hooks'
import { createPlum } from './plum'
import { useScrollFade } from './useScrollFade'

/** Morado de marca a baja opacidad: las ramas acompañan, no compiten con el texto. */
const STROKE = 'rgb(139 92 246 / 0.3)'
/** El original crece a ~40 tandas por segundo; mas rapido pierde el aire organico. */
const TICK_MS = 1000 / 40
/** En pantallas 3x el canvas pesaria el doble sin diferencia visible en un trazo de 1px. */
const MAX_DPR = 2
/** Tope para dibujar el arbol de una vez: el crecimiento termina solo, pero mejor no fiarse. */
const MAX_TICKS = 5000
/*
 * Mascara: atenua solo el centro. La del original (`circle, transparent,
 * black`) era un degradado lineal hasta la esquina mas lejana, asi que ya en
 * el borde superior ocultaba ~50% de cada rama y a medio camino del centro
 * ~75%: las ramas llegaban lejos pero se veian cortas. Con la elipse —que
 * sigue la proporcion de la pantalla— todo lo que esta fuera del 55% central
 * se ve entero, y solo el centro, donde va el titular, queda tenue.
 */
const MASK = 'radial-gradient(ellipse at center, transparent 5%, black 55%)'

/**
 * Fondo del hero: ramas finas que crecen desde los bordes y se detienen solas.
 *
 * Sustituye a la escena 3D del agujero negro. A diferencia de aquella, no es
 * un bucle infinito: en unos segundos el arbol termina, el canvas queda quieto
 * y el fondo deja de costar nada. Es un canvas 2D de pocas lineas, sin
 * dependencias.
 *
 * - `prefers-reduced-motion`: el arbol se dibuja completo de una vez.
 * - Se pausa mientras el hero esta fuera de pantalla y retoma al volver.
 * - Se redibuja solo si cambia el ANCHO. En movil la barra de direcciones
 *   cambia el alto al hacer scroll; redibujar ahi borraria las ramas una y
 *   otra vez. El contenedor mide `lvh` (el viewport grande) para que ese
 *   cambio de alto nunca deje una franja sin dibujar.
 */
export function PlumBackground() {
  const reducedMotion = usePrefersReducedMotion()
  const regionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { fadeRef, visible } = useScrollFade(regionRef)

  // Leido desde el bucle sin reiniciar el dibujo cada vez que cambia.
  const visibleRef = useRef(visible)
  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let frame = 0
    let width = 0

    const start = () => {
      cancelAnimationFrame(frame)

      const rect = canvas.getBoundingClientRect()
      width = rect.width
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)

      // Cambiar el tamaño del canvas reinicia su contexto: estilo y escala se
      // fijan despues.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineWidth = 1
      ctx.strokeStyle = STROKE

      const plum = createPlum({
        width: rect.width,
        height: rect.height,
        draw: (x1, y1, x2, y2) => {
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        },
      })

      if (reducedMotion) {
        for (let i = 0; i < MAX_TICKS && plum.tick(); i++);
        return
      }

      let last = 0
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop)
        if (!visibleRef.current || now - last < TICK_MS) return
        last = now
        if (!plum.tick()) cancelAnimationFrame(frame)
      }
      frame = requestAnimationFrame(loop)
    }

    start()

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (canvas.getBoundingClientRect().width !== width) start()
      }, 200)
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [reducedMotion])

  return (
    <div ref={regionRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        ref={fadeRef}
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh print:hidden"
        style={{ maskImage: MASK, WebkitMaskImage: MASK }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  )
}
