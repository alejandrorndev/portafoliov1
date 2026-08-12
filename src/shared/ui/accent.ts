/*
 * Los acentos son vocabulario del sistema de diseño, no del contenido: por eso
 * viven aqui y no en content/. El contenido los consume ("esta categoria usa
 * cyan") sin saber a que clases se traducen.
 *
 * Los mapas son explicitos porque Tailwind analiza el codigo de forma
 * estatica: `text-${accent}` no genera ninguna clase y saldria sin color.
 */

export const ACCENTS = ['purple', 'cyan', 'pink', 'gold'] as const

export type Accent = (typeof ACCENTS)[number]

export const ACCENT_TEXT: Record<Accent, string> = {
  purple: 'text-purple',
  cyan: 'text-cyan',
  pink: 'text-pink',
  gold: 'text-gold',
}

export const ACCENT_BG: Record<Accent, string> = {
  purple: 'bg-purple',
  cyan: 'bg-cyan',
  pink: 'bg-pink',
  gold: 'bg-gold',
}

export const ACCENT_BORDER_HOVER: Record<Accent, string> = {
  purple: 'hover:border-purple',
  cyan: 'hover:border-cyan',
  pink: 'hover:border-pink',
  gold: 'hover:border-gold',
}

export const ACCENT_GLOW_HOVER: Record<Accent, string> = {
  purple: 'hover:shadow-glow-purple',
  cyan: 'hover:shadow-glow-cyan',
  pink: 'hover:shadow-glow-pink',
  gold: 'hover:shadow-glow-gold',
}
