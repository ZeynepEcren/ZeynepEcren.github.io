# Zeynep Ecren İkinci — Kişisel Portföy

Bilgisayar mühendisliği öğrencisi Zeynep Ecren İkinci'nin web, mobil ve yapay zekâ projelerini anlatan kişisel portföy sitesi. Arka planda, sayfa kaydırıldıkça derinliğine ilerlenen 3B bir yıldız alanı vardır.

**Teknolojiler:** Vite · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Three.js · Lucide

## Kurulum

```bash
npm install
npm run dev       # geliştirme sunucusu → http://localhost:5173
npm run build     # tip kontrolü + üretim derlemesi + statik ön-render → dist/
npm run preview   # derlenmiş sürümü yerelde önizle
```

Node.js 20+ önerilir.

## Klasör yapısı

```
src/
├── data/content.ts            ← SİTEDEKİ TÜM METİNLER (tek dosya)
├── themes/
│   ├── themes.ts              ← tema kayıt defteri (gökyüzü stili, hareket profili)
│   ├── themes.css             ← tema renkleri ve başlık fontu (CSS değişkenleri)
│   └── ThemeProvider.tsx      ← tema durumu + localStorage
├── sections/                  ← Hero, About, Skills, Projects, Contact, Footer
├── components/
│   ├── three/SpaceScene.tsx   ← 3B yıldız alanı (Three.js, ayrı parça olarak yüklenir)
│   ├── SpaceBackground.tsx    ← sahneyi uygun anda yükleyen sabit arka plan
│   ├── ProjectCovers.tsx      ← proje kartlarındaki çizim kapaklar (SVG)
│   ├── Logo.tsx               ← yıldız logo
│   ├── icons/BrandIcons.tsx   ← GitHub / LinkedIn / Küre / e-posta ikonları
│   └── Navbar, ThemeSwitcher, Reveal, TiltCard, Magnetic, Modal, ScrollProgress …
├── hooks/                     ← useTheme, useMediaQuery, useTypewriter, useActiveSection, useIdle
├── App.tsx · NotFound.tsx     ← ana sayfa ve 404 sayfası
├── main.tsx · not-found.tsx   ← istemci girişleri (ön-render edilmiş HTML'i hydrate eder)
├── entry-server.tsx           ← build sırasında statik HTML üretir
└── index.css                  ← Tailwind + ortak bileşen sınıfları
public/
├── theme-init.js              ← temayı ilk boyamadan önce seçer
├── og-image.png               ← paylaşım önizlemesi görseli (1200×630)
├── favicon.svg
└── Zeynep_Ecren_Ikinci_CV.pdf ← "CV'yi indir" bağlantısının dosyası
scripts/prerender.mjs          ← ön-render HTML'i ve site adresini dist/ içine yerleştirir
```

## İçerik nasıl düzenlenir?

Tüm metinler **`src/data/content.ts`** içindedir.

| Ne değiştirmek istiyorsunuz? | `content.ts` içindeki alan |
| --- | --- |
| İsim, unvan, dönen roller, kısa tanıtım, konum, e-posta | `profile` |
| Sosyal bağlantılar | `profile.socials` (`kind`: `github`, `linkedin`, `kure`, `email`, `website`) |
| Hakkımda paragrafları | `sections.about` |
| İstatistikler ve üzerine gelince açılan detaylar | `sections.about.stats` (`details` isteğe bağlı) |
| Yetenek grupları | `skills` (`learning: true` → "Öğreniyorum" grubu) |
| Projeler | `projects` (`category`: `web` veya `ai`) |
| Buton, menü ve diğer arayüz metinleri | `ui` |

- **CV:** `public/Zeynep_Ecren_Ikinci_CV.pdf` dosyasını aynı adla değiştirmek yeterli. PDF'i yüklemeden önce telefon numarası gibi kişisel bilgilerin metin katmanında da kalmadığını kontrol edin; üstünü kapatmak yetmez.
- **Proje kapakları:** `components/ProjectCovers.tsx` içinde proje `id`'sine göre eşlenir. Yeni bir proje için buraya bir SVG bileşeni ekleyin ya da projeye `image` alanıyla bir görsel yolu verin.
- **Yetenek logoları:** `sections/Skills.tsx` içindeki eşlemeden gelir ([Devicon](https://devicon.dev)); logosu olmayanlar için Lucide ikonu kullanılır.

## Temalar

| Tema | Görünüm |
| --- | --- |
| **Koyu** (`space`, varsayılan) | Gece mavisi zemin, parlayan yıldızlar, yıldız kümeleri, bulutsular ve altın takımyıldız çizgileri. Başlık fontu Sora. |
| **Yıldız atlası** (`atlas`, açık) | Eski bir gök atlası gibi krem zemin, mürekkep yıldızlar, bordo takımyıldızlar ve enlem/boylam ızgarası. Başlık fontu Cormorant Garamond. |

Tema seçimi şu sırayla yapılır: `?theme=atlas` gibi bir URL parametresi → daha önce seçilen tema (`localStorage`, `portfolio-theme`) → işletim sisteminin açık/koyu tercihi. Gövde metni her iki temada da Manrope'tur.

Yeni bir tema eklemek için `themes.css` içine renk bloğu, `themes.ts` içine `ThemeDef` ve `themeOrder` kaydı, `content.ts` içine görünen ad (`ui.themes.names`) ve `public/theme-init.js` içindeki `ids` listesine tema kimliği eklenir. Eksik bir alan TypeScript tarafından bildirilir.

## Yayına alma (GitHub Pages)

Site **https://zeynepecren.github.io** adresinde yayındadır. `main` dalına yapılan her gönderimde `.github/workflows/deploy.yml` siteyi derleyip GitHub Pages'te yeniden yayınlar; ilerlemesi deponun **Actions** sekmesinden izlenebilir.

Paylaşım önizlemesi (Open Graph) için tam site adresi gerekir; iş akışı bunu `SITE_URL` ile verir. Kendi alan adınızı bağlarsanız bu değeri de güncelleyin. Başka bir sunucuda derlerken:

```bash
SITE_URL=https://alanadiniz.com npm run build
```

Vercel'de derlenirse adres `VERCEL_PROJECT_PRODUCTION_URL`'den kendiliğinden alınır. Ancak `*.vercel.app` adresleri Türkiye'den erişime kapalı olduğu için site GitHub Pages'te yayınlanıyor.

`404.html` derlemede üretilir; GitHub Pages bulunamayan sayfalarda bunu otomatik gösterir.

## Performans ve erişilebilirlik

- `npm run build` sayfayı **statik HTML olarak önceden render eder**; metin JavaScript beklenmeden görünür, React ardından hydrate eder.
- Three.js sahnesi **ayrı bir parça** olarak yüklenir: masaüstünde tarayıcı boşa çıkınca, mobilde ilk dokunuş veya kaydırmada. Mobilde yıldız yoğunluğu düşürülür; sekme arka plandayken çizim durur.
- Fontlar paketle birlikte yerelden sunulur; harici font isteği yoktur.
- `prefers-reduced-motion` açıksa gökyüzü sabit kalır, kaydırma animasyonları, eğilme ve manyetik butonlar kapanır.
- "İçeriğe geç" bağlantısı, görünür odak halkaları, klavyeyle açılan istatistik detayları ve ikon etiketleri, odak tuzaklı ve Esc ile kapanan proje penceresi, `aria-*` etiketleri.
