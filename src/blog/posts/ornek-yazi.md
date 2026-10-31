---
title: Örnek yazı — blog nasıl kullanılır
date: 2026-10-31
summary: Bu bir taslak; yayına çıkmaz. Yeni bir yazı için bu dosyayı kopyalayıp düzenleyebilirsin.
tags: Rehber
draft: true
---

Bu dosya yalnızca **geliştirme sunucusunda** görünür, çünkü yukarıda `draft: true` yazıyor. Yeni bir yazı yazmak için:

1. `src/blog/posts/` klasöründe yeni bir `.md` dosyası oluştur. Dosya adı yazının adresi olur: `ilk-yazim.md` → `/blog/ilk-yazim/`.
2. En üstteki `---` bloğunu doldur: başlık, tarih (`YIL-AY-GÜN`), kısa özet ve etiketler.
3. Hazır olunca `draft` satırını sil ve `main` dalına gönder. Site birkaç dakika içinde güncellenir.

## Biçimlendirme

Yazılar [Markdown](https://www.markdownguide.org/basic-syntax/) ile yazılır. *İtalik*, **kalın** ve `satır içi kod` kullanabilirsin.

> Alıntılar böyle görünür.

- Madde işaretli
- bir liste

```ts
function selamla(isim: string) {
  return `Merhaba, ${isim}!`
}
```

### Görsel eklemek

Görseli `public/blog/` klasörüne koy ve şöyle yaz:

```md
![Görselin açıklaması](/blog/gorsel.png)
```

---

Kolay gelsin!
