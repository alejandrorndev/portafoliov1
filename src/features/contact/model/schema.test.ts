import { describe, expect, it } from 'vitest'
import messagesEs from '@/i18n/messages/es.json'
import { contactSchema, MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, toFieldErrors } from './schema'

const valid = {
  name: 'Alejandro',
  email: 'hola@ejemplo.com',
  message: 'Hola, me gustaría hablar contigo sobre una oportunidad de trabajo.',
}

const parse = (input: Record<string, unknown>) => contactSchema.safeParse(input)

/** Primer error del campo pedido, o undefined. */
function errorFor(input: Record<string, unknown>, field: string): string | undefined {
  const result = parse(input)
  if (result.success) return undefined
  return toFieldErrors(result.error)[field as 'name']
}

describe('validación del formulario', () => {
  it('acepta un mensaje correcto', () => {
    expect(parse(valid).success).toBe(true)
  })

  it('recorta los espacios sobrantes', () => {
    const result = parse({ ...valid, name: '  Alejandro  ' })
    expect(result.success && result.data.name).toBe('Alejandro')
  })

  it('rechaza un nombre en blanco', () => {
    expect(errorFor({ ...valid, name: '   ' }, 'name')).toBe('nameRequired')
  })

  it('rechaza un nombre desmesurado', () => {
    expect(errorFor({ ...valid, name: 'a'.repeat(NAME_MAX + 1) }, 'name')).toBe('nameTooLong')
  })

  it.each(['sinarroba', 'sin@dominio', '@sinusuario.com', 'espacio @ejemplo.com'])(
    'rechaza el correo inválido "%s"',
    (email) => {
      expect(errorFor({ ...valid, email }, 'email')).toBe('emailInvalid')
    },
  )

  it('distingue correo ausente de correo mal escrito', () => {
    // Decirle "escribe tu correo" a quien escribió uno con una errata es
    // desconcertante: no ve el campo vacío.
    expect(errorFor({ ...valid, email: '' }, 'email')).toBe('emailRequired')
    expect(errorFor({ ...valid, email: 'roto' }, 'email')).toBe('emailInvalid')
  })

  it('rechaza un mensaje demasiado corto', () => {
    expect(errorFor({ ...valid, message: 'hola' }, 'message')).toBe('messageTooShort')
  })

  it('distingue mensaje ausente de mensaje corto', () => {
    expect(errorFor({ ...valid, message: '' }, 'message')).toBe('messageRequired')
  })

  it('rechaza un mensaje desmesurado', () => {
    expect(errorFor({ ...valid, message: 'a'.repeat(MESSAGE_MAX + 1) }, 'message')).toBe(
      'messageTooLong',
    )
  })

  it('acepta justo en los límites', () => {
    expect(parse({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).success).toBe(true)
    expect(parse({ ...valid, message: 'a'.repeat(MESSAGE_MAX) }).success).toBe(true)
    expect(parse({ ...valid, name: 'a'.repeat(NAME_MAX) }).success).toBe(true)
  })

  it('devuelve un solo error por campo', () => {
    // Un campo con tres mensajes de error a la vez es ruido, no ayuda.
    const result = parse({ name: '', email: '', message: '' })
    expect(result.success).toBe(false)

    if (!result.success) {
      const fields = toFieldErrors(result.error)
      expect(Object.keys(fields).sort()).toEqual(['email', 'message', 'name'])
    }
  })
})

describe('honeypot', () => {
  it('acepta el campo trampa vacío', () => {
    expect(parse({ ...valid, website: '' }).success).toBe(true)
  })

  it('acepta que el campo trampa ni exista', () => {
    expect(parse(valid).success).toBe(true)
  })

  it('rechaza el envío si el campo trampa viene relleno', () => {
    // Una persona nunca ve ese campo. Si llega con contenido, lo llenó un bot
    // que completa todos los inputs del formulario.
    expect(errorFor({ ...valid, website: 'http://spam.example' }, 'website')).toBe('spam')
  })
})

describe('las claves de error existen en los mensajes', () => {
  it('cada mensaje del esquema tiene traducción', () => {
    // El esquema devuelve CLAVES, no texto. Si una clave no existe en los
    // archivos de mensajes, el usuario ve la clave cruda en pantalla.
    const claves = new Set<string>()

    for (const input of [
      { name: '', email: '', message: '' },
      { ...valid, name: 'a'.repeat(NAME_MAX + 1) },
      { ...valid, email: 'roto' },
      { ...valid, message: 'corto' },
      { ...valid, message: 'a'.repeat(MESSAGE_MAX + 1) },
    ]) {
      const result = parse(input)
      if (!result.success) {
        for (const value of Object.values(toFieldErrors(result.error))) claves.add(value)
      }
    }

    const disponibles = messagesEs.contact.form.errors as Record<string, string>

    for (const clave of claves) {
      expect(disponibles[clave], `falta contact.form.errors.${clave} en es.json`).toBeDefined()
    }
  })
})
