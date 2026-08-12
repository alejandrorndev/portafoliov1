'use server'

import { headers } from 'next/headers'
import { sendContactMessage } from './mailer'
import { allowSubmission } from './rate-limit'
import { type ContactState, contactSchema, toFieldErrors } from './schema'

/**
 * Server Action del formulario de contacto.
 *
 * Orden deliberado: primero se valida, despues se mira el limite de tasa.
 * Al reves, un usuario legitimo que se equivoca tres veces escribiendo su
 * correo se quedaria bloqueado una hora sin haber enviado nada.
 *
 * El honeypot se trata como exito. Decirle a un bot "detectado" le da la
 * señal que necesita para ajustarse; que crea que funcionó no cuesta nada.
 */
export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
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

  const result = await sendContactMessage(parsed.data)

  if (!result.ok) {
    // El motivo se queda en el servidor: al visitante se le ofrece el correo
    // directo como alternativa, que es lo unico que le sirve.
    return { status: 'error', reason: 'unexpected' }
  }

  return { status: 'success' }
}
