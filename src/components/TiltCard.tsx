import { motion, useMotionTemplate, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'

type Props = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children?: ReactNode
  /** Maksimum eğim; verilmezse temanın değeri kullanılır. */
  max?: number
  glare?: boolean
}

/** İmlece göre 3B eğilen ve üzerinde ışık yansıması gezen kart. Dokunmatikte ve azaltılmış harekette düz kalır. */
export function TiltCard({ children, className = '', max, glare = true, style, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced
  const limit = max ?? theme.motion.tiltMax

  const spring = { stiffness: 220, damping: 22, mass: 0.6 }
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 30 })
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--c-accent-2) 30%, transparent), transparent 60%)`

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 2 * limit)
    rotateX.set(-(py - 0.5) * 2 * limit)
    gx.set(px * 100)
    gy.set(py * 100)
    glareOpacity.set(1)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, ...style }}
      className={`relative ${className}`}
      {...rest}
    >
      {children}
      {glare && enabled && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  )
}
