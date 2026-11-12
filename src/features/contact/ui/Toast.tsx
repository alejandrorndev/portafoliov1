'use client'

import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'

const DURATION_MS = 6000

/**
 * Aviso flotante con el resultado del envio.
 *
 * Es un refuerzo VISUAL: quien pulsa Enviar al final de la pagina puede tener
 * el mensaje de estado del formulario fuera de pantalla en movil. El anuncio
 * para lectores de pantalla lo sigue haciendo esa region aria-live del
 * formulario; si el toast tambien fuera live, se leeria dos veces. Por eso no
 * lleva role="status".
 *
 * Vive en la feature de contacto y no en shared/ui: hoy solo lo usa ella.
 */
export function Toast({
  tone,
  message,
  closeLabel,
  onClose,
}: {
  tone: 'success' | 'error'
  message: string
  closeLabel: string
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'animate-toast-in fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-lg border p-4 text-sm shadow-lg backdrop-blur-md',
        'sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm',
        'bg-bg-alt/90 text-ink',
        tone === 'success' ? 'border-cyan/60' : 'border-pink/60',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('mt-0.5 font-bold', tone === 'success' ? 'text-cyan' : 'text-pink')}
      >
        {tone === 'success' ? '✓' : '!'}
      </span>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-muted hover:text-ink -m-1 p-1 leading-none transition-colors"
      >
        ×
      </button>
    </div>
  )
}
