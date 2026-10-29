import { Reveal } from './Reveal'

interface Props {
  id: string
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ id, eyebrow, title, subtitle }: Props) {
  return (
    <Reveal className="mb-12 max-w-2xl md:mb-16">
      <p className="eyebrow mb-3 flex items-center gap-3 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2 id={id} className="text-3xl font-bold text-fg sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-muted md:text-lg">{subtitle}</p>}
    </Reveal>
  )
}
