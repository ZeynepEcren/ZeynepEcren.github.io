import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import NotFound from './NotFound'
import { ThemeProvider } from './themes/ThemeProvider'

/** Build sırasında sayfayı statik HTML'e çevirir; ilk boyama JS'i beklemez. */
export function render() {
  return renderToString(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
}

/** 404 sayfasının statik HTML'i. */
export function renderNotFound() {
  return renderToString(
    <StrictMode>
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>
    </StrictMode>,
  )
}
