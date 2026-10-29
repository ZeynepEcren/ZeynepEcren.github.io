import { useContext } from 'react'
import { ThemeContext } from '../themes/ThemeProvider'

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme, ThemeProvider içinde kullanılmalı')
  return ctx
}
