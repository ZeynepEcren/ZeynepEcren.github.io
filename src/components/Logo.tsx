/**
 * Logo: vurgu renginde dört köşeli bir yıldız ve küçük harflerle "zeynep ecren".
 * Üzerine gelince yıldız dönüp parlar. Renkler temadan gelir (koyu temada altın, atlas temasında bordo).
 */

/** Dört köşeli parıltı yıldızı (cx, cy merkezli, r yarıçaplı). */
function sparkle(cx: number, cy: number, r: number) {
  const k = r * 0.28
  return `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`
}

export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" className="shrink-0 overflow-visible">
      <path d={sparkle(10, 10, 10)} fill="var(--c-accent)" className="logo-star" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="group/logo flex items-center gap-2.5 text-fg">
      <LogoMark />
      <span className="font-heading text-lg leading-none font-medium tracking-[-0.01em] whitespace-nowrap" aria-hidden="true">
        zeynep ecren
      </span>
    </span>
  )
}
