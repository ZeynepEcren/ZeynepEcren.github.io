/**
 * Yeni yazı duyurusu e-postası (scripts/notify-subscribers.mjs kullanır).
 * Amaç okuru yazıya çekmek: kısa kişisel giriş, okuma süresi, yazıdan bir bölüm, "bu yazıda neler var"
 * başlıkları ve belirgin bir "devamını oku" butonu. E-posta istemcileri için tablo düzeni ve satır içi stiller.
 *
 * Önizleme: node scripts/newsletter-email.mjs <yazı-adı> > onizleme.html
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// Sitenin "Yıldız atlası" teması
const C = {
  page: '#ebe3d2',
  card: '#f8f3e8',
  fg: '#1b1f38',
  muted: '#5b5a6e',
  accent: '#9c2f1f',
  accent2: '#1f3f8a',
  line: '#ddd3bf',
}
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const SANS = "'Manrope', 'Segoe UI', Helvetica, Arial, sans-serif"

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/** Markdown satır içi işaretlerini kaldırır: **kalın**, *eğik*, `kod`, [bağlantı](adres). */
const plain = (s) =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .trim()

/** Ön bilgi bloğunu ve gövdeyi ayırır (src/blog/posts.ts ile aynı biçim). */
export function parsePost(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  const meta = {}
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return { meta, body: match ? raw.slice(match[0].length) : raw }
}

