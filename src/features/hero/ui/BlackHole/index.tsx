'use client'

import { useRef, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { usePrefersReducedMotion } from '@/shared/hooks'
import { NO_CAPABILITY, readCapability, subscribeToCapability } from './capability'
import { StaticBackdrop } from './StaticBackdrop'
import { useScrollFade } from './useScrollFade'

/*
 * Three.js pesa ~230 KB gzip junto con R3F. Con `dynamic` y `ssr: false` queda
 * en un chunk aparte que solo se descarga cuando se decide que la escena va a
 * dibujarse, asi que ni entra en el bundle inicial ni retrasa el texto del
 * hero —que es el candidato a LCP.
 */
const BlackHoleCanvas = dynamic(
  () => import('./BlackHoleCanvas').then((module) => module.BlackHoleCanvas),
  { ssr: false },
)

/**
 * Fondo del hero.
 *
 * La escena se ancla al viewport con `fixed`, de modo que el contenido pasa
 * por encima al hacer scroll —eso es lo que da la sensacion de parallax— y se
 * desvanece conforme el hero sale de pantalla. Cuando queda invisible, el
 * bucle de render se apaga.
 *
 * Esa pausa es la razon de desvanecer en lugar de dejarlo fijo todo el rato.
 * Un fondo a pagina completa nunca sale del viewport, asi que seguiria
 * dibujando 8.800 particulas con mezcla aditiva durante el ~85% de la visita,
 * detras de contenido que en su mayoria es opaco.
 *
 * z-index negativo: la escena queda por debajo de las secciones que vienen
 * despues, que tienen su propio fondo, pero por encima del degradado del
 * <body>.
 *
 * Degradacion en cascada — no se monta si:
 *
 *   1. `prefers-reduced-motion` — es movimiento continuo. Ademas asi Three.js
 *      ni se descarga.
 *   2. No hay WebGL — comprobado creando un contexto de verdad.
 *   3. Todavia no ha montado — en servidor no se puede saber lo anterior.
 *
 * El respaldo estatico se pinta SIEMPRE, debajo, y se desvanece con la escena.
 * El hero nunca esta vacio: ni durante la descarga, ni si falla, ni si el
 * dispositivo no puede con ella.
 */
export function BlackHole() {
  const reducedMotion = usePrefersReducedMotion()

  // La capacidad del dispositivo es estado externo que no cambia. Leerla con
  // useSyncExternalStore evita el render en cascada de medirla en un efecto, y
  // deja explicito que en servidor el valor es "no se sabe".
  const capability = useSyncExternalStore(
    subscribeToCapability,
    readCapability,
    () => NO_CAPABILITY,
  )

  // Ocupa el hero sin pintar nada: sirve de regla para medir cuanto queda de
  // hero en pantalla.
  const regionRef = useRef<HTMLDivElement>(null)
  const { fadeRef, visible } = useScrollFade(regionRef)

  const shouldRender = !reducedMotion && capability?.webgl === true

  return (
    <div ref={regionRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div ref={fadeRef} className="pointer-events-none fixed inset-0 -z-10">
        <StaticBackdrop />
        {shouldRender ? <BlackHoleCanvas quality={capability.quality} active={visible} /> : null}
      </div>
    </div>
  )
}
