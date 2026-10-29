import { motion, useSpring } from 'framer-motion'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../hooks/useMediaQuery'

/** İçindeki buton/linkin imlece doğru hafifçe çekilmesini sağlar. */
export function Magnetic({ children, strength = 0.3, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced
  const x = useSpring(0, { stiffness: 250, damping: 18, mass: 0.5 })
  const y = useSpring(0, { stiffness: 250, damping: 18, mass: 0.5 })

  const handleMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  )
}
