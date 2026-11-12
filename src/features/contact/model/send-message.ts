'use server'

import { headers } from 'next/headers'
import { allowSubmission } from './rate-limit'
import { type ContactValidation, contactSchema, toFieldErrors } from './schema'

/**
 * Server Action que valida el mensaje ANTES de que el navegador lo envie.
 *
 * El envio en si lo hace el cliente (ver web3forms.ts: el plan gratis de
 * Web3Forms no acepta envios desde servidor). La validacion se queda aqui por
 * dos motivos: el esquema vive en un solo sitio sin arrastrar zod al bundle,
 * y el limite por IP necesita ver la IP real, que solo conoce el servidor.
 *
 * Orden deliberado: primero se valida, despues se mira el limite de tasa.
 * Al reves, un usuario legitimo que se equivoca tres veces escribiendo su
 * correo se quedaria bloqueado una hora sin haber enviado nada.
 *
 * El honeypot se trata como exito. Decirle a un bot "detectado" le da la
 * señal que necesita para ajustarse; que crea que funcionó no cuesta nada.
 */
export async function validateMessage(formData: FormData): Promise<ContactValidation> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    website: formData.get('website'),
  })

  if (!parsed.success) {
    const fields = toFieldErrors(parsed.error)

    // El honeypot venia relleno: es un bot.
    if (fields.website) return { status: 'success' }

    return { status: 'error', reason: 'validation', fields }
  }

  const requestHeaders = await headers()
  // En Vercel, x-forwarded-for trae la IP real del visitante; el primer valor
  // es el cliente y el resto son proxies intermedios.
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconocida'

  if (!(await allowSubmission(ip))) {
    return { status: 'error', reason: 'rateLimited' }
  }

  return { status: 'valid', data: parsed.data }
}
