import { createContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { defaultTheme, isThemeId, THEME_STORAGE_KEY, themes, type ThemeDef, type ThemeId } from './themes'

interface ThemeContextValue {
  theme: ThemeDef
  setTheme: (id: ThemeId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeId {
  // Temayı index.html'deki satır içi betik seçip <html data-theme> olarak uygular
  // (her açılışta öncekinden farklı bir tema ya da ?theme= parametresi). React aynısını kullanır.
  const applied = document.documentElement.dataset.theme
  return isThemeId(applied) ? applied : defaultTheme
}

function applyToDocument(theme: ThemeDef) {
  const root = document.documentElement
  root.dataset.theme = theme.id
  root.style.colorScheme = theme.colorScheme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.metaColor)
}

/*
 * Tema, React dışında küçük bir "store"da tutulur. Böylece önceden render edilmiş (SSG) HTML
 * varsayılan temayla hydrate edilir, ardından kayıtlı tema uyumsuzluk hatası olmadan devreye girer.
 * Renkler ise index.html'deki satır içi betik sayesinde ilk boyamada zaten doğrudur.
 */
let current: ThemeId | null = null
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const getSnapshot = () => (current ??= readStoredTheme())
const getServerSnapshot = () => defaultTheme

function applyTheme(id: ThemeId) {
  current = id
  applyToDocument(themes[id])
  listeners.forEach((l) => l())
}

/** Düğmeyle seçim: yalnızca bu ziyaret boyunca geçerli; sonraki ziyarette yine sistem ayarı izlenir. */
function setTheme(id: ThemeId) {
  try {
    sessionStorage.setItem(THEME_STORAGE_KEY, id)
  } catch {
    // yoksay
  }
  applyTheme(id)
}

const SYSTEM_LIGHT = '(prefers-color-scheme: light)'
const systemTheme = (light: boolean): ThemeId => (light ? 'atlas' : 'space')

function hasManualChoice() {
  if (isThemeId(new URLSearchParams(location.search).get('theme'))) return true
  try {
    return isThemeId(sessionStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return false
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const theme = themes[themeId]

  // İlk yüklemede (ör. URL parametresiyle gelen) temayı belgeye uygula.
  useEffect(() => applyToDocument(themes[getSnapshot()]), [])

  // Sayfa açıkken sistemin açık/koyu ayarı değişirse temayı da değiştir (düğmeyle seçim yapılmadıysa).
  useEffect(() => {
    const mql = window.matchMedia?.(SYSTEM_LIGHT)
    if (!mql) return
    const onChange = (e: MediaQueryListEvent) => {
      if (!hasManualChoice()) applyTheme(systemTheme(e.matches))
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
