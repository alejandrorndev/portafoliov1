import { getTranslations } from 'next-intl/server'
import { getProjects } from '@/content'
import type { Locale } from '@/i18n/config'
import { Reveal, Section, SectionHeading } from '@/shared/ui'
import { ProjectCard } from './ProjectCard'

export async function ProjectsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const projects = getProjects(locale)

  return (
    <Section id="projects" labelledBy="projects-heading" alt>
      <Reveal>
        <SectionHeading
          id="projects-heading"
          tag={t('sections.projects.tag')}
          title={t('sections.projects.title')}
          accent={t('sections.projects.accent')}
        />
      </Reveal>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal as="li" key={project.id} delay={(index % 3) * 90}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
