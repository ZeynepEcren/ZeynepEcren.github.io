import type { LucideIcon } from 'lucide-react'
import { Moon, ScrollText } from 'lucide-react'

/**
 * Tema kayıt defteri.
 *
 * Bir tema üç katmandan oluşur:
 *  1. Renkler ve tipografi  → `themes.css` içindeki `[data-theme='…']` bloğu (CSS değişkenleri)
 *  2. Efekt karakteri       → aşağıdaki `ThemeDef` (3B uzay sahnesinin görünümü, hareket profili)
 *  3. Görünen ad            → `data/content.ts` içindeki `ui.themes`
 */

export type ThemeId = 'space' | 'atlas'

export interface MotionProfile {
  /** Scroll ile giriş animasyonlarının geçişi. */
  reveal:
    | { type: 'spring'; stiffness: number; damping: number; mass?: number }
    | { type: 'tween'; duration: number; ease: [number, number, number, number] | 'linear' }
  /** Bölümlerin "uzaktan" geldiği derinlik (px, translateZ). */
  depth: number
  /** Girişteki öne eğilme açısı (derece, rotateX). */
  tilt: number
  /** Gruplu girişlerde öğeler arası gecikme (sn). */
  stagger: number
  /** Kartların maksimum 3B eğim açısı (derece). */
  tiltMax: number
}

/** 3B uzay sahnesinin temaya göre görünümü (CSS değişkenleri WebGL'e aktarılamadığı için burada). */
export interface SkyStyle {
  /** 'glow': ışık saçan yıldızlar (koyu zemin), 'ink': kâğıda basılmış mürekkep noktaları (açık zemin). */
  stars: 'glow' | 'ink'
  fog: string
  line: string
  lineOpacity: number
  nebulae: boolean
  /** Gök küresinin enlem/boylam ızgarası. */
  grid: boolean
}

export interface ThemeDef {
  id: ThemeId
  icon: LucideIcon
  colorScheme: 'dark' | 'light'
  /** Mobil tarayıcı adres çubuğu rengi. */
  metaColor: string
  sky: SkyStyle
  motion: MotionProfile
}

const motion: MotionProfile = {
  reveal: { type: 'tween', duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  depth: 360,
  tilt: 14,
  stagger: 0.08,
  tiltMax: 8,
}

export const themes: Record<ThemeId, ThemeDef> = {
  space: {
    id: 'space',
    icon: Moon,
    colorScheme: 'dark',
    metaColor: '#03040a',
    sky: { stars: 'glow', fog: '#03040a', line: '#f4c46a', lineOpacity: 0.35, nebulae: true, grid: false },
    motion,
  },
  atlas: {
    id: 'atlas',
    icon: ScrollText,
    colorScheme: 'light',
    metaColor: '#f2ebdc',
    sky: { stars: 'ink', fog: '#f2ebdc', line: '#9c2f1f', lineOpacity: 0.7, nebulae: false, grid: true },
    motion,
  },
}

export const themeOrder: ThemeId[] = ['space', 'atlas']
export const defaultTheme: ThemeId = 'space'
export const THEME_STORAGE_KEY = 'portfolio-theme'

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && value in themes
