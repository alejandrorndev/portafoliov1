import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/*
 * -----------------------------------------------------------------------------
 * Limite de envios por IP.
 * -----------------------------------------------------------------------------
 * En serverless NO sirve un contador en memoria: cada invocacion arranca
 * limpia, asi que un bot que envie mil peticiones puede toparse con mil
 * procesos distintos, todos convencidos de que es el primer envio. Hace falta
 * estado compartido, y de ahi Redis.
 *
 * Si Upstash no esta configurado, el limitador deja pasar todo y lo avisa por
 * consola. Es deliberado: el formulario tiene que funcionar en local y en un
 * preview sin obligar a montar una cuenta, y el honeypot sigue filtrando el
 * grueso del spam automatizado. Lo que no puede pasar es que falle en
 * silencio, de ahi el aviso.
 * -----------------------------------------------------------------------------
 */

const WINDOW = '1 h'
const MAX_PER_WINDOW = 3

let limiter: Ratelimit | null | undefined

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      '[contacto] Upstash sin configurar: el formulario acepta envíos sin límite de tasa. ' +
        'Define UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN antes de publicar.',
    )
    limiter = null
    return limiter
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    // Ventana deslizante: con una fija, alguien podria enviar 3 al final de
    // una hora y 3 al principio de la siguiente, 6 en pocos segundos.
    limiter: Ratelimit.slidingWindow(MAX_PER_WINDOW, WINDOW),
    prefix: 'portafolio:contacto',
    analytics: false,
  })

  return limiter
}

/** `true` si este identificador puede enviar ahora. */
export async function allowSubmission(identifier: string): Promise<boolean> {
  const instance = getLimiter()
  if (!instance) return true

  try {
    const { success } = await instance.limit(identifier)
    return success
  } catch (error) {
    // Si Redis no responde, se deja pasar. Un formulario caido por una
    // incidencia del limitador es peor que un envio de mas: el honeypot sigue
    // en pie.
    console.error('[contacto] el limitador de tasa falló, se permite el envío', error)
    return true
  }
}
