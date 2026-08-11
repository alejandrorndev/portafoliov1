import type { Metadata } from 'next'
import './globals.css'

/*
 * Layout provisional de la Fase 0.
 * En la Fase 1 se mueve a app/[locale]/layout.tsx: `lang` pasa a depender del
 * locale activo y la metadata se genera por idioma con alternates hreflang.
 */
export const metadata: Metadata = {
  title: 'Alejandro Restrepo — Backend Developer',
  description: 'Portafolio de Alejandro Restrepo Naranjo, desarrollador backend.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
