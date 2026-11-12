'use client'

import {
  type FormEvent,
  startTransition,
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
// MESSAGE_MAX viene de limits.ts, no de schema.ts: schema.ts importa zod y
// bastaría este import de valor para arrastrar ~70 KB gzip al navegador.
// El tipo sí puede venir de schema.ts — `import type` se borra al compilar.
import { EMAIL_PATTERN, MESSAGE_MAX } from '../model/limits'
import type { ContactState } from '../model/schema'
import { validateMessage } from '../model/send-message'
import { submitContactMessage } from '../model/web3forms'
import { Toast } from './Toast'

const INITIAL: ContactState = { status: 'idle' }

/*
 * Dos pasos: el servidor valida (esquema, honeypot y limite por IP) y, si todo
 * esta bien, el navegador envia a Web3Forms. Ver web3forms.ts para el porque.
 */
async function sendMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const validation = await validateMessage(formData)
  if (validation.status !== 'valid') return validation

  const sent = await submitContactMessage(validation.data)
  // El motivo del fallo queda en la consola: al visitante se le ofrece el
  // correo directo como alternativa, que es lo unico que le sirve.
  return sent ? { status: 'success' } : { status: 'error', reason: 'unexpected' }
}

/** Clave de error del correo segun el mismo patron que usa el servidor. */
function emailErrorFor(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'emailRequired'
  return EMAIL_PATTERN.test(trimmed) ? undefined : 'emailInvalid'
}

/** Resultado que merece aviso flotante. La validacion no: ya se marca en cada campo. */
type Notice = 'success' | 'rateLimited' | 'unexpected'

function noticeFor(state: ContactState): Notice | null {
  if (state.status === 'success') return 'success'
  if (state.status === 'error' && state.reason !== 'validation') return state.reason
  return null
}

