'use client'

import { useActionState, useId } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { MESSAGE_MAX } from '../model/schema'
import type { ContactState } from '../model/schema'
import { sendMessage } from '../model/send-message'

const INITIAL: ContactState = { status: 'idle' }

export function ContactForm({ email }: { email: string }) {
  const t = useTranslations('contact.form')
  const [state, action] = useActionState(sendMessage, INITIAL)
  const ids = useId()

  const fieldError = (field: 'name' | 'email' | 'message') =>
    state.status === 'error' && state.reason === 'validation' ? state.fields[field] : undefined

  return (
    <form action={action} className="mt-10 space-y-5 text-left" noValidate>
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
        error={fieldError('email')}
        autoComplete="email"
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
        <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
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

      <SubmitButton idle={t('submit')} busy={t('sending')} />

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
  )
}

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  // useFormStatus solo funciona en un componente HIJO del <form>: lee el
  // estado del formulario padre.
  const { pending } = useFormStatus()

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
