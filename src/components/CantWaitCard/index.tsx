import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TRANSLATIONS } from './translations'

const CCI_URL = 'https://crohnscolitis.ie/account/register/'

interface Props {
  onClose: () => void
}

export default function NoWaitCard({ onClose }: Props) {
  const [lang, setLang] = useState<string>(
    () => localStorage.getItem('cwc-lang') ?? 'en'
  )
  const [hasCard, setHasCard] = useState<boolean>(
    () => localStorage.getItem('cwc-has-card') === 'true'
  )
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const current = TRANSLATIONS[lang]

  // Keep screen on while card is open
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => { wakeLockRef.current = lock })
        .catch(() => {})
    }
    return () => { wakeLockRef.current?.release().catch(() => {}) }
  }, [])

  // Android back button closes card, not app
  useEffect(() => {
    history.pushState({ nwc: true }, '')
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

  const markHasCard = (value: boolean) => {
    setHasCard(value)
    localStorage.setItem('cwc-has-card', String(value))
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: '#8B0000' }}
      role="dialog"
      aria-modal="true"
      aria-label="No Wait Card — show to staff"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 flex-shrink-0">
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
          aria-label="Close"
        >
          ✕ Close
        </button>
      </div>

      {/* Official card banner — shown when user has the physical card */}
      {hasCard && (
        <div
          className="mx-5 mb-2 rounded-xl px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)' }}
        >
          <span className="text-white text-sm font-semibold">
            💳 You have the official No Wait Card
          </span>
          <button
            onClick={() => markHasCard(false)}
            className="text-white/60 text-xs underline ml-3"
          >
            remove
          </button>
        </div>
      )}

      {/* Card text — always visible, this is what staff need to see */}
      <div
        className="flex flex-col flex-1 items-center justify-center text-center px-6 pb-4"
        dir={current?.rtl ? 'rtl' : 'ltr'}
      >
        <div style={{ fontSize: 'clamp(48px, 10vw, 72px)', lineHeight: 1, marginBottom: '1.25rem' }}>
          🚨
        </div>
        <p
          className="text-white font-bold leading-relaxed"
          style={{ fontSize: 'clamp(18px, 4.5vw, 26px)', maxWidth: '720px' }}
        >
          {current?.text}
        </p>
      </div>

      {/* Bottom section — get official card (only shown when user doesn't have it) */}
      {!hasCard && (
        <div
          className="mx-5 mb-5 rounded-2xl p-4 flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-3">
            Get the official No Wait Card
          </p>
          <p className="text-white/70 text-xs mb-3 leading-relaxed">
            Crohn's & Colitis Ireland issue a physical No Wait Card to members. Staff across Ireland recognise it.
          </p>
          <div className="flex gap-2">
            <a
              href={CCI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#8B0000' }}
            >
              Apply via CCI →
            </a>
            <button
              onClick={() => markHasCard(true)}
              className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)' }}
            >
              I already have it ✓
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
