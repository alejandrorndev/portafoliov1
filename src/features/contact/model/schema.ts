import { z } from 'zod'

/*
 * -----------------------------------------------------------------------------
 * Un unico esquema para cliente y servidor.
 * -----------------------------------------------------------------------------
 * El del cliente es solo experiencia de usuario: evita un viaje al servidor
 * para decir "falta el correo". El del servidor es el autoritativo, porque
 * cualquiera puede enviar un POST sin pasar por el formulario.
 *
 * Duplicarlos es la via segura para que diverjan: se ajusta un limite en un
 * lado, se olvida el otro, y aparece un error que el usuario no puede corregir
 * porque el formulario decia que estaba bien.
 *
 * Los mensajes son CLAVES de traduccion, no texto: el mismo esquema tiene que
 * servir en los dos idiomas. Los resuelve la vista.
 * -----------------------------------------------------------------------------
 */

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 2000
export const NAME_MAX = 80

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired').max(NAME_MAX, 'nameTooLong'),

  email: z.string().trim().min(1, 'emailRequired').pipe(z.email('emailInvalid')),

  message: z
    .string()
    .trim()
    .min(1, 'messageRequired')
    .min(MESSAGE_MIN, 'messageTooShort')
    .max(MESSAGE_MAX, 'messageTooLong'),

  /*
   * Trampa para bots. Es un campo oculto que una persona nunca ve ni rellena,
   * pero que un bot que completa todos los inputs del formulario sí llena.
   *
   * Se prefiere a un CAPTCHA porque no cuesta nada al usuario legitimo: un
   * CAPTCHA es fricción justo en el momento en que alguien decide escribirte.
   */
  website: z.string().max(0, 'spam').optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

/** Errores por campo, con la clave de traduccion de cada uno. */
export type FieldErrors = Partial<Record<keyof ContactInput, string>>

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; reason: 'validation'; fields: FieldErrors }
  | { status: 'error'; reason: 'rateLimited' | 'unexpected' }

/** Extrae los errores de Zod al mapa de claves por campo. */
export function toFieldErrors(error: z.ZodError<ContactInput>): FieldErrors {
  const fields: FieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in fields)) {
      fields[field as keyof ContactInput] = issue.message
    }
  }

  return fields
}
