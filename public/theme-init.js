// Temayı ilk boyamadan önce uygular (tema "yanıp sönmesini" önler).
// Öncelik: ?theme=atlas gibi URL parametresi → daha önce seçilen tema → işletim sisteminin açık/koyu tercihi.
// index.html ve 404.html bu dosyayı <head> içinde yükler. Liste, src/themes/themes.ts içindeki temalarla aynı olmalı.
;(function () {
  var ids = ['space', 'atlas']
  var key = 'portfolio-theme'
  var t = new URLSearchParams(location.search).get('theme')
  if (ids.indexOf(t) < 0) {
    try { t = localStorage.getItem(key) } catch (e) {}
  }
  if (ids.indexOf(t) < 0) {
    t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'atlas' : 'space'
  }
  document.documentElement.setAttribute('data-theme', t)
})()
