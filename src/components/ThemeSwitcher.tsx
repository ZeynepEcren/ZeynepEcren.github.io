import { content } from '../data/content'
import { useTheme } from '../hooks/useTheme'
import { themeOrder, themes } from '../themes/themes'

const t = content.ui.themes

/** Koyu (uzay) ve açık (yıldız atlası) tema arasında geçiş yapan düğme. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const next = themes[themeOrder[(themeOrder.indexOf(theme.id) + 1) % themeOrder.length]]
  const NextIcon = next.icon

  return (
    <button
      type="button"
      onClick={() => setTheme(next.id)}
      aria-label={`${t.label}: ${t.names[next.id]}`}
      title={t.names[next.id]}
      className="flex h-10 items-center gap-2 px-2 text-sm font-medium text-muted transition-colors hover:text-accent"
    >
      <NextIcon size={18} aria-hidden="true" />
      <span className="hidden sm:inline">{t.names[next.id]}</span>
    </button>
  )
}
