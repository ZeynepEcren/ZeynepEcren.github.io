// `vite build` çıktısındaki sayfalara önceden render edilmiş HTML'i yerleştirir:
// index.html, 404.html ve blog şablonundan üretilen her blog sayfası (dist/blog/<yazı>/index.html).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, renderNotFound, renderBlog, blogPages } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href)

// Paylaşım önizlemesindeki adresler tam URL olmalı. Öncelik: SITE_URL, sonra Vercel'in
// derlemede verdiği üretim alan adı. İkisi de yoksa göreli yol kalır.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
const siteUrl = (process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : '')).replace(/\/$/, '')

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function fill(template, file, body, vars = {}) {
  let html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (html === template) throw new Error(`${file} içinde <div id="root"></div> bulunamadı`)
  for (const [key, value] of Object.entries(vars)) html = html.replaceAll(`%${key}%`, escape(value))
  return html.replaceAll('%SITE_URL%', siteUrl)
}

for (const [file, renderPage] of [['index.html', render], ['404.html', renderNotFound]]) {
  const template = await readFile(`${root}dist/${file}`, 'utf8')
  await writeFile(`${root}dist/${file}`, fill(template, file, renderPage()))
}

const blogTemplate = await readFile(`${root}dist/blog/index.html`, 'utf8')
const pages = blogPages()
for (const page of pages) {
  const html = fill(blogTemplate, page.path, renderBlog(page.path), {
    PAGE_TITLE: page.title,
    PAGE_DESCRIPTION: page.description,
    PAGE_PATH: page.path,
    PAGE_TYPE: page.type,
  })
  await mkdir(`${root}dist${page.path}`, { recursive: true })
  await writeFile(`${root}dist${page.path}index.html`, html)
}
if (!siteUrl) console.warn('! SITE_URL tanımlı değil: paylaşım önizlemesi göreli adreslerle derlendi')

await rm(`${root}dist-ssr`, { recursive: true, force: true })
console.log(`✓ index.html, 404.html ve ${pages.length} blog sayfası önceden render edildi`)
