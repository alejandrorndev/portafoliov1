import { cn } from '@/shared/lib/cn'
import { DevIcon } from './DevIcon'
import type { IconName } from './icons.generated'

/** Pildora de tecnologia con icono, usada en la rejilla de skills. */
export function Chip({
  icon,
  children,
  className,
}: {
  icon?: IconName
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5',
        'text-muted text-sm',
        'hover:border-purple/40 hover:bg-purple/10 hover:text-ink transition-colors duration-200',
        className,
      )}
    >
      {icon ? <DevIcon name={icon} /> : null}
      {children}
    </span>
  )
}
