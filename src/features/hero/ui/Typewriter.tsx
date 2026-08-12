'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/shared/hooks'

const TYPE_MS = 70
const DELETE_MS = 40
const HOLD_MS = 2200

/**
 * Rota los roles del hero escribiendo y borrando letra a letra.
 *
 * El texto va dentro de una region `aria-live="off"` con el rol completo
 * anunciado por separado: un lector de pantalla que siguiera el cambio letra a
 * letra leeria un galimatias continuo mientras el usuario intenta usar la
 * pagina.
 *
 * Con `prefers-reduced-motion` no hay rotacion: se muestra el primer rol fijo.
 * Un texto que se reescribe solo, sin parar, es exactamente lo que esa
 * preferencia pide evitar.
 */
export function Typewriter({ roles }: { roles: string[] }) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const current = roles[index] ?? ''

  useEffect(() => {
    if (reduced || roles.length === 0) return

    if (!deleting && length === current.length) {
      const hold = setTimeout(() => setDeleting(true), HOLD_MS)
      return () => clearTimeout(hold)
    }

    /*
     * Todo cambio de estado ocurre dentro del temporizador, nunca en el cuerpo
     * del efecto. Encadenar setState sincrono aqui provocaria renders en
     * cascada, y ademas el paso "termine de borrar → siguiente rol" quedaria
     * repartido entre dos renders en vez de resolverse en uno.
     */
    const tick = setTimeout(
      () => {
        if (!deleting) {
          setLength((previous) => previous + 1)
          return
        }

        if (length === 1) {
          setLength(0)
          setDeleting(false)
          setIndex((previous) => (previous + 1) % roles.length)
          return
        }

        setLength((previous) => previous - 1)
      },
      deleting ? DELETE_MS : TYPE_MS,
    )

    return () => clearTimeout(tick)
  }, [reduced, roles.length, current.length, length, deleting])

  if (reduced) {
    return <span>{roles[0]}</span>
  }

  return (
    <>
      {/* Lo que un lector de pantalla anuncia: el rol entero, ya formado. */}
      <span className="sr-only">{current}</span>

      <span aria-hidden="true">
        {current.slice(0, length)}
        <span className="bg-cyan animate-caret ml-0.5 inline-block h-[1.1em] w-0.5 align-text-bottom" />
      </span>
    </>
  )
}
