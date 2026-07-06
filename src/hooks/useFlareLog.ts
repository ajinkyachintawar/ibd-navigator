import { useCallback, useState } from 'react'

export type FlareSeverity = 'mild' | 'moderate' | 'severe'

export interface FlareEntry {
  id: string
  date: string // ISO
  severity: FlareSeverity
  note?: string
}

const LOCAL_KEY = 'ibd-flare-log-v1'
const MAX_ENTRIES = 100

function load(): FlareEntry[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') }
  catch { return [] }
}

// ponytail: localStorage only, device-local. Add Supabase sync (mirroring
// useBookmarks' signed-in path) if patients want entries to follow them
// across devices.
export function useFlareLog() {
  const [entries, setEntries] = useState<FlareEntry[]>(load)

  const addEntry = useCallback((severity: FlareSeverity, note: string) => {
    const entry: FlareEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      severity,
      note: note.trim() || undefined,
    }
    setEntries((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { entries, addEntry }
}
