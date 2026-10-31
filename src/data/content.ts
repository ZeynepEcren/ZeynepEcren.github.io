/**
 * SİTEDEKİ TÜM METİNLER BURADA.
 *
 * - Köşeli parantez içindeki değerler ([...]) yer tutucudur; kendi bilgilerinizle değiştirin.
 * - Görsel yolları `public/` klasörüne göredir (ör. `public/images/foto.jpg` → `/images/foto.jpg`).
 *   Görsel boş bırakılırsa tema renklerine uyan otomatik bir yer tutucu gösterilir.
 * - İngilizce eklemek için: `tr` nesnesini kopyalayıp `const en: Content = { ... }` oluşturun,
 *   `locales` nesnesine ekleyin ve `defaultLocale` değerini değiştirin.
 */

export type ProjectCategory = 'web' | 'ai'
export type SocialKind = 'github' | 'linkedin' | 'kure' | 'email' | 'website'

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  year: string
  summary: string
  description: string
  highlights: string[]
  tags: string[]
  image?: string
  github?: string
  demo?: string
}

const tr = {
  meta: {
    lang: 'tr',
    title: 'Zeynep Ecren İkinci — Yazılım Geliştirici',
    description: 'Bilgisayar mühendisliği öğrencisi Zeynep Ecren İkinci’nin web, mobil ve yapay zekâ projelerini içeren kişisel portföyü.',
  },

  ui: {
    skipToContent: 'İçeriğe geç',
    nav: {
      label: 'Ana gezinme',
      about: 'Hakkımda',
      skills: 'Yetenekler',
      projects: 'Projeler',
      contact: 'İletişim',
      blog: 'Blog',
      openMenu: 'Menüyü aç',
      closeMenu: 'Menüyü kapat',
      home: 'Başa dön',
    },
    themes: {
      label: 'Temaya geç',
      names: {
        space: 'Koyu',
        atlas: 'Yıldız atlası',
      },
    },
    hero: {
      greeting: 'Merhaba, ben',
      ctaProjects: 'Projelerimi gör',
      ctaContact: 'İletişime geç',
      scrollHint: 'Kaydır ve uzayda ilerle',
      rolesLabel: 'Uzmanlık alanları',
    },
    projects: {
      categories: { web: 'Web', ai: 'AI' },
      details: 'Detaylar',
      github: 'GitHub',
      demo: 'Canlı Demo',
      close: 'Kapat',
      highlights: 'Öne çıkanlar',
      tech: 'Teknolojiler',
    },
    contact: {
      location: 'Konum',
      cvLabel: 'Özgeçmiş · PDF',
      cvAction: 'CV’yi indir',
      socialsLabel: 'Sosyal bağlantılar',
    },
    notFound: {
      metaTitle: '404 — Sayfa bulunamadı',
      code: '404',
      title: 'Sayfa bulunamadı',
      message: 'Aradığın sayfa taşınmış, kaldırılmış ya da hiç var olmamış olabilir. Seni doğru yere götürelim.',
      home: 'Ana sayfaya dön',
      projects: 'Projelere göz at',
      back: 'Önceki sayfaya dön',
    },
    blog: {
      metaTitle: 'Blog — Zeynep Ecren İkinci',
      metaDescription: 'Zeynep Ecren İkinci’nin yazılım, yapay zekâ ve projeleri üzerine yazıları.',
      eyebrow: 'Blog',
      title: 'Yazılar',
      subtitle: 'Öğrendiklerim, projelerimin perde arkası ve aklıma takılanlar.',
      empty: 'Henüz yazı yok. Yakında burada olacak.',
      read: 'Yazıyı oku',
      allPosts: 'Tüm yazılar',
      readingTime: (minutes: number) => `${minutes} dk okuma`,
      notFoundTitle: 'Yazı bulunamadı',
      notFoundMessage: 'Bu adreste bir yazı yok; taşınmış ya da kaldırılmış olabilir.',
      draft: 'Taslak',
    },
    footer: {
      rights: 'Tüm hakları saklıdır.',
      builtWith: 'React ve Three.js ile geliştirildi.',
      backToTop: 'Yukarı çık',
    },
  },

  profile: {
    name: 'Zeynep Ecren İkinci',
    shortName: 'ZEİ',
    title: 'Bilgisayar Mühendisliği Öğrencisi · Yazılım Geliştirici',
    roles: [
      'Web Geliştirme',
      'Mobil Uygulama Geliştirme',
      'Yapay Zekâ Uygulamaları',
      '3B & İnteraktif Web',
    ],
    tagline:
      'React, Next.js, React Native ve Python ile web, mobil ve yapay zekâ alanlarında uçtan uca projeler geliştiriyorum; öğrendiklerimi gerçek ürünlere dönüştürmeye odaklanıyorum.',
    location: 'Erzincan, Türkiye',
    email: 'z.ecren.ikinci@gmail.com',
    cv: '/Zeynep_Ecren_Ikinci_CV.pdf',
    socials: [
      { kind: 'github', label: 'GitHub', url: 'https://github.com/ZeynepEcren' },
      { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/zeynep-ecren-ikinci-94bb33340' },
      { kind: 'kure', label: 'Küre Ansiklopedi', url: 'https://kureansiklopedi.com/tr/profil/ZeynepEcren' },
      { kind: 'email', label: 'E-posta', url: 'mailto:z.ecren.ikinci@gmail.com' },
    ] as { kind: SocialKind; label: string; url: string }[],
  },

  sections: {
    about: {
      eyebrow: 'Hakkımda',
      title: 'Kod, veri ve merak',
      paragraphs: [
        'Erzincan Binali Yıldırım Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim. Web ve mobil uygulama geliştirme ile yapay zekâ alanlarında; React, Next.js, React Native ve Python ile uçtan uca projeler geliştiriyorum.',
        'Fikirden yayına aldığım kişisel projelerle pratik deneyimimi sürekli büyütüyorum. Yaptığım stajlarda takım içinde gerçek projelerde çalıştım.',
      ],
      stats: [
        { value: '4.', label: 'Sınıf' },
        {
          value: '3',
          label: 'Sertifika',
          details: [
            { title: 'Veri Analizi Okulu', meta: 'YÖK · Marmara Ü. koordinasyonu · 2025–2026' },
            { title: 'Blokzincir & Akıllı Sözleşmeler', meta: 'TÜBİTAK 2237-A · Ekim 2025' },
            { title: 'TÜBİTAK Kamp Programı', meta: 'Milli Teknoloji Kulüpler Birliği Akademisi · Mayıs 2026' },
          ],
        },
        {
          value: '2',
          label: 'Staj deneyimi',
          details: [
            { title: 'Sosyal yardım uygulaması', meta: 'Yazılım stajyeri · Temmuz 2025' },
            { title: 'E-ticaret sitesi (PHP yönetim paneli)', meta: 'Yazılım stajyeri · Eylül 2025' },
          ],
        },
      ] as { value: string; label: string; details?: { title: string; meta: string }[] }[],
    },
    skills: {
      eyebrow: 'Yetenekler',
      title: 'Teknoloji yığını',
      subtitle: 'Projelerimde kullandığım diller, çatılar ve araçlar.',
    },
    projects: {
      eyebrow: 'Projeler',
      title: 'Seçili çalışmalar',
      subtitle: 'Fikirden yayına taşıdığım kişisel ve akademik projelerimden bir seçki.',
    },
    contact: {
      eyebrow: 'İletişim',
      title: 'Birlikte bir şeyler inşa edelim',
      subtitle:
        'Bir proje fikriniz, iş birliği teklifiniz ya da sadece bir sorunuz mu var? E-posta veya LinkedIn üzerinden bana ulaşabilirsiniz.',
    },
  },

  skills: [
    { id: 'languages', title: 'Diller', items: ['Python', 'Java', 'C', 'C++', 'C#', 'PHP', 'JavaScript', 'SQL'] },
    { id: 'web', title: 'Web & Mobil', items: ['HTML', 'CSS', 'React', 'Next.js', 'React Native', 'Expo', 'Three.js', 'React Three Fiber'] },
    { id: 'backend', title: 'Backend & Veritabanı', items: ['MySQL', 'PostgreSQL', 'Supabase', 'REST API'] },
    { id: 'ai', title: 'Yapay Zekâ', items: ['OpenCV', 'Qwen 3B VL', 'Claude'] },
    { id: 'tools', title: 'Araçlar', items: ['Git', 'GitHub', 'VS Code', 'Anaconda', 'Spyder', 'Google Colab', 'Android Studio', 'Xcode', 'Unity'] },
    { id: 'learning', title: 'Öğreniyorum', learning: true, items: ['TensorFlow', 'PyTorch', 'scikit-learn'] },
  ] as { id: string; title: string; items: string[]; learning?: boolean }[],

  projects: [
    {
      id: 'astro-journey',
      title: 'astro-journey',
      category: 'web',
      year: '', // CV'de yıl belirtilmemiş
      summary: 'İnteraktif astronomi web uygulaması: 3B güneş sistemi, planetaryum ve gezegen hikâyeleri.',
      description:
        '3B güneş sistemi, konum tabanlı gece gökyüzü planetaryumu ve 8 gezegen için scrollytelling hikâye modu içeren, uçtan uca geliştirilmiş bir web uygulaması. Vercel üzerinde canlı olarak yayında; kimlik doğrulama Supabase ile sağlandı.',
      highlights: [
        'Etkileşimli 3B güneş sistemi',
        'Konum tabanlı gece gökyüzü planetaryumu',
        '8 gezegen için scrollytelling hikâye modu',
        'Supabase ile kimlik doğrulama, Vercel’de canlı',
      ],
      tags: ['Next.js', 'React Three Fiber', 'Three.js', 'Supabase'],
      image: '',
      github: 'https://github.com/ZeynepEcren/astro-journey',
      demo: 'https://astrojourney.netlify.app',
    },
    {
      id: 'psycoai',
      title: 'PsycoAI',
      category: 'ai',
      year: '', // CV'de yıl belirtilmemiş
      summary: 'Çocuk çizimlerini HTP (Ev-Ağaç-İnsan) testine göre değerlendiren yapay zekâ destekli analiz aracı.',
      description:
        'Çocuk çizimlerini HTP (Ev-Ağaç-İnsan) testine göre değerlendiren, yapay zekâ tabanlı bir analiz aracı. Çizimlerin değerlendirilmesinde Qwen 3B VL görsel-dil modeli kullanıldı. Bu proje ile TÜBİTAK 2242 Üniversite Öğrencileri Araştırma Proje Yarışması’na başvuruldu.',
      highlights: [
        'HTP (Ev-Ağaç-İnsan) testine dayalı çizim analizi',
        'Qwen 3B VL görsel-dil modeliyle çizim değerlendirmesi',
        'TÜBİTAK 2242 Araştırma Proje Yarışması başvurusu',
      ],
      tags: ['Next.js', 'Qwen 3B VL', 'PostgreSQL'],
      image: '',
    },
  ] as Project[],

}

export type Content = typeof tr

export const locales = { tr } satisfies Record<string, Content>
export type Locale = keyof typeof locales
export const defaultLocale: Locale = 'tr'

export const content: Content = locales[defaultLocale]