export function ContactForm({ email }: { email: string }) {
  const t = useTranslations('contact.form')
  const ids = useId()
  const formRef = useRef<HTMLFormElement>(null)

  // Error del correo detectado en el cliente al salir del campo. Tiene
  // prioridad sobre el del servidor porque refleja lo que hay escrito ahora.
  const [emailError, setEmailError] = useState<string>()
  const [notice, setNotice] = useState<Notice | null>(null)
  const closeNotice = useCallback(() => setNotice(null), [])

  // Los efectos del resultado (vaciar el formulario, mostrar el aviso) se
  // aplican dentro de la accion y no en un useEffect que observe el estado:
  // ocurren una vez por envio, sin un render intermedio con el aviso viejo.
  const [state, dispatch, pending] = useActionState(
    async (previous: ContactState, formData: FormData) => {
      const next = await sendMessage(previous, formData)
      if (next.status === 'success') {
        // El formulario solo se vacia cuando el mensaje salio: ver handleSubmit.
        formRef.current?.reset()
        setEmailError(undefined)
      }
      setNotice(noticeFor(next))
      return next
    },
    INITIAL,
  )

  /*
   * onSubmit en lugar de <form action>. Con `action`, React 19 vacia el
   * formulario cada vez que la accion termina —tambien si devolvio errores de
   * validacion—, asi que quien escribia mal su correo perdia el mensaje entero.
   * Aqui el reinicio es explicito y solo ocurre tras un envio exitoso.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setNotice(null)
    startTransition(() => dispatch(formData))
  }

  const fieldError = (field: 'name' | 'email' | 'message') =>
    state.status === 'error' && state.reason === 'validation' ? state.fields[field] : undefined

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-10 space-y-5 text-left" noValidate>
        <Field
          id={`${ids}-name`}
          name="name"
          label={t('name')}
          error={fieldError('name')}
          autoComplete="name"
        />
        <Field
          id={`${ids}-email`}
          name="email"
          type="email"
          label={t('email')}
          error={emailError ?? fieldError('email')}
          autoComplete="email"
          // Se valida al salir del campo, no en cada tecla: marcar como invalido
          // un correo a medio escribir es regañar a alguien que aun no termina.
          onBlur={(event) => setEmailError(emailErrorFor(event.currentTarget.value))}
          // Una vez marcado, el error se reevalua mientras se corrige, para que
          // desaparezca en cuanto el correo es valido.
          onChange={(event) => {
            if (emailError) setEmailError(emailErrorFor(event.currentTarget.value))
          }}
        />
        <Field
          id={`${ids}-message`}
          name="message"
          label={t('message')}
          error={fieldError('message')}
          multiline
          maxLength={MESSAGE_MAX}
        />

        {/*
        Honeypot. Oculto para la vista Y para la tecnologia asistiva —de ahi
        aria-hidden y tabIndex={-1}—: si un lector de pantalla lo anunciara,
        una persona ciega podria rellenarlo y su mensaje se descartaria en
        silencio. `sr-only` no vale aqui, porque justamente lo expone.
      */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${ids}-website`}>No rellenar</label>
          <input
            id={`${ids}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p className="text-muted text-xs">
          {t.rich('privacyNotice', {
            link: (chunks) => (
              <Link href="/privacy" className="text-cyan underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <SubmitButton pending={pending} idle={t('submit')} busy={t('sending')} />

        {/*
        aria-live="polite" anuncia el resultado sin robar el foco. Sin esto,
        quien usa lector de pantalla pulsa Enviar y no recibe ninguna señal de
        que algo haya pasado.
      */}
        <p
          aria-live="polite"
          role="status"
          className={cn(
            'min-h-[1.5rem] text-sm',
            state.status === 'success' && 'text-cyan',
            state.status === 'error' && 'text-pink',
          )}
        >
          {state.status === 'success' ? t('success') : null}
          {state.status === 'error' && state.reason === 'rateLimited'
            ? t('errors.rateLimited')
            : null}
          {state.status === 'error' && state.reason === 'unexpected' ? t('error', { email }) : null}
        </p>
      </form>

      {notice ? (
        <Toast
          tone={notice === 'success' ? 'success' : 'error'}
          message={
            notice === 'success'
              ? t('success')
              : notice === 'rateLimited'
                ? t('errors.rateLimited')
                : t('error', { email })
          }
          closeLabel={t('closeNotice')}
          onClose={closeNotice}
        />
      ) : null}
    </>
  )
}

function SubmitButton({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  // El estado llega por prop desde useActionState. useFormStatus ya no sirve:
  // solo ve envios hechos con <form action>, y este usa onSubmit.
  return (
    <button
      type="submit"
      disabled={pending}
      className="from-purple to-cyan ease-brand hover:shadow-glow-purple inline-flex items-center justify-center rounded-md bg-gradient-to-br px-7 py-3 text-xs font-bold tracking-widest text-black uppercase transition-all duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? busy : idle}
    </button>
  )
}

function Field({
  id,
  name,
  label,
  error,
  type = 'text',
  multiline = false,
  ...props
}: {
  id: string
  name: string
  label: string
  error?: string
  type?: string
  multiline?: boolean
} & React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>) {
  const t = useTranslations('contact.form')
  const errorId = `${id}-error`

  const className = cn(
    'bg-surface w-full rounded-lg border px-4 py-3 text-sm outline-none',
    'placeholder:text-muted/60 focus-visible:border-cyan transition-colors',
    error ? 'border-pink' : 'border-hairline',
  )

  const shared = {
    id,
    name,
    className,
    'aria-invalid': error ? true : undefined,
    // Enlaza el input con su mensaje de error para que el lector de pantalla
    // lo lea al enfocar el campo, no solo al recorrer la pagina.
    'aria-describedby': error ? errorId : undefined,
    ...props,
  }

  return (
    <div>
      <label htmlFor={id} className="text-muted mb-1.5 block text-xs tracking-widest uppercase">
        {label}
      </label>

      {multiline ? <textarea {...shared} rows={5} /> : <input {...shared} type={type} />}

      {error ? (
        <p id={errorId} className="text-pink mt-1.5 text-xs">
          {t(`errors.${error}`)}
        </p>
      ) : null}
    </div>
  )
}
