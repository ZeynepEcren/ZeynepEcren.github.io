import { Check, Mail } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { content } from '../data/content'

const t = content.ui.blog.newsletter

/**
 * Abonelik iki yoldan birini kullanır (adresler derlemede ortam değişkenlerinden gelir; ikisi de yoksa form gösterilmez):
 *  - VITE_NEWSLETTER_API_URL: Cloudflare'deki bülten servisi (worker/newsletter.js). Adresin zaten kayıtlı olup
 *    olmadığını Brevo'ya sorar, değilse onay e-postasını gönderir.
 *  - VITE_BREVO_FORM_URL: Brevo'nun abonelik formu (…sibforms.com/serve/…). Yanıtı okunamadığı için "zaten kayıtlı"
 *    kontrolü yalnızca bu tarayıcıda daha önce abone olunan adresler için yapılabilir.
 */
const API_URL = import.meta.env.VITE_NEWSLETTER_API_URL as string | undefined
const FORM_URL = import.meta.env.VITE_BREVO_FORM_URL as string | undefined

type Status = 'idle' | 'sending' | 'success' | 'error' | 'invalid' | 'already' | 'alreadyLocal'

/** Bu tarayıcıdan abone olunan adresler (yalnızca Brevo formu yolunda kullanılır). */
const STORAGE_KEY = 'newsletter-subscribed'
function storedEmails(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}
function rememberEmail(email: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...storedEmails(), email])]))
  } catch {
    /* gizli sekme vb.: hatırlanamaz, sorun değil */
  }
}

/** Cloudflare servisi üzerinden abone eder. */
async function subscribeViaApi(url: string, email: string): Promise<Status> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, website: '' }),
  })
  const { status } = (await res.json().catch(() => ({}))) as { status?: string }
  if (status === 'already') return 'already'
  if (status === 'pending') return 'success'
  if (status === 'invalid') return 'invalid'
  return 'error'
}

/** Brevo formu üzerinden abone eder; aynı tarayıcıdan tekrar kaydı engeller. */
async function subscribeViaForm(url: string, email: string): Promise<Status> {
  if (storedEmails().includes(email)) return 'alreadyLocal'
  const data = new FormData()
  data.append('EMAIL', email)
  data.append('email_address_check', '') // Brevo'nun bot tuzağı: boş kalmalı
  data.append('locale', 'en') // Brevo formunun dili (Türkçe seçeneği yok); sitedeki mesajlar Türkçe
  // Brevo farklı bir alan adında; yanıt okunamaz (no-cors), ağ hatası yoksa istek ulaşmıştır.
  await fetch(`${url}${url.includes('?') ? '&' : '?'}isAjax=1`, { method: 'POST', body: data, mode: 'no-cors' })
  rememberEmail(email)
  return 'success'
}

/** Blog bülteni: e-posta adresini Brevo listesine ekler (Brevo onay e-postası gönderir). */
export function Newsletter({ className = '', inset = false }: { className?: string; /** Zaten zemini olan bir alanın içinde (yazı sayfası) */ inset?: boolean }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  if (!API_URL && !FORM_URL) return null

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('invalid')
      return
    }
    setStatus('sending')
    try {
      const result = API_URL ? await subscribeViaApi(API_URL, value) : await subscribeViaForm(FORM_URL!, value)
      setStatus(result)
      if (result === 'success') setEmail('')
    } catch {
      setStatus('error')
    }
  }

  const message =
    status === 'invalid'
      ? { text: t.invalid, warn: true }
      : status === 'error'
        ? { text: t.error, warn: true }
        : status === 'already'
          ? { text: t.already, warn: false }
          : status === 'alreadyLocal'
            ? { text: t.alreadyLocal, warn: false }
            : null

  return (
    <section aria-labelledby={`${id}-title`} className={`${inset ? 'rule pt-10' : 'bar px-5 py-8 sm:px-8'} ${className}`}>
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-2xl font-semibold text-fg sm:text-3xl">
        <Mail size={22} className="shrink-0 text-accent" aria-hidden="true" />
        {t.title}
      </h2>
      <p className="mt-3 max-w-2xl text-muted">{t.description}</p>

      {status === 'success' ? (
        <p role="status" className="mt-6 flex items-start gap-2 text-fg">
          <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          {t.success}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor={`${id}-email`} className="sr-only">
            {t.label}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            name="EMAIL"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status !== 'idle' && status !== 'sending') setStatus('idle')
            }}
            placeholder={t.placeholder}
            aria-invalid={status === 'invalid'}
            aria-describedby={message ? `${id}-msg` : undefined}
            className="min-w-0 flex-1 border-b border-border bg-transparent px-1 py-3 text-base text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? t.sending : t.submit}
          </button>
        </form>
      )}
      {message && (
        <p id={`${id}-msg`} role="alert" className={`mt-3 text-sm ${message.warn ? 'text-accent' : 'text-fg'}`}>
          {message.text}
        </p>
      )}
    </section>
  )
}
