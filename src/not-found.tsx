import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/sora'
import '@fontsource-variable/manrope'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import './index.css'
import NotFound from './NotFound'
import { ThemeProvider } from './themes/ThemeProvider'

const root = document.getElementById('root')!
const page = (
  <StrictMode>
    <ThemeProvider>
      <NotFound />
    </ThemeProvider>
  </StrictMode>
)

// Üretimde 404.html önceden render edilir → hydrate; geliştirmede normal render.
if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
