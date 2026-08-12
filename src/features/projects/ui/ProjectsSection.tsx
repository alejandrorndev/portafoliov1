import { getTranslations } from 'next-intl/server'
import { getProjects } from '@/content'
import type { Locale } from '@/i18n/config'
import { Section, SectionHeading } from '@/shared/ui'
import { ProjectCard } from './ProjectCard'

export async function ProjectsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const projects = getProjects(locale)

  return (
    <Section id="projects" labelledBy="projects-heading" alt>
      <SectionHeading
        id="projects-heading"
        tag={t('sections.projects.tag')}
        title={t('sections.projects.title')}
        accent={t('sections.projects.accent')}
      />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
