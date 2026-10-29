import { useEffect, useState } from 'react'

/**
 * Tarayıcı boşa çıktığında true döner; ağır işleri (3B sahne) ilk boyamadan sonraya erteler.
 * `waitForInteraction` açıksa (mobil), kullanıcı kaydırana / dokunana kadar ya da `fallbackMs` dolana kadar bekler.
 */
export function useIdle(timeout = 1200, { waitForInteraction = false, fallbackMs = 8000 } = {}) {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (waitForInteraction) {
      const events = ['pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'] as const
      const done = () => setIdle(true)
      events.forEach((e) => window.addEventListener(e, done, { once: true, passive: true }))
      const id = setTimeout(done, fallbackMs)
      return () => {
        clearTimeout(id)
        events.forEach((e) => window.removeEventListener(e, done))
      }
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setIdle(true), 300)
    return () => clearTimeout(id)
  }, [timeout, waitForInteraction, fallbackMs])

  return idle
}
