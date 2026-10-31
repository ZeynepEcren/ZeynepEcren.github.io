import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import BlogApp, { blogMeta } from './BlogApp'
import { posts } from './blog/posts'
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

/** Ön-render edilecek blog sayfaları: liste ve her yazı. */
export function blogPages() {
  return [
    { path: '/blog/', type: 'website', ...blogMeta('/blog/') },
    ...posts.map((p) => ({ path: `/blog/${p.slug}/`, type: 'article', ...blogMeta(`/blog/${p.slug}/`) })),
  ]
}

/** Bir blog sayfasının statik HTML'i. */
export function renderBlog(path: string) {
  return renderToString(
    <StrictMode>
      <ThemeProvider>
        <BlogApp path={path} />
      </ThemeProvider>
    </StrictMode>,
  )
}
