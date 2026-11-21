/**
 * Sitenin küçük sunucu tarafı (Cloudflare Worker). Brevo API anahtarı yalnızca burada, Cloudflare'in gizli
 * değişkeninde durur; sitenin koduna girmez. Yalnızca sitenin adresinden gelen isteklere izin verilir.
 *
 *   POST /subscribe  { email }                          Bülten kaydı (src/components/Newsletter.tsx)
 *        → adres listede zaten kayıtlıysa { status: "already" }
 *        → değilse Brevo onay e-postasını gönderir, { status: "pending" }
 *   POST /feedback   { type, message, name?, email?, page? }   Görüş ve öneri (src/components/Feedback.tsx)
 *        → mesajı Brevo ile FEEDBACK_TO_EMAIL adresine e-postalar, { status: "sent" }
 *
 * Cloudflare'de tanımlanacak değişkenler (Worker → Settings → Variables and Secrets):
 *   BREVO_API_KEY          (Secret) Brevo API anahtarı; izinler: Contacts + Transactional emails
 *   BREVO_LIST_ID          bülten listesi, ör. 3
 *   BREVO_DOI_TEMPLATE_ID  onay e-postası şablonunun numarası (Brevo → Marketing → Templates)
 *   BREVO_SENDER_EMAIL     Brevo'da doğrulanmış gönderici adresi
 *   FEEDBACK_TO_EMAIL      görüş/öneri mesajlarının geleceği adres
 *   REDIRECT_URL           onay bağlantısına tıklayınca gidilecek sayfa, ör. https://zeynepecren.github.io/blog/
 *   ALLOWED_ORIGIN         sitenin adresi, ör. https://zeynepecren.github.io
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FEEDBACK_TYPES = { gorus: 'Görüş', oneri: 'Öneri', hata: 'Hata bildirimi' }

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowed = [env.ALLOWED_ORIGIN, 'http://localhost:5173', 'http://localhost:4173'].filter(Boolean)
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    }
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return reply({ status: 'error' }, 405)
    if (!allowed.includes(origin)) return reply({ status: 'error' }, 403)

    let body
    try {
      body = await request.json()
    } catch {
      return reply({ status: 'invalid' }, 400)
    }

    const brevo = (path, init = {}) =>
      fetch(`https://api.brevo.com/v3${path}`, {
        ...init,
        headers: { 'api-key': env.BREVO_API_KEY, accept: 'application/json', 'content-type': 'application/json' },
      })

    const path = new URL(request.url).pathname.replace(/\/+$/, '')
    try {
      if (path === '/subscribe') return await subscribe(body, env, brevo, reply)
      if (path === '/feedback') return await feedback(body, env, brevo, reply)
      return reply({ status: 'error' }, 404)
    } catch (err) {
      console.log('Brevo bağlantı hatası', err)
      return reply({ status: 'error' }, 502)
    }
  },
}

async function subscribe(body, env, brevo, reply) {
  // Bot tuzağı: görünmeyen alan doluysa sessizce "tamam" de.
  if (body.website) return reply({ status: 'pending' })
  const email = String(body.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) return reply({ status: 'invalid' }, 400)
  const listId = Number(env.BREVO_LIST_ID)

  // 1) Kayıtlı mı? (404: kişi yok)
  const res = await brevo(`/contacts/${encodeURIComponent(email)}`)
  if (res.ok) {
    const contact = await res.json()
    if (!contact.emailBlacklisted && (contact.listIds || []).includes(listId)) return reply({ status: 'already' })
  } else if (res.status !== 404) {
    console.log('Brevo kişi sorgusu', res.status, await res.text())
    return reply({ status: 'error' }, 502)
  }

  // 2) Değilse onay e-postasını gönder; kişi bağlantıya tıklayınca listeye eklenir.
  const doi = await brevo('/contacts/doubleOptinConfirmation', {
    method: 'POST',
    body: JSON.stringify({
      email,
      includeListIds: [listId],
      templateId: Number(env.BREVO_DOI_TEMPLATE_ID),
      redirectionUrl: env.REDIRECT_URL,
    }),
  })
  if (!doi.ok) {
    console.log('Brevo onay e-postası', doi.status, await doi.text())
    return reply({ status: 'error' }, 502)
  }
  return reply({ status: 'pending' })
}

async function feedback(body, env, brevo, reply) {
  if (body.botcheck) return reply({ status: 'sent' })
  const type = FEEDBACK_TYPES[body.type] || FEEDBACK_TYPES.gorus
  const message = String(body.message || '').trim().slice(0, 5000)
  const name = String(body.name || '').trim().slice(0, 100)
  const email = String(body.email || '').trim().slice(0, 254)
  const page = String(body.page || '').trim().slice(0, 300)
  const where = String(body.where || '').trim().slice(0, 200) || 'Site'
  if (!message) return reply({ status: 'invalid' }, 400)
  if (email && !EMAIL_RE.test(email)) return reply({ status: 'invalid' }, 400)

  const rows = [
    ['Konu', type],
    ['Sayfa', page ? `<a href="${escape(page)}">${escape(page)}</a>` : '—'],
    ['Ad', name ? escape(name) : '—'],
    ['E-posta', email ? `<a href="mailto:${escape(email)}">${escape(email)}</a>` : '—'],
  ]
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1b1f38">
<p style="margin:0 0 16px;white-space:pre-wrap;font-size:16px">${escape(message)}</p>
<table cellpadding="0" cellspacing="0" style="border-top:1px solid #ddd3bf;padding-top:12px;font-size:13px;color:#5b5a6e">
${rows.map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;font-weight:bold">${k}</td><td style="padding:3px 0">${v}</td></tr>`).join('')}
</table>
${email ? '<p style="margin:16px 0 0;font-size:13px;color:#5b5a6e">Bu e-postayı yanıtlarsan cevabın doğrudan gönderene gider.</p>' : ''}
</div>`

  const res = await brevo('/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      sender: { name: 'Site görüş ve öneri', email: env.BREVO_SENDER_EMAIL },
      to: [{ email: env.FEEDBACK_TO_EMAIL }],
      ...(email ? { replyTo: { email, ...(name ? { name } : {}) } } : {}),
      subject: `[Site] ${type} — ${where}`,
      htmlContent: html,
      textContent: `${message}\n\nKonu: ${type}\nSayfa: ${page || '—'}\nAd: ${name || '—'}\nE-posta: ${email || '—'}`,
      tags: ['site-feedback'],
    }),
  })
  if (!res.ok) {
    console.log('Brevo e-posta gönderimi', res.status, await res.text())
    return reply({ status: 'error' }, 502)
  }
  return reply({ status: 'sent' })
}
