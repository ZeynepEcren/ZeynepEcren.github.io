import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/sora'
import '@fontsource-variable/manrope'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import BlogApp from './BlogApp'
import './index.css'
import { ThemeProvider } from './themes/ThemeProvider'

const root = document.getElementById('root')!
const page = (
  <StrictMode>
    <ThemeProvider>
      <BlogApp path={window.location.pathname} />
    </ThemeProvider>
  </StrictMode>
)

// Üretimde her blog sayfası önceden render edilir → hydrate; geliştirmede normal render.
if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
