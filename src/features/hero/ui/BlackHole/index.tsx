'use client'

import { useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { useInView, usePrefersReducedMotion } from '@/shared/hooks'
import { NO_CAPABILITY, readCapability, subscribeToCapability } from './capability'
import { StaticBackdrop } from './StaticBackdrop'

/*
 * Three.js pesa ~150 KB gzip. Con `dynamic` y `ssr: false` queda en un chunk
 * aparte que solo se descarga cuando se decide que la escena va a dibujarse,
 * asi que ni entra en el bundle inicial ni retrasa el texto del hero —que es
 * el candidato a LCP.
 */
const BlackHoleCanvas = dynamic(
  () => import('./BlackHoleCanvas').then((module) => module.BlackHoleCanvas),
  { ssr: false },
)

/**
 * Fondo del hero, con degradacion en cascada.
 *
 * El respaldo estatico se pinta SIEMPRE, debajo. La escena 3D se superpone
 * cuando corresponde. De ese modo el hero nunca esta vacio: ni durante la
 * descarga de Three.js, ni si esta falla, ni si el dispositivo no puede con
 * ella.
 *
 * Motivos por los que no se monta la escena:
 *
 *   1. `prefers-reduced-motion` — es movimiento continuo, justo lo que esa
 *      preferencia pide evitar. Ademas asi ni se descarga Three.js.
 *   2. Sin WebGL — comprobado creando un contexto de verdad.
 *   3. Antes de montar — en servidor no se puede saber nada de lo anterior.
 *
 * Y una vez montada, el bucle de render se apaga al salir del viewport.
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

  // `once: false`: hace falta saber tambien cuando la escena SALE de pantalla.
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, rootMargin: '0px' })

  const shouldRender = !reducedMotion && capability?.webgl === true

  return (
    <div ref={ref} className="absolute inset-0">
      <StaticBackdrop />

      {shouldRender ? <BlackHoleCanvas quality={capability.quality} active={inView} /> : null}
    </div>
  )
}
