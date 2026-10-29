import { animate, motion, MotionConfig, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { ArrowLeft, ArrowRight, Home } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Logo } from './components/Logo'
import { Magnetic } from './components/Magnetic'
import { SpaceBackground } from './components/SpaceBackground'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { content } from './data/content'
import { usePrefersReducedMotion } from './hooks/useMediaQuery'

const { profile, ui } = content
const t = ui.notFound

interface EyeProps {
  eyeRef: RefObject<HTMLSpanElement | null>
  px: MotionValue<number>
  py: MotionValue<number>
  lid: MotionValue<number>
}

/** "404"teki sıfırın yerine geçen göz: iris imleci izler, göz arada bir kırpılır. */
function Eye({ eyeRef, px, py, lid }: EyeProps) {
  return (
    <span
      ref={eyeRef}
      className="relative inline-block h-[0.74em] w-[0.6em] rounded-[50%] p-[0.075em]"
      style={{ background: 'linear-gradient(140deg, var(--c-accent), var(--c-accent-2))' }}
    >
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-[50%] bg-white">
        <motion.span className="flex size-full items-center justify-center" style={{ scaleY: lid }}>
          <motion.span
            className="relative size-[0.24em] rounded-full"
            style={{
              x: px,
              y: py,
              background: 'radial-gradient(circle at 50% 50%, #14121c 0 34%, var(--c-accent) 38%, var(--c-accent-2) 100%)',
            }}
          >
            <span className="absolute top-[18%] left-[22%] size-[22%] rounded-full bg-white/90" />
          </motion.span>
        </motion.span>
      </span>
    </span>
  )
}

function useEye(reduced: boolean) {
  const eye = useRef<HTMLSpanElement>(null)
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const spring = { stiffness: 220, damping: 20, mass: 0.6 }
  const px = useSpring(tx, spring)
  const py = useSpring(ty, spring)
  const lid = useMotionValue(1)

  useEffect(() => {
    // İris, imlecin yönüne kayar; imleç uzaklaştıkça göz kenarına kadar gider.
    const lookAt = (x: number, y: number) => {
      const el = eye.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = x - (r.left + r.width / 2)
      const dy = y - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 220)
      const em = parseFloat(getComputedStyle(el).fontSize)
      tx.set((dx / d) * k * em * 0.1)
      ty.set((dy / d) * k * em * 0.16)
    }
    let lastMove = 0
    const onMove = (e: PointerEvent) => {
      lastMove = performance.now()
      lookAt(e.clientX, e.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    if (reduced) return () => window.removeEventListener('pointermove', onMove)

    // İmleç yokken (dokunmatik cihazlar ya da fare durduğunda) göz etrafa bakınır.
    const wander = window.setInterval(() => {
      if (performance.now() - lastMove < 2500) return
      const a = Math.random() * Math.PI * 2
      const em = eye.current ? parseFloat(getComputedStyle(eye.current).fontSize) : 100
      tx.set(Math.cos(a) * em * 0.1 * Math.random())
      ty.set(Math.sin(a) * em * 0.16 * Math.random())
    }, 1800)

    // Rastgele aralıklarla göz kırpma (ara sıra çift kırpma).
    let blinkTimer = 0
    const blink = () => {
      const twice = Math.random() < 0.25
      animate(lid, twice ? [1, 0.08, 1, 0.08, 1] : [1, 0.08, 1], { duration: twice ? 0.42 : 0.2, ease: 'easeInOut' })
      blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 3200)
    }
    blinkTimer = window.setTimeout(blink, 1400)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.clearInterval(wander)
      window.clearTimeout(blinkTimer)
    }
  }, [reduced, tx, ty, lid])

  return { eye, px, py, lid }
}

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 110, damping: 18 } },
}

export default function NotFound() {
  const reduced = usePrefersReducedMotion()
  const { eye, px, py, lid } = useEye(reduced)
  const [path, setPath] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    document.title = `${t.metaTitle} | ${profile.name}`
    document.documentElement.lang = content.meta.lang
    setPath(decodeURI(window.location.pathname))
    setCanGoBack(window.history.length > 1 && document.referrer.startsWith(window.location.origin))
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <SpaceBackground />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4">
          <a
            href="/"
            aria-label={`${profile.name} — ${t.home}`}
            className="flex h-10 items-center"
          >
            <Logo />
          </a>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="relative flex min-h-[100svh] items-center justify-center px-4 py-28 sm:px-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          className="flex max-w-xl flex-col items-center text-center"
        >
          <h1>
            <span className="sr-only">
              {t.code} — {t.title}
            </span>
            <motion.span
              aria-hidden="true"
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } } }}
              className="flex items-center gap-[0.05em] font-heading text-[clamp(7rem,30vw,13rem)] leading-none font-bold"
            >
              <span className="text-accent">4</span>
              <Eye eyeRef={eye} px={px} py={py} lid={lid} />
              <span className="text-accent">4</span>
            </motion.span>
          </h1>

          <motion.p variants={rise} className="mt-6 font-heading text-3xl font-bold text-fg sm:text-4xl">
            {t.title}
          </motion.p>

          {path && path !== '/' && (
            <motion.p variants={rise} className="chip mt-4 max-w-full">
              <span className="truncate">
                <span className="text-accent-2">GET</span> {path} <span className="text-muted">→ 404</span>
              </span>
            </motion.p>
          )}

          <motion.p variants={rise} className="mt-5 text-base text-muted sm:text-lg">
            {t.message}
          </motion.p>

          <motion.div variants={rise} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <a href="/" className="btn btn-primary">
                <Home size={18} aria-hidden="true" />
                {t.home}
              </a>
            </Magnetic>
            <Magnetic>
              <a href="/#projects" className="btn btn-ghost">
                {t.projects}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>

          {canGoBack && (
            <motion.button
              variants={rise}
              type="button"
              onClick={() => window.history.back()}
              className="mt-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t.back}
            </motion.button>
          )}
        </motion.div>
      </main>
    </MotionConfig>
  )
}
