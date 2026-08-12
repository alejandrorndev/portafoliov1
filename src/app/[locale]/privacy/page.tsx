import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { GradientText } from '@/shared/ui'

type LocaleParams = { locale: string }

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

  const t = await getTranslations({ locale, namespace: 'privacy' })

  return {
    title: t('title'),
    description: t('intro'),
    // Una pagina legal no aporta nada a los resultados de busqueda y compite
    // con la portada. Se sirve, pero no se indexa.
    robots: { index: false, follow: true },
  }
}

/**
 * Aviso de privacidad.
 *
 * Existe porque el formulario de contacto recoge datos personales. En Colombia
 * aplica la Ley 1581 de 2012 de habeas data, que exige informar de la
 * finalidad del tratamiento y de los derechos del titular.
 *
 * No es asesoría jurídica: es el mínimo razonable para un portafolio personal
 * con un formulario de contacto.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('privacy')
  const profile = getProfile(locale)

  const sections = ['controller', 'data', 'purpose', 'retention', 'rights', 'thirdParties'] as const

  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
      <Link href="/" className="text-muted hover:text-cyan text-xs tracking-widest uppercase">
        ← {profile.brand}
      </Link>

      <h1 className="font-display mt-8 text-3xl font-bold sm:text-4xl">
        <GradientText>{t('title')}</GradientText>
      </h1>

      <p className="text-muted mt-6 leading-loose">{t('intro')}</p>

      <div className="mt-10 space-y-8">
        {/*
          Cada <section> se nombra con su propio <h2>. Un landmark sin nombre
          accesible no aporta nada: un lector de pantalla lista seis
          "secciones" indistinguibles en vez de permitir saltar a "Tus
          derechos".
        */}
        {sections.map((section) => (
          <section key={section} aria-labelledby={`${section}-heading`}>
            <h2 id={`${section}-heading`} className="font-display text-lg font-bold">
              {t(`${section}.title`)}
            </h2>
            <p className="text-muted mt-2 leading-loose">
              {t(`${section}.body`, { email: profile.email })}
            </p>
          </section>
        ))}
      </div>

      <p className="text-muted mt-12 text-xs">{t('updated')}</p>
    </main>
  )
}
