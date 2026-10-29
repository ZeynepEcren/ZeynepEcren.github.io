import type { ComponentType, ReactNode } from 'react'

/**
 * Proje kapakları: gerçek ekran görüntüsü yokken kullanılan, temaya göre renk değiştiren çizimler.
 * Renkler CSS değişkenlerinden gelir; koyu temada gece gökyüzü, atlas temasında kâğıt üzerine mürekkep gibi görünür.
 */

const W = 800
const H = 500

/** Sabit ama rastgele görünen yıldızlar (her render'da aynı). */
function stars(count: number, seed: number) {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: count }, () => ({ x: rand() * W, y: rand() * H, r: rand() < 0.1 ? 1.6 : 0.4 + rand() * 0.8, o: 0.3 + rand() * 0.6 }))
}

function Frame({ children, seed }: { children: ReactNode; seed: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width={W} height={H} fill="var(--c-bg-2)" />
      {stars(140, seed).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--c-fg)" opacity={p.o * 0.6} />
      ))}
      {children}
    </svg>
  )
}

/* astro-journey: yörüngeleriyle güneş sistemi, en dışta bir takımyıldız */
function AstroCover() {
  const cx = 400
  const cy = 260
  const planets = [
    { rx: 70, r: 4, a: 0.6 },
    { rx: 105, r: 6, a: 2.4 },
    { rx: 145, r: 7, a: 4.1 },
    { rx: 185, r: 5, a: 1.2 },
    { rx: 240, r: 14, a: 3.3, ring: true },
    { rx: 290, r: 11, a: 5.4 },
    { rx: 335, r: 8, a: 0.2 },
    { rx: 375, r: 8, a: 2.0 },
  ]
  return (
    <Frame seed={7}>
      <g transform={`rotate(-12 ${cx} ${cy})`}>
        {planets.map((p, i) => {
          const ry = p.rx * 0.34
          const x = cx + Math.cos(p.a) * p.rx
          const y = cy + Math.sin(p.a) * ry
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={p.rx} ry={ry} fill="none" stroke="var(--c-accent-2)" strokeOpacity={0.35} strokeWidth={1} />
              <circle cx={x} cy={y} r={p.r} fill={i % 3 === 0 ? 'var(--c-accent-2)' : 'var(--c-fg)'} opacity={0.9} />
              {p.ring && <ellipse cx={x} cy={y} rx={p.r * 2} ry={p.r * 0.55} fill="none" stroke="var(--c-accent)" strokeWidth={1.4} />}
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={34} fill="var(--c-accent)" opacity={0.18} />
        <circle cx={cx} cy={cy} r={22} fill="var(--c-accent)" />
      </g>
      <g stroke="var(--c-accent)" strokeWidth={1} strokeOpacity={0.6} fill="var(--c-accent)">
        <polyline points="60,90 120,60 175,80 210,40 260,58" fill="none" />
        {[[60, 90], [120, 60], [175, 80], [210, 40], [260, 58]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} stroke="none" />
        ))}
      </g>
    </Frame>
  )
}

/* PsycoAI: çocuk çizimi (ev, ağaç, insan) ve üzerinde modelin işaretlediği alanlar */
function PsycoCover() {
  const ink = 'var(--c-fg)'
  return (
    <Frame seed={23}>
      <rect x={190} y={60} width={420} height={380} fill="var(--c-bg)" opacity={0.85} />
      <g fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
        {/* Ev */}
        <path d="M236 300 L236 226 L300 176 L364 226 L364 300 Z" />
        <path d="M286 300 L286 262 L314 262 L314 300" />
        <rect x={250} y={236} width={24} height={20} />
        {/* Ağaç */}
        <path d="M430 300 L432 238 M446 300 L444 238" />
        <path d="M438 240 C400 240 396 196 420 186 C416 160 452 150 462 172 C488 168 494 206 474 222 C478 240 456 246 438 240 Z" />
        {/* İnsan */}
        <circle cx={530} cy={210} r={16} />
        <path d="M530 226 L530 272 M530 240 L508 258 M530 240 L552 256 M530 272 L514 304 M530 272 L546 304" />
        {/* Zemin */}
        <path d="M214 304 C300 298 480 310 590 302" opacity={0.6} />
      </g>
      {/* Model çıktısı: tespit kutuları */}
      <g fill="none" stroke="var(--c-accent)" strokeWidth={1.6} strokeDasharray="7 5">
        <rect x={224} y={164} width={152} height={148} />
        <rect x={392} y={146} width={108} height={166} />
        <rect x={496} y={184} width={70} height={128} />
      </g>
      <g fontFamily="ui-monospace, Menlo, monospace" fontSize={15} fill="var(--c-accent)">
        <text x={224} y={156}>ev</text>
        <text x={392} y={138}>ağaç</text>
        <text x={496} y={176}>insan</text>
      </g>
      <g fontFamily="ui-monospace, Menlo, monospace" fontSize={14} fill="var(--c-accent-2)">
        <text x={214} y={372}>{'> HTP değerlendirmesi'}</text>
        <text x={214} y={396} fill="var(--c-muted)">
          oranlar · yerleşim · ayrıntı düzeyi
        </text>
      </g>
    </Frame>
  )
}

export const projectCovers: Record<string, ComponentType> = {
  'astro-journey': AstroCover,
  psycoai: PsycoCover,
}
