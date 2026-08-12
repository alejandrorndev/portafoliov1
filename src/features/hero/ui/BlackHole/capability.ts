/**
 * Decide si esta maquina debe dibujar la escena, y con cuanto detalle.
 *
 * Se ejecuta una vez en el cliente. Todo lo que consulta —WebGL, ancho de
 * pantalla, nucleos, memoria— solo existe en el navegador.
 */

/**
 * `true` si el navegador puede crear un contexto WebGL.
 *
 * No basta con mirar si `WebGLRenderingContext` existe: hay maquinas donde el
 * constructor esta definido pero la creacion falla —driver en lista negra,
 * aceleracion desactivada, demasiados contextos vivos—. La unica comprobacion
 * fiable es intentarlo.
 */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

/**
 * Factor de calidad entre 0 y 1 que multiplica el numero de particulas.
 *
 * La escena completa son ~6.700 particulas con mezcla aditiva. En un escritorio
 * no se nota; en un telefono de gama media, dibujarlas todas convierte el hero
 * —lo primero que ve quien abre el portafolio— en una presentacion de
 * diapositivas.
 *
 * El ancho de pantalla es un mal indicador de potencia por si solo, asi que se
 * cruza con el numero de nucleos y la memoria cuando el navegador los expone.
 */
export function detectQuality(): number {
  const width = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4
  // deviceMemory no es estandar en todos los navegadores.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4

  const weak = cores <= 4 || memory <= 4

  if (width < 640) return weak ? 0.25 : 0.4
  if (width < 1024) return weak ? 0.45 : 0.65
  return weak ? 0.75 : 1
}

export type Capability = { webgl: boolean; quality: number }

/*
 * La capacidad se mide una sola vez y se cachea a nivel de modulo.
 *
 * Hace falta que sea la MISMA referencia en cada lectura: useSyncExternalStore
 * compara el resultado con Object.is y devolver un objeto nuevo cada vez lo
 * dejaria en un bucle infinito de renders.
 */
let cached: Capability | null = null

export function readCapability(): Capability {
  cached ??= { webgl: supportsWebGL(), quality: detectQuality() }
  return cached
}

/** En servidor no hay nada que medir. */
export const NO_CAPABILITY = null

/** La capacidad no cambia durante la vida de la pagina: no hay a que suscribirse. */
export const subscribeToCapability = () => () => {}
