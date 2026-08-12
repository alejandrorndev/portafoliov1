'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  DoubleSide,
  type Group,
  type Points as PointsObject,
  type Scene as SceneObject,
} from 'three'
import {
  createAccretionDisk,
  createJets,
  createNebula,
  createStarfield,
  DISK_TILT,
  LENSING_RINGS,
  PHOTON_RINGS,
  type ParticleCloud,
} from './geometry'

/** Nube de puntos con color por vertice y mezcla aditiva. */
function Cloud({ cloud, size, opacity }: { cloud: ParticleCloud; size: number; opacity: number }) {
  const ref = useRef<PointsObject>(null)

  return (
    <points ref={ref}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={new BufferAttribute(cloud.positions, 3)} />
        <primitive attach="attributes-color" object={new BufferAttribute(cloud.colors, 3)} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/** Anillo plano, tumbado sobre el plano ecuatorial. */
function Ring({
  inner,
  outer,
  color,
  opacity,
}: {
  inner: number
  outer: number
  color: number
  opacity: number
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={DoubleSide}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Contenido de la escena del agujero negro.
 *
 * `quality` escala el numero de particulas. La geometria se construye una sola
 * vez por valor de calidad: regenerarla en cada fotograma significaria repartir
 * 6.700 puntos sesenta veces por segundo.
 */
export function Scene({ quality }: { quality: number }) {
  const starfield = useMemo(() => createStarfield(quality), [quality])
  const disk = useMemo(() => createAccretionDisk(quality), [quality])
  const jets = useMemo(() => createJets(quality), [quality])
  const nebula = useMemo(() => createNebula(quality), [quality])

  const diskRefs = useRef<(Group | null)[]>([])
  const sceneRef = useRef<SceneObject>(null)

  // El objetivo del raton y la posicion suavizada viven en refs, no en estado:
  // un re-render de React por cada mousemove seria justo lo que no puede pasar
  // dentro de un bucle a 60 fps.
  const target = useRef({ x: 0, y: 0 })
  const smoothed = useRef({ x: 0, y: 0 })

  /*
   * La camara se toma del estado que entrega useFrame, no de useThree.
   * Mover la camara cada fotograma es el idioma de R3F, pero hacerlo sobre el
   * objeto devuelto por un hook es mutar un valor del que React se considera
   * dueño. Recibirlo por parametro deja claro que la mutacion pertenece al
   * bucle de render, no al ciclo de vida de React.
   */
  useFrame(({ camera, clock, pointer }, delta) => {
    // `pointer` de R3F ya viene normalizado a -1..1; el original hacia esa
    // division a mano sobre clientX/clientY.
    target.current.x = pointer.x * 0.25
    target.current.y = pointer.y * 0.15

    // Suavizado independiente de la tasa de refresco. Con un 0.03 fijo por
    // fotograma, una pantalla de 120 Hz movia la camara al doble de velocidad
    // que una de 60.
    const smoothing = 1 - Math.pow(0.001, delta)
    smoothed.current.x += (target.current.x - smoothed.current.x) * smoothing
    smoothed.current.y += (target.current.y - smoothed.current.y) * smoothing

    camera.position.x = 1 + smoothed.current.x * 4
    camera.position.y = 5 + smoothed.current.y * 2.5
    camera.lookAt(0, 0, 0)

    const elapsed = clock.getElapsedTime()

    diskRefs.current.forEach((group, index) => {
      if (!group) return
      group.rotation.y = elapsed * (disk[index]?.speed ?? 0) * 0.25
      group.rotation.x = DISK_TILT
    })

    if (sceneRef.current) sceneRef.current.rotation.y = elapsed * 0.015
  })

  return (
    <scene ref={sceneRef}>
      <Cloud cloud={starfield} size={0.2} opacity={0.9} />

      {/* Horizonte de sucesos: esfera negra opaca. */}
      <mesh>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>

      {PHOTON_RINGS.map(([inner, outer, color, opacity]) => (
        <Ring key={`photon-${inner}`} inner={inner} outer={outer} color={color} opacity={opacity} />
      ))}

      {LENSING_RINGS.map(([inner, outer, color, opacity]) => (
        <Ring key={`lens-${inner}`} inner={inner} outer={outer} color={color} opacity={opacity} />
      ))}

      {disk.map((ring, index) => (
        <group
          key={ring.innerRadius}
          ref={(group) => {
            diskRefs.current[index] = group
          }}
          rotation={[DISK_TILT, 0, 0]}
        >
          <Cloud cloud={ring.cloud} size={ring.size} opacity={ring.opacity} />
        </group>
      ))}

      <Cloud cloud={jets} size={0.065} opacity={0.75} />
      <Cloud cloud={nebula} size={0.35} opacity={0.22} />
    </scene>
  )
}
