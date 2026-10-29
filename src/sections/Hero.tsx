import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { SocialIcon } from '../components/icons/BrandIcons'
import { Magnetic } from '../components/Magnetic'
import { content } from '../data/content'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { useTypewriter } from '../hooks/useTypewriter'

const { profile, ui } = content

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } },
}
// Büyük metin blokları (LCP adayları) görünmez başlamaz; yalnızca kayarak girer, böylece LCP gecikmez.
const textItem: Variants = {
  hidden: { y: 24 },
  show: { y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } },
}

/** Harf harf derinlikten gelen isim; soyadı vurgu renginde. */
function AnimatedName({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span aria-hidden="true" className="inline-block">
      {words.map((word, wi) => (
        <span key={wi} className={`mr-[0.25em] inline-block whitespace-nowrap last:mr-0 ${wi === words.length - 1 ? 'text-accent' : 'text-fg'}`}>
          {Array.from(word).map((ch, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ opacity: 0, z: -200, rotateX: -70 }}
              animate={{ opacity: 1, z: 0, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.15 + (wi * 6 + ci) * 0.035 }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const role = useTypewriter(profile.roles, { enabled: !reduced })

  // Kaydırınca içerik geriye (uzaya doğru) çekilip kaybolur
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentZ = useTransform(scrollYProgress, [0, 1], [0, -400])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} id="top" aria-label={profile.name} className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <motion.div
        style={reduced ? undefined : { z: contentZ, opacity: contentOpacity, transformPerspective: 1200 }}
        className="mx-auto w-full max-w-6xl px-4 pt-28 pb-24 sm:px-6"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
          <motion.p variants={item} className="mb-4 font-mono text-sm tracking-[0.18em] text-accent uppercase">
            {ui.hero.greeting}
          </motion.p>

          <h1 className="text-5xl leading-[1] font-bold sm:text-6xl lg:text-8xl" style={{ perspective: 600 }}>
            <span className="sr-only">{profile.name}</span>
            <AnimatedName text={profile.name} />
          </h1>

          <motion.p variants={textItem} className="mt-6 text-xl font-semibold text-fg sm:text-2xl">
            {profile.title}
          </motion.p>

          <motion.p variants={item} className="mt-3 h-8 font-mono text-base text-accent-2 sm:text-lg">
            <span className="sr-only">{ui.hero.rolesLabel}: {profile.roles.join(', ')}</span>
            <span aria-hidden="true">
              {'> '}
              <span className="caret">{role}</span>
            </span>
          </motion.p>

          <motion.p variants={textItem} className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {profile.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <a href="#projects" className="btn btn-primary">
                {ui.hero.ctaProjects}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </Magnetic>
            <a href="#contact" className="btn btn-ghost">
              {ui.hero.ctaContact}
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-10 flex items-center gap-5" aria-label={ui.contact.socialsLabel}>
            {profile.socials.map((s) => (
              <li key={s.kind}>
                <a
                  href={s.url}
                  target={s.kind === 'email' ? undefined : '_blank'}
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="group/social relative flex size-8 items-center justify-center text-muted transition-colors hover:text-accent"
                >
                  <SocialIcon kind={s.kind} />
                  <span
                    aria-hidden="true"
                    className="bar pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-fg opacity-0 transition-opacity group-hover/social:opacity-100 group-focus-visible/social:opacity-100"
                  >
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg sm:flex"
      >
        <span>{ui.hero.scrollHint}</span>
        <span aria-hidden="true" className="animate-drop block h-9 w-px bg-gradient-to-b from-accent to-transparent" />
      </a>
    </section>
  )
}
