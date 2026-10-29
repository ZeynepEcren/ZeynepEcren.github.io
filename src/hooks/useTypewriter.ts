import { useEffect, useState } from 'react'

interface Options {
  typeSpeed?: number
  deleteSpeed?: number
  pause?: number
  enabled?: boolean
}

/** Kelimeler arasında döngüyle yazıp silen typewriter efekti. */
export function useTypewriter(words: string[], { typeSpeed = 70, deleteSpeed = 40, pause = 1600, enabled = true }: Options = {}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(enabled ? '' : words[0] ?? '')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!enabled || words.length === 0) {
      setText(words[0] ?? '')
      return
    }
    const word = words[index % words.length]
    let delay = deleting ? deleteSpeed : typeSpeed

    if (!deleting && text === word) delay = pause
    else if (deleting && text === '') delay = 300

    const timer = window.setTimeout(() => {
      if (!deleting && text === word) setDeleting(true)
      else if (deleting && text === '') {
        setDeleting(false)
        setIndex((i) => (i + 1) % words.length)
      } else {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1))
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [text, deleting, index, words, enabled, typeSpeed, deleteSpeed, pause])

  return text
}
