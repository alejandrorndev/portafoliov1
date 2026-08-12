import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Une clases condicionales y resuelve los conflictos de Tailwind quedandose
 * con la ultima.
 *
 * Sin `twMerge`, `cn('p-4', 'p-8')` deja ambas en el atributo y cual gana
 * depende del orden en la hoja compilada, no del orden de los argumentos. Eso
 * hace imposible que un componente de `shared/ui` acepte una prop `className`
 * que realmente sobreescriba sus valores por defecto.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
