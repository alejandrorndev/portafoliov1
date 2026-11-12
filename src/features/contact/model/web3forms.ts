import type { ContactInput } from './schema'

/*
 * -----------------------------------------------------------------------------
 * Envio del mensaje de contacto a traves de Web3Forms.
 * -----------------------------------------------------------------------------
 * Corre en el NAVEGADOR, no en el servidor, y no es por gusto: el plan gratis
 * de Web3Forms solo acepta envios desde el cliente. Desde un servidor exige
 * plan de pago y la IP del servidor en lista blanca.
 *
 * Por eso la access key es una variable NEXT_PUBLIC_ y viaja en el bundle.
 * Web3Forms la define como publica: con ella solo se pueden enviar correos al
 * buzon del dueño, no leer nada. No confundir con una API key secreta.
 *
 * Cambiar de proveedor es reescribir este archivo; el formulario solo conoce
 * `submitContactMessage`.
 * -----------------------------------------------------------------------------
 */

const ENDPOINT = 'https://api.web3forms.com/submit'

export async function submitContactMessage(input: ContactInput): Promise<boolean> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

  if (!accessKey) {
    console.warn(
      '[contacto] Web3Forms sin configurar: el mensaje NO se envió. ' +
        'Define NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.',
    )
    return false
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Portafolio — mensaje de ${input.name}`,
        from_name: 'Portafolio AR.dev',
        name: input.name,
        // Web3Forms usa `email` como reply-to: responder al correo le escribe
        // directamente al visitante.
        email: input.email,
        message: input.message,
      }),
    })

    const result = (await response.json()) as { success?: boolean; message?: string }

    if (!response.ok || !result.success) {
      console.error('[contacto] Web3Forms rechazó el envío', response.status, result.message)
      return false
    }

    return true
  } catch (error) {
    console.error('[contacto] fallo al enviar', error)
    return false
  }
}
