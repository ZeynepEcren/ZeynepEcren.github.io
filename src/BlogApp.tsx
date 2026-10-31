import { MotionConfig } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useAnalytics, useViewCount } from './analytics'
import { formatDate, getPost, posts, slugFromPath, type Post } from './blog/posts'
import { Navbar } from './components/Navbar'
import { Reveal, Stagger, StaggerItem } from './components/Reveal'
import { ScrollProgress } from './components/ScrollProgress'
import { SpaceBackground } from './components/SpaceBackground'
import { content } from './data/content'
import { Footer } from './sections/Footer'

const t = content.ui.blog

/** Sayfa başlığı ve açıklaması; ön-render (scripts/prerender.mjs) ve tarayıcı aynı değeri kullanır. */
export function blogMeta(path: string) {
  const slug = slugFromPath(path)
  if (!slug) return { title: t.metaTitle, description: t.metaDescription }
  const post = getPost(slug)
  if (!post) return { title: `${t.notFoundTitle} — ${content.profile.name}`, description: t.metaDescription }
  return { title: `${post.title} — ${content.profile.name}`, description: post.summary || t.metaDescription }
}

function PostMeta({ post, views }: { post: Post; views?: number | null }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wider text-muted uppercase">
      {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
      <span aria-hidden="true">·</span>
      <span>{t.readingTime(post.readingMinutes)}</span>
      {views != null && (
        <>
          <span aria-hidden="true">·</span>
          <span>{t.views(views)}</span>
        </>
      )}
      {post.draft && <span className="text-accent">{t.draft}</span>}
    </p>
  )
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {tags.map((tag) => (
        <li key={tag} className="chip">
          #{tag}
        </li>
      ))}
    </ul>
  )
}

function PostList() {
  return (
    <>
      <Reveal className="mb-12 max-w-2xl md:mb-16">
        <p className="eyebrow mb-3 flex items-center gap-3 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t.eyebrow}
        </p>
        <h1 className="text-4xl font-bold text-fg sm:text-5xl md:text-6xl">{t.title}</h1>
        <p className="mt-4 text-base text-muted md:text-lg">{t.subtitle}</p>
      </Reveal>

      {posts.length === 0 ? (
        <p className="rule pt-8 text-muted">{t.empty}</p>
      ) : (
        <Stagger className="grid grid-cols-1">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <article className="rule group relative py-8">
                <PostMeta post={post} />
                <h2 className="mt-3 text-2xl font-semibold text-fg transition-colors group-hover:text-accent sm:text-3xl">
                  {/* Bağlantı tüm satırı kaplar (after:inset-0) */}
                  <a href={`/blog/${post.slug}/`} className="after:absolute after:inset-0">
                    {post.title}
                  </a>
                </h2>
                {post.summary && <p className="mt-3 max-w-3xl text-muted">{post.summary}</p>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <Tags tags={post.tags} />
                  <span className="flex items-center gap-2 text-sm font-medium text-fg transition-colors group-hover:text-accent" aria-hidden="true">
                    {t.read}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </>
  )
}

function BackLink() {
  return (
    <a href="/blog/" className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent">
      <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
      {t.allPosts}
    </a>
  )
}

function PostView({ post }: { post: Post }) {
  // Sayı tarayıcıda sonradan gelir; ön-render edilen HTML'de yer almaz.
  const views = useViewCount(`/blog/${post.slug}/`)
  return (
    // Uzun metin yıldızların ve takımyıldız çizgilerinin üzerinde okunaklı kalsın diye bulanık bir zemin (çerçevesiz).
    <article className="bar mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-12">
      <Reveal>
        <BackLink />
        <div className="mt-10">
          <PostMeta post={post} views={views} />
        </div>
        <h1 className="mt-4 text-4xl leading-tight font-bold text-fg sm:text-5xl">{post.title}</h1>
        {post.summary && <p className="mt-5 text-lg text-muted">{post.summary}</p>}
        <div className="mt-5">
          <Tags tags={post.tags} />
        </div>
      </Reveal>
      {/* Yazının içeriği kendi Markdown dosyalarımızdan gelir; dışarıdan girdi değildir. */}
      <div className="prose-blog rule mt-10 pt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="rule mt-16 pt-8">
        <BackLink />
      </div>
    </article>
  )
}

function Missing() {
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink />
      <h1 className="mt-10 text-4xl font-bold text-fg sm:text-5xl">{t.notFoundTitle}</h1>
      <p className="mt-5 text-lg text-muted">{t.notFoundMessage}</p>
    </div>
  )
}

export default function BlogApp({ path }: { path: string }) {
  const slug = slugFromPath(path)
  const post = slug ? getPost(slug) : undefined
  useAnalytics()

  useEffect(() => {
    const meta = blogMeta(path)
    document.title = meta.title
    document.documentElement.lang = content.meta.lang
  }, [path])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="btn btn-primary fixed top-3 left-3 z-[90] -translate-y-24 focus:translate-y-0">
        {content.ui.skipToContent}
      </a>
      {post && <ScrollProgress />}
      <SpaceBackground />
      <Navbar page="blog" />
      <main id="main" className="relative">
        <div id="top" className="mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 md:pt-40 md:pb-32">
          {slug === null ? <PostList /> : post ? <PostView post={post} /> : <Missing />}
        </div>
      </main>
      <Footer />
    </MotionConfig>
  )
}
