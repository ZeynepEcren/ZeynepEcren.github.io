import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { MotionProfile } from '../themes/themes'

type Direction = 'up' | 'left' | 'right' | 'none'

function offset(direction: Direction) {
  if (direction === 'left') return { x: -40 }
  if (direction === 'right') return { x: 40 }
  if (direction === 'up') return { y: 40 }
  return {}
}

/** Öğeler uzaktan (eksi Z) ve hafif öne eğik gelip yerine oturur: uzay sahnesindeki derinlik hissini sürdürür. */
function itemVariants(m: MotionProfile, direction: Direction = 'up'): Variants {
  return {
    hidden: { opacity: 0, z: -m.depth, rotateX: m.tilt, transformPerspective: 1200, ...offset(direction) },
    show: { opacity: 1, z: 0, rotateX: 0, x: 0, y: 0, transition: m.reveal },
  }
}

interface RevealProps {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
}

/** Scroll ile görünür olduğunda temanın hareket profiline göre beliren blok. */
export function Reveal({ children, className, direction = 'up', delay = 0 }: RevealProps) {
  const { theme } = useTheme()
  const variants = itemVariants(theme.motion, direction)
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ ...theme.motion.reveal, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Çocuk `StaggerItem`'ları sırayla (staggered) gösteren kapsayıcı. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const { theme } = useTheme()
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: theme.motion.stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, direction }: { children: ReactNode; className?: string; direction?: Direction }) {
  const { theme } = useTheme()
  return (
    <motion.div className={className} variants={itemVariants(theme.motion, direction)}>
      {children}
    </motion.div>
  )
}
