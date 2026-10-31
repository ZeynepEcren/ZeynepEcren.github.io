/**
 * Ziyaret sayımı: GoatCounter (https://www.goatcounter.com). Çerez kullanmaz, ziyaretçileri tek tek izlemez.
 * Sayaç kapalıyken (kod boş) hiçbir istek gönderilmez.
 */
import { useEffect, useState } from 'react'

/** GoatCounter hesabının kodu: panel adresi https://<kod>.goatcounter.com ise <kod>. */
export const goatcounterCode = 'zeynepikinci'

const base = goatcounterCode ? `https://${goatcounterCode}.goatcounter.com` : ''

/** Sayım betiğini sayfaya bir kez ekler; betik yüklenince o sayfanın görüntülenmesini sayar. */
export function useAnalytics() {
  useEffect(() => {
    if (!base || document.querySelector('script[data-goatcounter]')) return
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://gc.zgo.at/count.js'
    script.dataset.goatcounter = `${base}/count`
    document.head.appendChild(script)
  }, [])
}

/**
 * Bir sayfanın toplam görüntülenme sayısı. GoatCounter ayarlarında herkese açık sayaç izni
 * ("Allow adding visitor counts on your website") açık olmalı. Sayaç kapalıysa, sayfanın henüz
 * kaydı yoksa ya da istek başarısızsa `null` döner.
 */
export function useViewCount(path: string) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!base) return
    const controller = new AbortController()
    fetch(`${base}/counter/${encodeURIComponent(path)}.json`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: string } | null) => {
        // GoatCounter sayıyı binlik ayraçlı metin olarak döndürür ("1,234")
        const n = Number(String(data?.count ?? '').replace(/\D/g, ''))
        if (n > 0) setCount(n)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [path])

  return count
}
