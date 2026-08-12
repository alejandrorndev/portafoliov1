import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { getProfile } from '@/content'
import { CustomCursor } from '@/features/cursor'
import { CLIENT_NAMESPACES, LOCALES, type Locale } from '@/i18n/config'
import { routing } from '@/i18n/routing'
import { fontVariables } from '@/shared/lib/fonts'
import { MOTION_FLAG_SCRIPT } from '@/shared/lib/motion-flag'
import { buildPersonSchema } from '@/shared/lib/person-schema'
import { SITE_URL } from '@/shared/lib/site-url'
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
  const t = await getTranslations({ locale, namespace: 'meta' })

  const title = `${profile.fullName} — ${profile.role}`
  const description = profile.summary.replaceAll('**', '')

  return {
    /*
     * Sin metadataBase, Next emite canonical y hreflang como rutas relativas
     * ("/es"), y un buscador no puede resolverlas. Es el requisito del que
     * cuelga todo lo demas de esta seccion.
     */
    metadataBase: new URL(SITE_URL),

    title,
    description,
    applicationName: profile.brand,
    authors: [{ name: profile.fullName, url: profile.socials[0]?.href }],
    keywords: t('keywords').split(', '),

    alternates: {
      canonical: `/${locale}`,
      // hreflang reciproco: sin esto Google trata las dos versiones como
      // contenido duplicado en vez de como traducciones la una de la otra.
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },

    openGraph: {
      type: 'profile',
      locale: locale === 'es' ? 'es_CO' : 'en_US',
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) =>
        l === 'es' ? 'es_CO' : 'en_US',
      ),
      url: `/${locale}`,
      siteName: profile.brand,
      title,
      description,
      // La imagen la genera app/[locale]/opengraph-image.tsx; Next la enlaza
      // sola por convencion de archivo.
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

export const viewport = {
  themeColor: '#00000d',
  colorScheme: 'dark' as const,
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

  const personSchema = buildPersonSchema(getProfile(locale as Locale), locale as Locale)

  /*
   * Solo se serializan al cliente los namespaces que los componentes de
   * cliente necesitan. Por defecto next-intl manda el archivo entero, lo que
   * en la portada significa enviar el aviso de privacidad completo a un
   * navegador que no lo va a mostrar.
   */
  const messages = await getMessages()
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  )

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        {/*
          Va primero en el <body> para ejecutarse antes de que se pinte el
          contenido. Si se retrasara a la hidratacion, cada seccion se veria un
          instante antes de ocultarse para entrar animada.
        */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG_SCRIPT }} />

        {/*
          JSON-LD. El contenido lo construimos nosotros a partir de datos ya
          validados por Zod, no viene de fuera. JSON.stringify escapa las
          comillas; los "<" se escapan aparte porque una cadena que contuviera
          "</script>" cerraria la etiqueta antes de tiempo.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema).replace(/</g, '\\u003c'),
          }}
        />

        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
        <CustomCursor />
      </body>
    </html>
  )
}
