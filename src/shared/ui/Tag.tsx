import { cn } from '@/shared/lib/cn'

/**
 * Etiqueta pequeña para nombres de tecnologia.
 *
 * Unifica `.p-tag` y `.t-chip` del original, que eran dos clases con estilos
 * casi identicos —diferian en un tono de color— y se habian duplicado sin
 * motivo.
 */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'border-purple/20 bg-purple/10 text-purple inline-block rounded border px-2.5 py-0.5 text-xs',
        className,
      )}
    >
      {children}
    </span>
  )
}
