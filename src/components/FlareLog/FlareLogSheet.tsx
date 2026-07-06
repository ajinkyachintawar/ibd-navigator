import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useFlareLog, type FlareSeverity } from '../../hooks/useFlareLog'

interface Props {
  onClose: () => void
  onQuickFlareMode: () => void
}

const SEVERITIES: { value: FlareSeverity; label: string; color: string }[] = [
  { value: 'mild', label: 'Mild', color: '#16a34a' },
  { value: 'moderate', label: 'Moderate', color: '#d97706' },
  { value: 'severe', label: 'Severe', color: '#dc2626' },
]

const SEVERITY_LOOKUP = Object.fromEntries(SEVERITIES.map((s) => [s.value, s]))

export default function FlareLogSheet({ onClose, onQuickFlareMode }: Props) {
  const { entries, addEntry } = useFlareLog()
  const [severity, setSeverity] = useState<FlareSeverity>('mild')
  const [note, setNote] = useState('')

  const handleSave = () => {
    addEntry(severity, note)
    setNote('')
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-[6000]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[6001] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-2xl shadow-2xl max-w-lg mx-auto max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-lg font-bold">Flare log</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300">✕</button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            {SEVERITIES.map(({ value, label, color }) => {
              const active = severity === value
              return (
                <button
                  key={value}
                  onClick={() => setSeverity(value)}
                  style={active ? { background: color, color: '#fff' } : undefined}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active ? '' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (trigger, symptoms...)"
            rows={2}
            maxLength={200}
            className="w-full border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-brand-500 resize-none"
          />

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm mb-3"
          >
            Save entry
          </button>

          <button
            onClick={onQuickFlareMode}
            className="w-full py-2.5 rounded-xl bg-brand-red/10 text-brand-red font-semibold text-xs mb-6"
          >
            🚨 Quick: show nearest toilets only (500m)
          </button>

          {entries.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Recent entries</p>
              <ul className="flex flex-col gap-2">
                {entries.slice(0, 20).map((e) => {
                  const s = SEVERITY_LOOKUP[e.severity]
                  return (
                    <li key={e.id} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 w-12">
                        {new Date(e.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: s.color }}>{s.label}</span>
                      {e.note && <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{e.note}</span>}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
