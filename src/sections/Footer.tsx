import { ArrowUp } from 'lucide-react'
import { SocialIcon } from '../components/icons/BrandIcons'
import { Magnetic } from '../components/Magnetic'
import { content } from '../data/content'

const { profile, ui } = content

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-heading font-semibold text-fg">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {ui.footer.rights} {ui.footer.builtWith}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ul className="flex gap-2" aria-label={ui.contact.socialsLabel}>
            {profile.socials.map((s) => (
              <li key={s.kind}>
                <a
                  href={s.url}
                  target={s.kind === 'email' ? undefined : '_blank'}
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="group/social relative flex size-10 items-center justify-center text-muted transition-colors hover:text-accent"
                >
                  <SocialIcon kind={s.kind} size={18} />
                  <span
                    aria-hidden="true"
                    className="bar pointer-events-none absolute left-1/2 bottom-full mb-1 -translate-x-1/2 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-fg opacity-0 transition-opacity group-hover/social:opacity-100 group-focus-visible/social:opacity-100"
                  >
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Magnetic>
            <a href="#top" aria-label={ui.footer.backToTop} className="flex size-11 items-center justify-center text-muted transition-colors hover:text-accent">
              <ArrowUp size={18} aria-hidden="true" />
            </a>
          </Magnetic>
        </div>
      </div>
    </footer>
  )
}
