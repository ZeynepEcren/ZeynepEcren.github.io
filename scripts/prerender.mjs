// `vite build` çıktısındaki index.html ve 404.html'e önceden render edilmiş HTML'i yerleştirir.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, renderNotFound } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href)

// Paylaşım önizlemesindeki adresler tam URL olmalı. Öncelik: SITE_URL, sonra Vercel'in
// derlemede verdiği üretim alan adı. İkisi de yoksa göreli yol kalır.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
const siteUrl = (process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : '')).replace(/\/$/, '')

for (const [file, renderPage] of [['index.html', render], ['404.html', renderNotFound]]) {
  const template = await readFile(`${root}dist/${file}`, 'utf8')
  const html = template.replace('<div id="root"></div>', `<div id="root">${renderPage()}</div>`)
  if (html === template) throw new Error(`${file} içinde <div id="root"></div> bulunamadı`)
  await writeFile(`${root}dist/${file}`, html.replaceAll('%SITE_URL%', siteUrl))
}
if (!siteUrl) console.warn('! SITE_URL tanımlı değil: paylaşım önizlemesi göreli adreslerle derlendi')

await rm(`${root}dist-ssr`, { recursive: true, force: true })
console.log('✓ index.html ve 404.html önceden render edildi')
