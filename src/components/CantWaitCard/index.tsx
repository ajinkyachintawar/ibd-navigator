import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TRANSLATIONS } from './translations'

interface Props {
  onClose: () => void
}

export default function CantWaitCard({ onClose }: Props) {
  const [lang, setLang] = useState<string>(
    () => localStorage.getItem('cwc-lang') ?? 'en'
  )
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const current = TRANSLATIONS[lang]

  // Keep screen on while card is open
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => { wakeLockRef.current = lock })
        .catch(() => {/* graceful fail */})
    }
    return () => {
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  // Android back button closes the card instead of exiting the app
  useEffect(() => {
    history.pushState({ cwc: true }, '')
    const handlePop = () => onClose()
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [onClose])

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleLang = (newLang: string) => {
    setLang(newLang)
    localStorage.setItem('cwc-lang', newLang)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: '#8B0000' }}
      role="dialog"
      aria-modal="true"
      aria-label="Can't Wait card — show to staff"
    >
      {/* Header row */}
      <div className="flex items-center justify-between p-5">
        <select
          value={lang}
          onChange={(e) => handleLang(e.target.value)}
          className="rounded-xl px-3 py-2 text-white font-semibold text-sm"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.35)' }}
          aria-label="Select language"
        >
          {Object.entries(TRANSLATIONS).map(([k, v]) => (
            <option key={k} value={k} style={{ background: '#8B0000' }}>
              {v.lang}
            </option>
          ))}
        </select>

        <button
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-white font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.35)' }}
          aria-label="Close card"
        >
          ✕ Close
        </button>
      </div>

      {/* Card body */}
      <div
        className="flex flex-col flex-1 items-center justify-center text-center px-6 pb-8"
        dir={current?.rtl ? 'rtl' : 'ltr'}
      >
        <div style={{ fontSize: 'clamp(54px, 12vw, 80px)', lineHeight: 1, marginBottom: '1.5rem' }}>
          🚨
        </div>
        <p
          className="text-white font-bold leading-relaxed"
          style={{ fontSize: 'clamp(18px, 4.5vw, 28px)', maxWidth: '720px' }}
        >
          {current?.text}
        </p>
      </div>
    </div>,
    document.body
  )
}
