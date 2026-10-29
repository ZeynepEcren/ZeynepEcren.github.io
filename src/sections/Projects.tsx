import { ArrowUpRight, Brain, ExternalLink, Globe, type LucideIcon } from 'lucide-react'
import { useCallback, useState, type MouseEvent } from 'react'
import { GithubIcon } from '../components/icons/BrandIcons'
import { Modal } from '../components/Modal'
import { projectCovers } from '../components/ProjectCovers'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { TiltCard } from '../components/TiltCard'
import { content, type Project, type ProjectCategory } from '../data/content'

const { sections, projects } = content
const t = content.ui.projects
const categoryIcons: Record<ProjectCategory, LucideIcon> = { web: Globe, ai: Brain }

function ProjectImage({ project, className = '' }: { project: Project; className?: string }) {
  if (project.image) {
    return <img src={project.image} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />
  }
  const Cover = projectCovers[project.id]
  if (Cover) {
    return (
      <div className={`h-full w-full ${className}`}>
        <Cover />
      </div>
    )
  }
  const Icon = categoryIcons[project.category]
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--c-accent) 45%, transparent), transparent 55%), radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--c-accent-2) 40%, transparent), transparent 55%), var(--c-bg-2)',
      }}
    >
      <div className="terminal-grid absolute inset-0 opacity-60" />
      <Icon size={56} strokeWidth={1.25} className="relative text-fg/80" />
    </div>
  )
}

function ProjectLinks({ project, size = 'sm' }: { project: Project; size?: 'sm' | 'lg' }) {
  const stop = (e: MouseEvent) => e.stopPropagation()
  if (size === 'lg') {
    return (
      <div className="flex flex-wrap items-center gap-6">
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer noopener" className="btn btn-ghost">
            <GithubIcon size={18} /> {t.github}
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noreferrer noopener" className="btn btn-primary">
            <ExternalLink size={18} aria-hidden="true" /> {t.demo}
          </a>
        )}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1">
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer noopener"
          onClick={stop}
          aria-label={`${project.title} — ${t.github}`}
          className="flex size-9 items-center justify-center text-muted transition-colors hover:text-accent"
        >
          <GithubIcon size={18} />
        </a>
      )}
      {project.demo && (
        <a
          href={project.demo}
          target="_blank"
          rel="noreferrer noopener"
          onClick={stop}
          aria-label={`${project.title} — ${t.demo}`}
          className="flex size-9 items-center justify-center text-muted transition-colors hover:text-accent"
        >
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (p: Project) => void }) {
  return (
    <TiltCard glare={false} className="group flex h-full cursor-pointer flex-col" onClick={() => onOpen(project)}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <ProjectImage project={project} className="transition-transform duration-700 group-hover:scale-105" />
        <span className="chip bar absolute top-0 left-0 px-3 py-1.5">{t.categories[project.category]}</span>
      </div>
      <div className="flex flex-1 flex-col pt-6" style={{ transform: 'translateZ(30px)' }}>
        {project.year && <span className="font-mono text-xs text-muted">{project.year}</span>}
        <h3 className="mt-1 text-2xl font-semibold text-fg transition-colors group-hover:text-accent">{project.title}</h3>
        <p className="mt-3 text-base leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1" aria-label={t.tech}>
          {project.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(project)
            }}
            aria-haspopup="dialog"
            className="flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t.details}
            <span className="sr-only">: {project.title}</span>
            <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <ProjectLinks project={project} />
        </div>
      </div>
    </TiltCard>
  )
}

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)
  const openProject = useCallback((p: Project) => {
    setSelected(p)
    setOpen(true)
  }, [])
  // Proje içeriği kapanış animasyonu bitene kadar ekranda kalsın diye yalnızca `open` sıfırlanır.
  const close = useCallback(() => setOpen(false), [])

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="projects-title"
          eyebrow={sections.projects.eyebrow}
          title={sections.projects.title}
          subtitle={sections.projects.subtitle}
        />

        <ul className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
          {projects.map((project, i) => (
            <li key={project.id}>
              <Reveal delay={i * 0.1} className="h-full">
                <ProjectCard project={project} onOpen={openProject} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} onClose={close} labelledBy="project-modal-title" closeLabel={t.close}>
        {selected && (
          <article>
            <div className="aspect-[16/8] overflow-hidden">
              <ProjectImage project={selected} />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="chip">{t.categories[selected.category]}</span>
                {selected.year && <span className="font-mono text-muted">{selected.year}</span>}
              </div>
              <h3 id="project-modal-title" className="mt-3 text-2xl font-bold text-fg sm:text-3xl">
                {selected.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted">{selected.description}</p>

              {selected.highlights.length > 0 && (
                <>
                  <h4 className="mt-6 mb-3 font-semibold text-fg">{t.highlights}</h4>
                  <ul className="space-y-2">
                    {selected.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-muted">
                        <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className="mt-6 mb-3 font-semibold text-fg">{t.tech}</h4>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {selected.tags.map((tag) => (
                  <li key={tag} className="chip">
                    {tag}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ProjectLinks project={selected} size="lg" />
              </div>
            </div>
          </article>
        )}
      </Modal>
    </section>
  )
}
