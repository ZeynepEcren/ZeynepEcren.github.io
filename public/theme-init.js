// Temayı ilk boyamadan önce uygular (tema "yanıp sönmesini" önler).
// Tema işletim sisteminin açık/koyu ayarını izler. Öncelik: ?theme=atlas gibi URL parametresi →
// bu ziyarette düğmeyle seçilen tema (sessionStorage) → sistem ayarı.
// index.html, blog/index.html ve 404.html bu dosyayı <head> içinde yükler.
// Liste ve anahtar, src/themes/themes.ts ile aynı olmalı.
;(function () {
  var ids = ['space', 'atlas']
  var key = 'portfolio-theme'
  // Eski sürüm seçimi kalıcı saklıyordu; artık sistem ayarı esas, eski kaydı temizle.
  try { localStorage.removeItem(key) } catch (e) {}
  var t = new URLSearchParams(location.search).get('theme')
  if (ids.indexOf(t) < 0) {
    try { t = sessionStorage.getItem(key) } catch (e) {}
  }
  if (ids.indexOf(t) < 0) {
    t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'atlas' : 'space'
  }
  document.documentElement.setAttribute('data-theme', t)
})()
