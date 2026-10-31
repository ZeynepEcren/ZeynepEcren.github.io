/**
 * Blog yazıları: `src/blog/posts/` klasöründeki her `.md` dosyası bir yazıdır, dosya adı adresidir
 * (`ilk-yazim.md` → `/blog/ilk-yazim/`). Dosyanın başındaki `---` blokları arasında yazının bilgileri durur:
 *
 *   ---
 *   title: Yazının başlığı
 *   date: 2026-11-01
 *   summary: Listede ve paylaşım kartında görünen bir-iki cümle.
 *   tags: React, Three.js
 *   draft: true            (isteğe bağlı: yalnızca geliştirmede görünür, yayına çıkmaz)
 *   ---
 */
import { marked } from 'marked'

export interface Post {
  slug: string
  title: string
  /** YYYY-MM-DD */
  date: string
  summary: string
  tags: string[]
  draft: boolean
  html: string
  readingMinutes: number
}

const files = import.meta.glob<string>('./posts/*.md', { query: '?raw', import: 'default', eager: true })

/** `key: value` satırlarından oluşan basit ön bilgi bloğunu ayırır. */
function parse(raw: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  const meta: Record<string, string> = {}
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return { meta, body: match ? raw.slice(match[0].length) : raw }
}

function toPost(path: string, raw: string): Post {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { meta, body } = parse(raw)
  const words = body.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    summary: meta.summary || '',
    tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    draft: meta.draft === 'true',
    html: marked.parse(body, { async: false }),
    readingMinutes: Math.max(1, Math.round(words / 200)),
  }
}

/** Yeniden eskiye sıralı yazılar; taslaklar yalnızca geliştirme sunucusunda listelenir. */
export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => toPost(path, raw))
  .filter((p) => import.meta.env.DEV || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string) => posts.find((p) => p.slug === slug)

/** "2026-11-01" → "1 Kasım 2026". Saat dilimi farkı tarihi kaydırmasın diye UTC kullanılır. */
export const formatDate = (date: string) =>
  date
    ? new Date(`${date}T00:00:00Z`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : ''

/** `/blog/`, `/blog/yazi/` gibi bir adresten yazı adını çıkarır; liste sayfasında `null`. */
export function slugFromPath(path: string) {
  const rest = path.replace(/\/index\.html$/, '/').replace(/^\/blog\/?/, '').replace(/\/+$/, '')
  return rest ? decodeURIComponent(rest) : null
}
