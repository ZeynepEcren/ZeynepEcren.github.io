/**
 * Yeni yayınlanan blog yazılarını Brevo üzerinden bülten abonelerine e-postayla duyurur.
 * GitHub Actions'ta site yayınlandıktan sonra çalışır (.github/workflows/deploy.yml).
 *
 * "Yeni yazı": önceki gönderimde (BEFORE_SHA) olmayan ya da taslak olan, şimdi taslak olmayan yazı.
 * Aynı yazı iki kez gönderilmez: her kampanyaya `blog:<yazı-adı>` adı verilir ve önceden varsa atlanır.
 *
 * Ortam değişkenleri:
 *   BREVO_API_KEY       (gizli) Brevo API anahtarı
 *   BREVO_LIST_ID       abonelerin tutulduğu Brevo listesinin numarası
 *   BREVO_SENDER_EMAIL  Brevo'da doğrulanmış gönderici adresi
 *   BREVO_SENDER_NAME   gönderici adı (isteğe bağlı)
 *   SITE_URL            sitenin adresi, ör. https://zeynepecren.github.io
 *   BEFORE_SHA          bir önceki commit (github.event.before)
 *   NOTIFY_SLUGS        (isteğe bağlı) elle duyurulacak yazılar, virgülle ayrılmış; verilirse BEFORE_SHA yok sayılır
 *   DRY_RUN=1           göndermeden yalnızca ne yapılacağını yazar
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const POSTS_DIR = 'src/blog/posts'
const env = process.env
const dryRun = env.DRY_RUN === '1'
const siteUrl = (env.SITE_URL || '').replace(/\/$/, '')

/** src/blog/posts.ts ile aynı basit ön bilgi ayrıştırması. */
function parse(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  const meta = {}
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return meta
}

const isPublished = (raw) => raw != null && parse(raw).draft !== 'true'

function readAt(sha, file) {
  try {
    return execFileSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}

function findNewSlugs() {
  if (env.NOTIFY_SLUGS) return env.NOTIFY_SLUGS.split(',').map((s) => s.trim()).filter(Boolean)

  const before = env.BEFORE_SHA
  // İlk gönderim ya da bilinmeyen önceki durum: eski yazıların hepsini toplu göndermemek için hiçbir şey yapma.
  if (!before || /^0+$/.test(before) || readAt(before, 'package.json') == null) {
    console.log('Önceki commit bulunamadı; yeni yazı aranmadı.')
    return []
  }
  return readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => isPublished(readFileSync(`${POSTS_DIR}/${f}`, 'utf8')) && !isPublished(readAt(before, `${POSTS_DIR}/${f}`)))
    .map((f) => f.replace(/\.md$/, ''))
}

const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function emailHtml({ title, summary, url }) {
  return `<!doctype html>
<html lang="tr"><body style="margin:0;padding:0;background:#f3ece0;font-family:Helvetica,Arial,sans-serif;color:#1c2238">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffaf2">
<tr><td style="padding:32px">
<p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a63a24">Yeni blog yazısı</p>
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-family:Georgia,serif">${escape(title)}</h1>
${summary ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a4f63">${escape(summary)}</p>` : ''}
<a href="${url}" style="display:inline-block;padding:12px 22px;background:#a63a24;color:#ffffff;text-decoration:none;font-weight:bold">Yazıyı oku</a>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e6dccb;font-size:12px;line-height:1.6;color:#7a7f90">
Bu e-postayı Zeynep Ecren İkinci’nin blog bültenine abone olduğun için aldın.
<a href="{{ unsubscribe }}" style="color:#7a7f90">Abonelikten çık</a>
</td></tr>
</table></td></tr></table></body></html>`
}

async function brevo(path, init = {}) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json', ...init.headers },
  })
  if (!res.ok) throw new Error(`Brevo ${init.method || 'GET'} ${path} → ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

/** Adı verilen kampanyayı arar (son 500 kampanya içinde). */
async function findCampaign(name) {
  for (let offset = 0; offset < 500; offset += 100) {
    const { campaigns = [] } = (await brevo(`/emailCampaigns?limit=100&offset=${offset}&sort=desc`)) || {}
    const found = campaigns.find((c) => c.name === name)
    if (found || campaigns.length < 100) return found
  }
  return undefined
}

async function main() {
  const slugs = findNewSlugs()
  if (slugs.length === 0) {
    console.log('Duyurulacak yeni yazı yok.')
    return
  }

  const missing = ['BREVO_API_KEY', 'BREVO_LIST_ID', 'BREVO_SENDER_EMAIL', 'SITE_URL'].filter((k) => !env[k])
  if (missing.length) {
    // Bülten henüz kurulmadıysa yayını bozmadan atla.
    console.log(`::warning::Bülten bildirimi atlandı; eksik ayar: ${missing.join(', ')}`)
    return
  }

  for (const slug of slugs) {
    const file = `${POSTS_DIR}/${slug}.md`
    if (!existsSync(file)) throw new Error(`Yazı bulunamadı: ${file}`)
    const meta = parse(readFileSync(file, 'utf8'))
    if (meta.draft === 'true') {
      console.log(`${slug}: taslak, atlandı.`)
      continue
    }
    const title = meta.title || slug
    const url = `${siteUrl}/blog/${encodeURIComponent(slug)}/`
    const name = `blog:${slug}`

    if (dryRun) {
      console.log(`[deneme] "${title}" → liste ${env.BREVO_LIST_ID} (${url})`)
      continue
    }

    let campaign = await findCampaign(name)
    if (campaign && campaign.status !== 'draft') {
      console.log(`${slug}: daha önce gönderilmiş (${campaign.status}), atlandı.`)
      continue
    }
    if (!campaign) {
      campaign = await brevo('/emailCampaigns', {
        method: 'POST',
        body: JSON.stringify({
          name,
          subject: `Yeni yazı: ${title}`,
          previewText: meta.summary || undefined,
          sender: { name: env.BREVO_SENDER_NAME || 'Zeynep Ecren İkinci', email: env.BREVO_SENDER_EMAIL },
          htmlContent: emailHtml({ title, summary: meta.summary, url }),
          recipients: { listIds: [Number(env.BREVO_LIST_ID)] },
        }),
      })
    }
    await brevo(`/emailCampaigns/${campaign.id}/sendNow`, { method: 'POST' })
    console.log(`${slug}: abonelere gönderildi (kampanya #${campaign.id}).`)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
