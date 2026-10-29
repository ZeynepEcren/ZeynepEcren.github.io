import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { SocialIcon } from '../components/icons/BrandIcons'
import { Stagger, StaggerItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { content } from '../data/content'

const { profile, sections } = content
const t = content.ui.contact

// Satırda gösterilecek kısa adres: "https://www.github.com/x" → "github.com/x"
const displayUrl = (url: string) => url.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/** Çerçevesiz iletişim satırı: üstte ince çizgi, solda ikon, sağda ok. */
function Row({ icon, label, value, trailing }: { icon: ReactNode; label: string; value: string; trailing?: ReactNode }) {
  return (
    <>
      <span className="flex size-6 shrink-0 items-center justify-center text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs tracking-wider text-muted uppercase">{label}</span>
        <span className="mt-1 block truncate text-lg font-medium text-fg transition-colors group-hover:text-accent">{value}</span>
      </span>
      {trailing}
    </>
  )
}

const rowClass = 'rule group flex h-full items-center gap-5 py-6 transition-transform'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="contact-title"
          eyebrow={sections.contact.eyebrow}
          title={sections.contact.title}
          subtitle={sections.contact.subtitle}
        />

        <Stagger className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          {profile.socials.map((s) => (
            <StaggerItem key={s.kind}>
              <a
                href={s.url}
                target={s.kind === 'email' ? undefined : '_blank'}
                rel="noreferrer noopener"
                className={`${rowClass} hover:translate-x-1.5`}
              >
                <Row
                  icon={<SocialIcon kind={s.kind} size={22} />}
                  label={s.label}
                  value={displayUrl(s.url)}
                  trailing={
                    <ArrowUpRight
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  }
                />
              </a>
            </StaggerItem>
          ))}
          <StaggerItem>
            <div className={rowClass}>
              <Row icon={<MapPin size={22} aria-hidden="true" />} label={t.location} value={profile.location} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <a href={profile.cv} download className={`${rowClass} hover:translate-x-1.5`}>
              <Row
                icon={<ArrowDown size={22} aria-hidden="true" />}
                label={t.cvLabel}
                value={t.cvAction}
                trailing={<ArrowDown size={20} aria-hidden="true" className="shrink-0 text-muted transition-transform group-hover:translate-y-0.5 group-hover:text-accent" />}
              />
            </a>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
