import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TRANSLATIONS } from './translations'
import { useAuth } from '../../hooks/useAuth'

const CCI_URL = 'https://crohnscolitis.ie/account/register/'

interface Props {
  onClose: () => void
}

// Deterministic checkerboard placeholder — a real per-user QR isn't wired up
// yet (no backend endpoint to scan against), this just matches the card's look.
function QrPlaceholder() {
  const cells = [1,0,1,1,0,0,1,0,0,1,1,0,1,0,0,1]
  return (
    <div className="grid grid-cols-4 gap-0.5 w-14 h-14 bg-white rounded-md p-1.5 flex-shrink-0">
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-gray-900 rounded-[1px]' : 'bg-transparent'} />
      ))}
    </div>
  )
}

export default function NoWaitCard({ onClose }: Props) {
  const { user } = useAuth()
  const [lang, setLang] = useState<string>(
    () => localStorage.getItem('cwc-lang') ?? 'en'
  )
  const [hasCard, setHasCard] = useState<boolean>(
    () => localStorage.getItem('cwc-has-card') === 'true'
  )
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const current = TRANSLATIONS[lang]
  const displayName = user?.email ? user.email.split('@')[0] : 'IBD Passport Holder'

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
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl bg-white text-gray-900 dark:bg-gray-900 dark:text-white p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="No-Wait Card — show to staff"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">No-Wait Card</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* IBD Passport — teal gradient card matching the app's brand */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'linear-gradient(135deg, #0d9488, #115e59)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-100">IBD Passport</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{displayName}</h3>
            <p className="text-sm text-brand-100 mt-0.5">Urgent restroom access · Crohn's &amp; Colitis</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xs text-brand-100">
              {hasCard ? 'Official CCI card holder' : 'Digital courtesy card'}
            </p>
            <QrPlaceholder />
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Show this card to staff at participating locations to request immediate restroom access, no questions asked.
        </p>

        {/* Multilingual emergency phrase — for use with strangers/staff who need it spelled out */}
        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Show this message</p>
            <select
              value={lang}
              onChange={(e) => handleLang(e.target.value)}
              className="rounded-lg px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Select language"
            >
              {Object.entries(TRANSLATIONS).map(([k, v]) => (
                <option key={k} value={k}>{v.lang}</option>
              ))}
            </select>
          </div>
          <p className="text-sm font-medium leading-relaxed" dir={current?.rtl ? 'rtl' : 'ltr'}>
            {current?.text}
          </p>
        </div>

        {/* Get official card / already have it */}
        {hasCard ? (
          <div className="flex items-center justify-between rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3">
            <span className="text-sm font-semibold">Official card on file</span>
            <button onClick={() => markHasCard(false)} className="text-xs text-gray-500 dark:text-gray-400 underline">remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <a
              href={CCI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl bg-brand-600 text-white"
            >
              Apply via CCI →
            </a>
            <button
              onClick={() => markHasCard(true)}
              className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              I already have it ✓
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
