import { useState } from 'react'
import type { UserLocation } from '../../types'

interface Props {
  onResult: (loc: UserLocation, label: string) => void
  activeLabel: string | null
  onClear: () => void
  dark: boolean
  onToggleDark: () => void
  hideToggle?: boolean
}

// Geocodes a town/address to a point via OSM Nominatim (Ireland-scoped, free).
export default function SearchBar({ onResult, activeLabel, onClear, dark, onToggleDark, hideToggle }: Props) {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const query = q.trim()
    if (!query) return
    setBusy(true)
    setNotFound(false)
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ie&q=' +
        encodeURIComponent(query)
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        onResult(
          { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) },
          data[0].display_name.split(',')[0]
        )
        setQ('')
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={submit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/95 dark:bg-gray-900/90 backdrop-blur shadow-lg rounded-full px-3 py-2.5 min-w-0">
          <span className="text-gray-400 text-sm flex-shrink-0">🔍</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setNotFound(false) }}
            placeholder={activeLabel ? `📍 ${activeLabel}` : 'Search a town or address…'}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 min-w-0"
            aria-label="Search nearby places"
          />
          {busy && (
            <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-brand-700 rounded-full animate-spin flex-shrink-0" />
          )}
          {activeLabel && !busy && (
            <button type="button" onClick={onClear} aria-label="Clear search location" className="text-gray-400 text-xs flex-shrink-0">
              ✕
            </button>
          )}
        </div>
        {!hideToggle && (
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur shadow-lg text-gray-500 dark:text-gray-300 flex items-center justify-center"
          >
            {dark ? '☀' : '☾'}
          </button>
        )}
      </form>
      {notFound && (
        <p className="text-[11px] text-amber-600 px-3">No match in Ireland — try a town or full address.</p>
      )}
    </div>
  )
}
