'use client'

import { useEffect, useState } from 'react'
import { useInView, usePrefersReducedMotion } from '@/shared/hooks'

const DURATION_MS = 1600

/** Desacelera al final, como el `power2.out` del original. */
const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * Cuenta desde cero hasta el valor al entrar en viewport.
 *
 * El numero final se renderiza en servidor dentro del HTML: la animacion solo
 * lo sustituye una vez que hay JavaScript. Asi el dato es correcto para un
 * rastreador, para un lector de pantalla y para quien tenga el JS caido — en
 * el original el HTML decia "0+" y solo GSAP lo convertia en el valor real.
 */
export function StatCounter({ value, suffix }: { value: number; suffix: string }) {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLSpanElement>({ rootMargin: '0px 0px -12% 0px' })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (reduced || !inView) return

    let frame = 0
    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      setDisplay(Math.round(easeOut(progress) * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, value])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}
