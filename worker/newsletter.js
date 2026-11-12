/**
 * Bülten abonelik servisi (Cloudflare Worker).
 *
 * Sitedeki form (src/components/Newsletter.tsx) e-posta adresini buraya gönderir. Servis Brevo API'sine sorar:
 *   - adres "Blog bülteni" listesinde zaten kayıtlıysa  → { status: "already" }
 *   - değilse Brevo onay e-postasını (double opt-in) gönderir → { status: "pending" }
 * Brevo API anahtarı yalnızca burada, Cloudflare'in gizli değişkeninde durur; sitenin koduna girmez.
 *
 * Cloudflare'de tanımlanacak değişkenler (Settings → Variables and Secrets):
 *   BREVO_API_KEY          (Secret) Brevo API anahtarı
 *   BREVO_LIST_ID          abonelerin listesi, ör. 3
 *   BREVO_DOI_TEMPLATE_ID  onay e-postası şablonunun numarası (Brevo → Templates)
 *   REDIRECT_URL           onay bağlantısına tıklayınca gidilecek sayfa, ör. https://zeynepecren.github.io/blog/
 *   ALLOWED_ORIGIN         isteğe izin verilen site, ör. https://zeynepecren.github.io
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    // Bot tuzağı: görünmeyen alan doluysa sessizce "tamam" de.
    if (body.website) return reply({ status: 'pending' })
    const email = String(body.email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 254) return reply({ status: 'invalid' }, 400)

    const listId = Number(env.BREVO_LIST_ID)
    const brevo = (path, init = {}) =>
      fetch(`https://api.brevo.com/v3${path}`, {
        ...init,
        headers: { 'api-key': env.BREVO_API_KEY, accept: 'application/json', 'content-type': 'application/json' },
      })

    try {
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
    } catch (err) {
      console.log('Brevo bağlantı hatası', err)
      return reply({ status: 'error' }, 502)
    }
  },
}
