import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { getProfile } from '@/content'
import { LOCALES } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import '../globals.css'

type LocaleParams = { locale: string }

/**
 * Prerenderiza ambos idiomas en build. Sin esto, cada idioma se renderiza bajo
 * demanda y se pierde la ventaja de un sitio que es enteramente estatico.
 */
export function generateStaticParams(): LocaleParams[] {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const profile = getProfile(locale)

  return {
    title: `${profile.fullName} — ${profile.role}`,
    description: profile.summary.replaceAll('**', ''),
    alternates: {
      canonical: `/${locale}`,
      // hreflang reciproco: sin esto Google trata las dos versiones como
      // contenido duplicado en vez de como traducciones la una de la otra.
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<LocaleParams>
}) {
  const { locale } = await params

  // El segmento [locale] es texto libre: /fr o /cualquier-cosa llegan hasta
  // aqui. Sin esta guarda se renderizaria un <html lang="cualquier-cosa">.
  if (!hasLocale(routing.locales, locale)) notFound()

  // Habilita el renderizado estatico: le dice a next-intl cual es el idioma
  // sin tener que leer la peticion.
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
