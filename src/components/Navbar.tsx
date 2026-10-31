import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { content } from '../data/content'
import { useActiveSection } from '../hooks/useActiveSection'
import { Logo } from './Logo'
import { ThemeSwitcher } from './ThemeSwitcher'

const nav = content.ui.nav
const links = [
  { id: 'about', label: nav.about },
  { id: 'skills', label: nav.skills },
  { id: 'projects', label: nav.projects },
  { id: 'contact', label: nav.contact },
]
const ids = links.map((l) => l.id)

/** `page="blog"`: bölüm bağlantıları ana sayfaya döner (`/#about`), Blog bağlantısı etkin görünür. */
export function Navbar({ page = 'home' }: { page?: 'home' | 'blog' }) {
  const onHome = page === 'home'
  const prefix = onHome ? '' : '/'
  const section = useActiveSection(ids)
  const active = onHome ? section : 'blog'
  const items = [...links.map((l) => ({ ...l, href: `${prefix}#${l.id}` })), { id: 'blog', label: nav.blog, href: '/blog/' }]
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav
        aria-label={nav.label}
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-3 py-2 transition-all duration-500 sm:px-4 ${
          scrolled || open ? 'bar' : ''
        }`}
      >
        <a
          href={`${prefix}#top`}
          aria-label={`${content.profile.name} — ${nav.home}`}
          className="flex h-10 items-center"
        >
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {items.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative isolate px-4 py-2 text-sm font-medium transition-colors ${
                  active === l.id ? 'text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-4 -bottom-0.5 -z-10 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <button
            type="button"
            className="flex size-10 items-center justify-center text-fg md:hidden"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bar mx-auto mt-2 flex max-w-6xl flex-col p-2 md:hidden"
          >
            {items.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={`block px-4 py-3 text-base font-medium ${
                    active === l.id ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
