import { lazy, Suspense, useEffect, useState } from 'react'
import { useIdle } from '../hooks/useIdle'
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { useTheme } from '../hooks/useTheme'

const SpaceScene = lazy(() => import('./three/SpaceScene'))

/**
 * Sayfanın arkasındaki sabit 3B uzay katmanı. Three.js ilk boyamadan sonra (tarayıcı boşa çıkınca)
 * yüklenir; o zamana kadar düz tema rengi görünür.
 */
export function SpaceBackground() {
  const { theme } = useTheme()
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const idle = useIdle(1200, { waitForInteraction: isMobile })
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!idle) return
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [idle])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: shown ? 1 : 0, transition: 'opacity 1.6s ease' }}
    >
      {idle && (
        <Suspense fallback={null}>
          <SpaceScene sky={theme.sky} lite={isMobile} still={reduced} />
        </Suspense>
      )}
    </div>
  )
}
