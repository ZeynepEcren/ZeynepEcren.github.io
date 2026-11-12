import { Check, Mail } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { content } from '../data/content'

const t = content.ui.blog.newsletter

/**
 * Brevo'da oluşturulan abonelik formunun adresi (…sibforms.com/serve/…). Derleme sırasında
 * VITE_BREVO_FORM_URL ortam değişkeninden gelir; tanımlı değilse form gösterilmez.
 */
const FORM_URL = import.meta.env.VITE_BREVO_FORM_URL as string | undefined

type Status = 'idle' | 'sending' | 'success' | 'error' | 'invalid'

/** Blog bülteni: e-posta adresini Brevo listesine ekler (Brevo onay e-postası gönderir). */
export function Newsletter({ className = '', inset = false }: { className?: string; /** Zaten zemini olan bir alanın içinde (yazı sayfası) */ inset?: boolean }) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  if (!FORM_URL) return null

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('invalid')
      return
    }
    setStatus('sending')
    const data = new FormData()
    data.append('EMAIL', value)
    data.append('email_address_check', '') // Brevo'nun bot tuzağı: boş kalmalı
    data.append('locale', 'en') // Brevo formunun dili (Türkçe seçeneği yok); sitedeki mesajlar Türkçe
    try {
      // Brevo farklı bir alan adında; yanıt okunamaz (no-cors), ağ hatası yoksa istek ulaşmıştır.
      await fetch(`${FORM_URL}${FORM_URL.includes('?') ? '&' : '?'}isAjax=1`, { method: 'POST', body: data, mode: 'no-cors' })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

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
              if (status === 'invalid' || status === 'error') setStatus('idle')
            }}
            placeholder={t.placeholder}
            aria-invalid={status === 'invalid'}
            aria-describedby={status === 'invalid' || status === 'error' ? `${id}-msg` : undefined}
            className="min-w-0 flex-1 border-b border-border bg-transparent px-1 py-3 text-base text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? t.sending : t.submit}
          </button>
        </form>
      )}
      {(status === 'invalid' || status === 'error') && (
        <p id={`${id}-msg`} role="alert" className="mt-3 text-sm text-accent">
          {status === 'invalid' ? t.invalid : t.error}
        </p>
      )}
    </section>
  )
}
