import 'server-only'

import { Resend } from 'resend'
import type { ContactInput } from './schema'

/*
 * -----------------------------------------------------------------------------
 * Envio del mensaje de contacto.
 * -----------------------------------------------------------------------------
 * Aislado detras de una funcion para que la Server Action no sepa que hay
 * Resend detras. Cambiar de proveedor —o pasar a guardar en una base de
 * datos— es reescribir este archivo.
 *
 * Requiere dominio propio verificado por DNS en Resend: sin el, el remitente
 * seria una direccion de pruebas del proveedor, que en una carta de
 * presentacion se ve mal.
 * -----------------------------------------------------------------------------
 */

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' }

type MailerConfig = { apiKey: string; from: string; to: string }

function readConfig(): MailerConfig | null {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL

  if (!apiKey || !from || !to) return null
  return { apiKey, from, to }
}

/** Escapa lo que va al HTML del correo. */
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  )

export async function sendContactMessage(input: ContactInput): Promise<SendResult> {
  const config = readConfig()

  if (!config) {
    console.warn(
      '[contacto] Resend sin configurar: el mensaje NO se envió. ' +
        'Define RESEND_API_KEY, CONTACT_FROM_EMAIL y CONTACT_TO_EMAIL.',
    )
    return { ok: false, reason: 'not-configured' }
  }

  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: config.to,
      // Responder al correo abre la respuesta directamente hacia el visitante,
      // sin tener que copiar la direccion del cuerpo.
      replyTo: input.email,
      subject: `Portafolio — mensaje de ${input.name}`,
      text: `${input.name} <${input.email}>\n\n${input.message}`,
      html: `<p><strong>${escape(input.name)}</strong> &lt;${escape(input.email)}&gt;</p><p>${escape(
        input.message,
      ).replace(/\n/g, '<br>')}</p>`,
    })

    if (error) {
      console.error('[contacto] Resend rechazó el envío', error)
      return { ok: false, reason: 'failed' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[contacto] fallo al enviar', error)
    return { ok: false, reason: 'failed' }
  }
}