function analyse(body) {
  const blocks = body.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean)
  const isText = (b) => !/^(#|[-*+] |\d+\. |>|```|\||!\[)/.test(b)
  // İlk paragraf; çok kısaysa ikincisiyle birlikte. ~320 karakterde kelime sınırından kesilir.
  let excerpt = blocks.filter(isText).slice(0, 2).map(plain).join(' ')
  if (excerpt.length > 320) excerpt = excerpt.slice(0, 320).replace(/\s+\S*$/, '') + '…'
  const headings = body
    .split(/\r?\n/)
    .filter((l) => /^##\s+/.test(l))
    .map((l) => plain(l.replace(/^##\s+/, '')))
    .slice(0, 5)
  const words = plain(body.replace(/```[\s\S]*?```/g, '')).split(/\s+/).filter(Boolean).length
  return { excerpt, headings, minutes: Math.max(1, Math.round(words / 200)) }
}

const formatDate = (date) =>
  date ? new Date(`${date}T00:00:00Z`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : ''

/** { subject, previewText, html } */
export function buildEmail({ meta, body, url, siteUrl }) {
  const title = meta.title || ''
  const summary = meta.summary || ''
  const tags = meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const { excerpt, headings, minutes } = analyse(body)
  const link = `${url}?utm_source=bulten&utm_medium=email`
  const facts = [formatDate(meta.date), `${minutes} dakikalık okuma`].filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;')

  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${escape(title)}</title>
<style>
  @media (max-width: 600px) {
    .pad { padding-left: 24px !important; padding-right: 24px !important; }
    .title { font-size: 30px !important; }
    .btn a { display: block !important; }
  }
  a { color: ${C.accent}; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page}">${escape(summary)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}">
<tr><td align="center" style="padding:28px 12px 40px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

  <!-- Logo -->
  <tr><td class="pad" style="padding:0 40px 20px;font-family:${SERIF};font-size:22px;color:${C.fg}">
    <a href="${siteUrl}/?utm_source=bulten&amp;utm_medium=email" style="color:${C.fg};text-decoration:none"><span style="color:${C.accent}">&#10022;</span>&nbsp;zeynep ecren</a>
  </td></tr>

  <tr><td style="background:${C.card};border-top:3px solid ${C.accent}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

    <!-- Giriş -->
    <tr><td class="pad" style="padding:36px 40px 0;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.fg}">
      <p style="margin:0 0 6px">Merhaba,</p>
      <p style="margin:0">Bloguma yeni bir yazı ekledim. İlgini çekeceğini düşündüm; kahveni alıp ${minutes} dakika ayırabilirsen çok sevinirim.</p>
    </td></tr>

    <!-- Başlık -->
    <tr><td class="pad" style="padding:32px 40px 0">
      <p style="margin:0 0 12px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.accent}">Yeni yazı</p>
      <h1 class="title" style="margin:0;font-family:${SERIF};font-size:36px;line-height:1.15;font-weight:600;color:${C.fg}">
        <a href="${link}" style="color:${C.fg};text-decoration:none">${escape(title)}</a>
      </h1>
      <p style="margin:14px 0 0;font-family:${SANS};font-size:13px;letter-spacing:.5px;color:${C.muted}">${facts}</p>
      ${summary ? `<p style="margin:18px 0 0;font-family:${SANS};font-size:18px;line-height:1.6;color:${C.fg}">${escape(summary)}</p>` : ''}
    </td></tr>

    ${
      excerpt
        ? `<!-- Yazıdan bir bölüm -->
    <tr><td class="pad" style="padding:28px 40px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="border-left:3px solid ${C.accent};padding:4px 0 4px 18px;font-family:${SERIF};font-size:19px;line-height:1.55;font-style:italic;color:${C.muted}">${escape(excerpt)}</td>
      </tr></table>
    </td></tr>`
        : ''
    }

    ${
      headings.length
        ? `<!-- Bu yazıda neler var -->
    <tr><td class="pad" style="padding:30px 40px 0;font-family:${SANS}">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.accent2}">Bu yazıda neler var?</p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        ${headings
          .map(
            (h) => `<tr><td valign="top" style="padding:5px 12px 5px 0;color:${C.accent};font-size:14px">&#10022;</td><td style="padding:5px 0;font-size:16px;line-height:1.5;color:${C.fg}">${escape(h)}</td></tr>`,
          )
          .join('\n        ')}
      </table>
    </td></tr>`
        : ''
    }

    <!-- Buton -->
    <tr><td class="pad btn" style="padding:34px 40px 8px">
      <a href="${link}" style="display:inline-block;background:${C.accent};color:#ffffff;font-family:${SANS};font-size:16px;font-weight:700;text-decoration:none;padding:16px 30px;text-align:center">Yazının devamını oku &rarr;</a>
    </td></tr>
    ${tags.length ? `<tr><td class="pad" style="padding:14px 40px 0;font-family:${SANS};font-size:13px;color:${C.accent2}">${tags.map((t) => '#' + escape(t)).join('&nbsp;&nbsp; ')}</td></tr>` : ''}

    <!-- Kapanış -->
    <tr><td class="pad" style="padding:30px 40px 36px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.muted}">
      <p style="margin:0">Okuduktan sonra ne düşündüğünü merak ediyorum; bu e-postayı yanıtlaman yeterli.</p>
      <p style="margin:14px 0 0;font-family:${SERIF};font-size:20px;color:${C.fg}">Zeynep</p>
    </td></tr>

  </table>
  </td></tr>

  <!-- Alt bilgi -->
  <tr><td class="pad" style="padding:22px 40px 0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted};text-align:center">
    Bu e-postayı <a href="${siteUrl}/blog/?utm_source=bulten&amp;utm_medium=email" style="color:${C.muted}">zeynepecren.github.io</a> blog bültenine abone olduğun için aldın.<br>
    <a href="{{ unsubscribe }}" style="color:${C.muted}">Abonelikten çık</a>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  return { subject: `✦ Yeni yazı: ${title}`, previewText: summary || excerpt, html }
}

// Önizleme: node scripts/newsletter-email.mjs <yazı-adı>
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Kullanım: node scripts/newsletter-email.mjs <yazı-adı>')
    process.exit(1)
  }
  const siteUrl = 'https://zeynepecren.github.io'
  const { meta, body } = parsePost(readFileSync(`src/blog/posts/${slug}.md`, 'utf8'))
  process.stdout.write(buildEmail({ meta, body, url: `${siteUrl}/blog/${slug}/`, siteUrl }).html)
}
