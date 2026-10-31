---
title: Bu siteyi yapay zekâyla nasıl yaptım?
date: 2026-10-31
summary: Portföyümü bir yapay zekâ kodlama asistanıyla birlikte geliştirdim. Neyi hızlandırdı, nerede beni durdurdu ve o olmasaydı ne değişirdi?
tags: Yapay Zekâ, React, Three.js, Deneyim
---

Bu site, bir yapay zekâ kodlama asistanıyla (Claude Code) yan yana çalışarak ortaya çıktı. "Yapay zekâ yaptı" demek de, "her şeyi ben yaptım" demek de doğru olmaz; gerçek, ikisinin arasında bir yerde. Bu yazıda o arayı anlatmak istiyorum: süreç nasıl işledi, neyi kolaylaştırdı, nerede dikkat etmem gerekti ve bu araç olmasaydı ne olurdu.

## Süreç nasıl işledi?

Elimde eski bir portföy sitesi ve güncel CV'm vardı. İlk adım basitti: CV'yi verdim ve sitedeki bilgileri ona göre güncellemesini istedim. Sonrası tamamen bir sohbete dönüştü. "Şurası hoşuma gitmiyor", "köşeler fazla yuvarlak", "gezegen olmasın, sadece yıldızlar ve kümeler olsun", "açık tema bu etkiyi vermedi" gibi cümlelerle ilerledim.

Benim için en değerli kısım, kararları uygulamadan önce görebilmekti. Uzay temasını siteye eklemeden önce ayrı bir önizleme sayfası hazırlandı; logo için altı farklı seçenek çizildi ve aralarından birini seçtim. Böylece "bir şeyi yapıp beğenmeyince geri almak" yerine "görüp seçmek" mümkün oldu.

Sitenin bugünkü hali bu turların sonucu:

- **Arka plan:** Three.js ile yazılmış, sayfayı kaydırdıkça derinliğine ilerlenen bir yıldız alanı: yıldız kümeleri, bulutsular ve takımyıldız çizgileri.
- **İki tema:** Koyu tema ve eski bir gök atlasını andıran açık "Yıldız atlası" teması.
- **Çerçevesiz tasarım:** Kutu ve yuvarlak köşe yok; bölümler yalnızca boşluk ve ince çizgilerle ayrılıyor.
- **Bu blog:** Yazılar Markdown dosyası olarak duruyor ve her biri derleme sırasında kendi sayfasına dönüşüyor.

## Neyi kolaylaştırdı?

**Hız.** Bir fikri denemek ile sonucunu görmek arasındaki süre çok kısaldı. Yazı tipini değiştirmek, bir temayı kaldırmak ya da bir bölümü baştan tasarlamak dakikalar içinde gerçekleşti. Bu da daha çok şey denememi sağladı; beğenmediğim bir şeyi atmanın maliyeti düşünce daha cesur davrandım.

**Bilmediğim alanlarda yol göstermesi.** Three.js'te özel shader yazmak, sayfayı önceden statik HTML'e çevirmek (ön-render) ya da bir GitHub Actions yayın akışı kurmak benim için yeni konulardı. Asistan bunları yazarken neyi neden yaptığını açıkladı; kodu okuyup sorular sorarak öğrenebildim.

**Görmediğim sorunları yakalaması.** Birkaç örnek beni gerçekten şaşırttı:

- CV'mi siteye koymadan önce telefon numaramın PDF'in metin katmanında hâlâ durduğunu fark etti. Numara sayfada görünmüyordu ama dosyada seçilip kopyalanabiliyordu.
- Siteyi yayına aldığımızda sayfa açılmadı. Sebebin kod değil, `vercel.app` adreslerinin Türkiye'den erişime kapalı olması olduğunu bağlantıyı test ederek buldu; site bu yüzden GitHub Pages'e taşındı.
- Diğer projemi Netlify'a taşırken sayfa 404 veriyordu. Derleme kaydını birlikte okuduk; eksik olanın Next.js çalışma ortamı, sonra da bir ortam değişkeni olduğu ortaya çıktı.

## Nerede dikkat etmem gerekti?

**Bilgiler kontrol edilmeli.** Yapay zekâ, ona verdiğim kaynaktaki bilgiyi aynen kullanıyor. CV'mde eski kalmış bir satır yüzünden PsycoAI projesinde kullanmadığımız bir API sitede yazıyordu; araç listesi eksikti, HTML/CSS ise programlama dilleri arasında duruyordu. Bunları ben fark edip düzelttim. Kendini anlatan bir sitede son kontrol hep bende olmalı.

**Zevk ve karar benim.** Asistan pek çok öneri sundu; bazılarını kabul ettim, bazılarını hiç beğenmedim. Açık tema ilk denemede istediğim hissi vermedi; iletişim formunu, fotoğraf kutusunu ve "Yolculuğum" bölümünü kaldırma kararlarını ben verdim. Araç seçenek üretmekte çok iyi, ama hangisinin "ben" olduğunu bilemiyor.

**Her şeyi anlamak hâlâ benim işim.** Kod çalışıyor diye ne yaptığını anlamış olmuyorum. Önemli değişikliklerde açıklamayı okudum ve emin olmadığım yerleri sordum. Aksi halde siteyi bir sonraki değiştirmek istediğimde ne yapacağımı bilemezdim.

## Kullanılmasaydı ne olurdu?

Büyük ihtimalle site yine olurdu, ama çok daha yavaş ve daha sade olurdu. 3B yıldız alanı gibi kısımları belki hiç denemezdim ya da çok basit bir haliyle bırakırdım. Bir tasarımı beğenmeyip baştan almak saatler süreceği için ilk "idare eder" sonuçta durmam daha olasıydı.

Öte yandan bazı şeyleri tek başıma, takılarak ve hata yaparak öğrenirdim; o yolun da kendine göre bir değeri var. `vercel.app` engelini ya da Netlify'daki 404'ü kendim çözmeye çalışsaydım muhtemelen günlerimi alırdı, ama o sorunları bir daha hiç unutmazdım. Yapay zekâyla çalışırken bu dengeyi bilinçli kurmak gerekiyor: hızdan faydalanırken öğrenmeyi atlamamak.

## Sonuç

Benim için yapay zekâ, işi benim yerime yapan bir araçtan çok, hızlı çalışan ve çok şey bilen bir ekip arkadaşı gibiydi. Fikirleri hızla denememi, bilmediğim konularda ilerlememi ve gözden kaçırdığım sorunları yakalamamı sağladı. Ama ne istediğime, neyin doğru olduğuna ve sitenin bana ne kadar benzediğine yine ben karar verdim.

Bu site de, bu yazı da o iş birliğinin bir ürünü.
