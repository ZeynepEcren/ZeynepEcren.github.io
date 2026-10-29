import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/sora'
import '@fontsource-variable/manrope'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import App from './App'
import './index.css'
import { ThemeProvider } from './themes/ThemeProvider'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

// Üretim derlemesinde HTML önceden render edilir (scripts/prerender.mjs) → hydrate; geliştirmede normal render.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
