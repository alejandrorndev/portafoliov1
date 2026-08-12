'use client'

import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'

/**
 * Lienzo de la escena.
 *
 * Vive en su propio modulo para que sea el limite de la carga diferida: al
 * importarse solo desde un `dynamic()`, todo Three.js —unos 150 KB gzip— queda
 * fuera del bundle inicial y no retrasa el texto del hero.
 *
 * `frameloop` se apaga cuando la escena sale del viewport. Sin eso, seguiria
 * dibujando 6.700 particulas a 60 fps mientras el usuario lee la seccion de
 * experiencia, gastando bateria a cambio de nada.
 */
export function BlackHoleCanvas({ quality, active }: { quality: number; active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      // El original ya limitaba a 2. En una pantalla a 3x se dibujarian un 125%
      // mas de pixeles sin diferencia visible en una nube de particulas.
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 52, near: 0.1, far: 500, position: [1, 5, 14] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene quality={quality} />
    </Canvas>
  )
}
