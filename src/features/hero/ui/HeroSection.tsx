import { getTranslations } from 'next-intl/server'
import { getProfile } from '@/content'
import type { Locale } from '@/i18n/config'
import { Button, GradientText, RichText } from '@/shared/ui'

/**
 * Seccion de portada.
 *
 * El fondo es por ahora la rejilla cosmica y el resplandor inferior en CSS. La
 * escena 3D del agujero negro entra en la Fase 5, montada por encima de esto y
 * con este mismo tratamiento como respaldo cuando WebGL no este disponible o
 * el usuario pida menos movimiento.
 *
 * El texto no depende del fondo: se renderiza en servidor y es el candidato a
 * LCP. En el original quedaba oculto tras un cargador de 1,5 s que simulaba
 * progreso con Math.random().
 */
export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const profile = getProfile(locale)
  const primaryRole = profile.typewriterRoles[0]

  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Rejilla y resplandor: decorativos. */}
      <div aria-hidden="true" className="cosmic-grid absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[rgb(139_92_246/0.15)] via-[rgb(6_182_212/0.08)] to-transparent"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-6 py-24 sm:px-8">
        <div className="max-w-2xl">
          {profile.available ? (
            <p className="border-cyan/30 bg-cyan/5 text-cyan mb-7 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[0.7rem] tracking-[0.2em] uppercase">
              <span aria-hidden="true" className="bg-cyan h-1.5 w-1.5 rounded-full" />
              {profile.location} · {t('hero.availableBadge')}
            </p>
          ) : null}

          <h1
            id="hero-heading"
            className="font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl"
          >
            {profile.displayName.first}
            <br />
            <GradientText>{profile.displayName.last}</GradientText>
          </h1>

          <p className="text-muted mt-4 text-base sm:text-lg">{profile.headline}</p>

          {/*
            El typewriter llega en la Fase 4. Se reserva la altura desde ahora
            para que al activarse no empuje el contenido de abajo.
          */}
          <p className="text-cyan mt-2 min-h-[1.5em] text-base font-semibold sm:text-lg">
            {primaryRole}
          </p>

          <p className="text-muted mt-6 max-w-lg leading-loose">
            <RichText>{profile.summary}</RichText>
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="#projects">{t('hero.viewProjects')}</Button>
            <Button href={profile.socials[0]?.href ?? '#contact'} variant="ghost">
              {t('hero.github')}
            </Button>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="text-muted absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.2em] uppercase sm:flex"
      >
        <span className="from-purple h-10 w-px bg-gradient-to-b to-transparent" />
        {t('hero.scrollHint')}
      </p>
    </section>
  )
}
