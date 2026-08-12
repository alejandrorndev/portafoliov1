import { useTranslations } from 'next-intl'
import type { ResolvedProject } from '@/content'
import { Card, Tag } from '@/shared/ui'

export function ProjectCard({ project }: { project: ResolvedProject }) {
  const t = useTranslations()

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="relative flex h-40 items-center justify-center text-5xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${project.gradient[0]}, ${project.gradient[1]})`,
        }}
      >
        <span className="absolute inset-0 bg-black/75" />
        <span className="relative drop-shadow-[0_0_14px_rgb(139_92_246/0.6)]">{project.icon}</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-purple text-[0.67rem] tracking-[0.2em] uppercase">{project.type}</p>
        <h3 className="font-display mt-2 text-lg font-bold">{project.title}</h3>
        <p className="text-muted mt-2.5 text-sm leading-relaxed">{project.description}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex gap-5 pt-5">
          {project.links.demo ? (
            <ProjectLink href={project.links.demo} label={t('projects.demo')} title={project.title}>
              🌐
            </ProjectLink>
          ) : null}
          {project.links.github ? (
            <ProjectLink
              href={project.links.github}
              label={t('projects.sourceCode')}
              title={project.title}
            >
              ⌥
            </ProjectLink>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

/**
 * En el original los enlaces decian solo "Demo" y "GitHub", repetidos seis
 * veces. Un lector de pantalla que liste los enlaces de la pagina anunciaba
 * doce destinos indistinguibles. El nombre del proyecto va en el texto
 * accesible para que cada enlace se identifique solo.
 */
function ProjectLink({
  href,
  label,
  title,
  children,
}: {
  href: string
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted hover:text-cyan flex items-center gap-1.5 text-sm transition-colors"
    >
      <span aria-hidden="true">{children}</span>
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{`${label} — ${title}`}</span>
    </a>
  )
}
