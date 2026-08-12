import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { AboutSection } from '@/features/about'
import { ContactSection } from '@/features/contact'
import { ExperienceSection } from '@/features/experience'
import { SiteFooter } from '@/features/footer'
import { HeroSection } from '@/features/hero'
import { SiteHeader } from '@/features/navigation'
import { ProjectsSection } from '@/features/projects'
import { SkillsSection } from '@/features/skills'

/*
 * La pagina solo compone. Toda la logica y el markup de cada seccion viven en
 * su feature, y aqui solo se ve el orden en que aparecen.
 */
export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <SiteHeader locale={locale} />

      {/* Destino del enlace "saltar al contenido". */}
      <main id="main">
        <HeroSection locale={locale} />
        <AboutSection locale={locale} />
        <SkillsSection locale={locale} />
        <ProjectsSection locale={locale} />
        <ExperienceSection locale={locale} />
        <ContactSection locale={locale} />
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
