import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { ScrollProgress } from './components/ScrollProgress'
import { SpaceBackground } from './components/SpaceBackground'
import { content } from './data/content'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'

export default function App() {
  useEffect(() => {
    document.title = content.meta.title
    document.documentElement.lang = content.meta.lang
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.meta.description)
  }, [])

  return (
    // reducedMotion="user": işletim sisteminde "hareketi azalt" açıksa Framer Motion dönüşüm animasyonlarını kapatır
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="btn btn-primary fixed top-3 left-3 z-[90] -translate-y-24 focus:translate-y-0"
      >
        {content.ui.skipToContent}
      </a>
      <ScrollProgress />
      <SpaceBackground />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
