import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Geliştirme ve önizleme sunucusunda blog adreslerini (/blog/, /blog/yazi/) blog sayfasına, diğer bilinmeyen
 * adresleri (ör. /olmayan-sayfa) 404.html'e yönlendirir; böylece yayındaki statik barındırma davranışı yerelde de
 * görülür. Dosya uzantılı istekler (varlıklar) etkilenmez.
 */
function notFoundPage(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const path = (req.url ?? '/').split('?')[0]
    const isPage = req.method === 'GET' && req.headers.accept?.includes('text/html')
    if (isPage && path !== '/' && !path.startsWith('/@') && !/\.[a-z0-9]+$/i.test(path)) {
      const page = path === '/blog' || path.startsWith('/blog/') ? '/blog/index.html' : '/404.html'
      req.url = page + (req.url!.includes('?') ? req.url!.slice(req.url!.indexOf('?')) : '')
    }
    next()
  }
  return {
    name: 'not-found-page',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), notFoundPage()],
  // Tek sayfalık uygulama yönlendirmesi yok: bilinmeyen adresler ana sayfaya düşmez, 404 sayfasını gösterir.
  appType: 'mpa',
  build: {
    // Three.js, SpaceScene ile birlikte ayrı (lazy) bir parçada; ilk yüklemeye dahil değil.
    chunkSizeWarningLimit: 1000,
    // Üç sayfa: ana site, blog şablonu (her yazı için ön-render'da çoğaltılır) ve statik barındırma servislerinin
    // (GitHub Pages, Netlify vb.) bilinmeyen adreslerde gösterdiği 404.html.
    rollupOptions: {
      input: { main: 'index.html', blog: 'blog/index.html', notFound: '404.html' },
    },
  },
})
