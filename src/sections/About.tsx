import { Info, Mail, MapPin } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { content } from '../data/content'

const { profile, sections } = content

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="about-title" eyebrow={sections.about.eyebrow} title={sections.about.title} />

        <div className="max-w-3xl">
          {sections.about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="mb-5 text-lg leading-relaxed text-muted">{p}</p>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <li className="flex items-center gap-2 text-fg">
                <MapPin size={16} className="text-accent" aria-hidden="true" />
                {profile.location}
              </li>
              <li>
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-fg transition-colors hover:text-accent">
                  <Mail size={16} className="text-accent" aria-hidden="true" />
                  {profile.email}
                </a>
              </li>
            </ul>
          </Reveal>

          <Stagger className="rule mt-12 grid grid-cols-3 gap-6 pt-8">
            {sections.about.stats.map((s, i, all) => {
              const number = (
                <>
                  <span className="block font-heading text-4xl font-bold text-accent sm:text-5xl">{s.value}</span>
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-muted sm:text-sm">
                    {s.label}
                    {s.details && <Info size={13} aria-hidden="true" className="opacity-60 transition-opacity group-hover:opacity-100" />}
                  </span>
                </>
              )
              if (!s.details) return <StaggerItem key={s.label}>{number}</StaggerItem>

              // Panel, satırdaki konumuna göre hizalanır ki ekran kenarından taşmasın
              const align = i === 0 ? 'left-0' : i === all.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
              const panelId = `stat-details-${i}`
              return (
                <StaggerItem key={s.label} className="relative">
                  {/* Masaüstünde üzerine gelince, klavyede odaklanınca, dokunmatikte dokununca açılır */}
                  <button type="button" aria-describedby={panelId} className="group peer cursor-help text-left">
                    {number}
                  </button>
                  <div
                    id={panelId}
                    role="tooltip"
                    className={`bar pointer-events-none invisible absolute top-full z-20 mt-4 w-72 max-w-[80vw] border-t border-accent px-5 py-4 opacity-0 transition-all duration-300 peer-hover:visible peer-hover:opacity-100 peer-focus-visible:visible peer-focus-visible:opacity-100 peer-focus:visible peer-focus:opacity-100 ${align}`}
                  >
                    <ul className="space-y-3">
                      {s.details.map((d) => (
                        <li key={d.title}>
                          <span className="block text-sm font-semibold text-fg">{d.title}</span>
                          <span className="mt-0.5 block text-xs text-muted">{d.meta}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
