import { useEffect, useState } from 'react'

// Toggles the `dark` class on <html> (Tailwind darkMode: 'class') and persists it.
export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('ibd-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('ibd-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
