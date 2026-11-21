import { Check, MessageSquare } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { content } from '../data/content'

const t = content.ui.feedback

/**
 * Web3Forms erişim anahtarı (gizli değildir; yalnızca mesajların hangi e-postaya gideceğini belirtir).
 * Derlemede VITE_WEB3FORMS_KEY ortam değişkeninden gelir; tanımlı değilse form gösterilmez.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined
const ENDPOINT = 'https://api.web3forms.com/submit'

type TypeId = keyof typeof t.types
type Status = 'idle' | 'sending' | 'success' | 'error' | 'emptyMessage' | 'invalidEmail'

interface Props {
  /** Yazı sayfasında: hangi yazıdan geldiği mesaja eklenir ve başlık yazıya göre değişir. */
  post?: { title: string; slug: string }
  className?: string
}

const fieldClass =
  'w-full border-b border-border bg-transparent px-1 py-3 text-base text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none'
const labelClass = 'block font-mono text-xs tracking-wider text-muted uppercase'

/** Görüş ve öneri formu: mesajlar Web3Forms üzerinden e-postaya gelir. */
export function Feedback({ post, className = '' }: Props) {
  const id = useId()
  const [type, setType] = useState<TypeId>('gorus')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [botcheck, setBotcheck] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  if (!ACCESS_KEY) return null

  const reset = () => {
    setMessage('')
    setStatus('idle')
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim()) return setStatus('emptyMessage')
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setStatus('invalidEmail')

    setStatus('sending')
    const where = post ? `Blog: ${post.title}` : 'Ana sayfa'
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `[Site] ${t.types[type]} — ${where}`,
          from_name: name.trim() || 'Site ziyaretçisi',
          ...(email.trim() ? { email: email.trim(), replyto: email.trim() } : {}),
          Konu: t.types[type],
          Sayfa: post ? `${location.origin}/blog/${post.slug}/` : location.origin + '/',
          Ad: name.trim() || '—',
          Mesaj: message.trim(),
          botcheck, // Bot tuzağı: görünmeyen kutu işaretliyse Web3Forms mesajı atar
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean }
      setStatus(res.ok && data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const error = status === 'emptyMessage' || status === 'invalidEmail' || status === 'error' ? t[status] : null

  return (
    <section aria-labelledby={`${id}-title`} className={className}>
      <h2 id={`${id}-title`} className="flex items-center gap-3 text-2xl font-semibold text-fg sm:text-3xl">
        <MessageSquare size={22} className="shrink-0 text-accent" aria-hidden="true" />
        {post ? t.postTitle : t.title}
      </h2>
      <p className="mt-3 max-w-2xl text-muted">{post ? t.postDescription : t.description}</p>

      {status === 'success' ? (
        <div role="status" className="mt-6">
          <p className="flex items-start gap-2 text-fg">
            <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            {t.success}
          </p>
          <button type="button" onClick={reset} className="btn btn-ghost mt-3">
            {t.again}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
          <fieldset>
            <legend className={labelClass}>{t.typeLabel}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(t.types) as TypeId[]).map((key) => (
                <label
                  key={key}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-2 ${
                    type === key ? 'bg-accent text-on-accent' : 'bg-surface-strong text-fg hover:text-accent'
                  }`}
                >
                  <input type="radio" name={`${id}-type`} value={key} checked={type === key} onChange={() => setType(key)} className="sr-only" />
                  {t.types[key]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${id}-message`} className={labelClass}>
              {t.messageLabel}
            </label>
            <textarea
              id={`${id}-message`}
              rows={4}
              required
              maxLength={5000}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (status === 'emptyMessage' || status === 'error') setStatus('idle')
              }}
              placeholder={t.messagePlaceholder}
              aria-invalid={status === 'emptyMessage'}
              className={`${fieldClass} resize-y`}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className={labelClass}>
                {t.nameLabel}
              </label>
              <input id={`${id}-name`} type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className={labelClass}>
                {t.emailLabel}
              </label>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'invalidEmail') setStatus('idle')
                }}
                aria-invalid={status === 'invalidEmail'}
                className={fieldClass}
              />
            </div>
          </div>

          {/* Bot tuzağı: ekran dışında, insanlar görmez */}
          <input
            type="checkbox"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            checked={botcheck}
            onChange={(e) => setBotcheck(e.target.checked)}
            className="absolute -left-[9999px] size-px opacity-0"
          />

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? t.sending : t.submit}
            </button>
            {error && (
              <p role="alert" className="text-sm text-accent">
                {error}
              </p>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
