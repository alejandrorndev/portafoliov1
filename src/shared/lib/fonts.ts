import { Inter, Space_Grotesk } from 'next/font/google'

/*
 * El original usaba `Segoe UI`, que solo existe en Windows: en Mac y en Linux
 * el sitio caia a otra fuente y se veia distinto a como fue diseñado.
 *
 * next/font descarga y sirve las fuentes desde el propio dominio, genera
 * `size-adjust` para que no haya salto de layout al cargar, y evita la
 * peticion a Google en runtime.
 */

/** Titulares y numeros. Geometrica, con caracter. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['500', '700'],
})

/** Texto corrido. Pensada para pantalla y muy legible en tamaños pequeños. */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/** Clases a aplicar en <html> para exponer ambas variables CSS. */
export const fontVariables = `${spaceGrotesk.variable} ${inter.variable}`
