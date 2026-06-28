import { createPortal } from 'react-dom'
import type { Bookmark } from '../../hooks/useBookmarks'

interface Props {
  bookmarks: Bookmark[]
  onClose: () => void
  onNavigate: (b: Bookmark) => void
  onRemove: (b: Bookmark) => void
}

const EMOJI: Record<string, string> = { toilet: '🚻', pharmacy: '💊', restaurant: '🍽️' }

export default function BookmarksPanel({ bookmarks, onClose, onNavigate, onRemove }: Props) {
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-[6000]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[6001] bg-white rounded-t-2xl shadow-2xl max-w-lg mx-auto max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">🔖 Saved places</h2>
          <button onClick={onClose} className="text-gray-400 text-xl px-2">✕</button>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="text-4xl mb-3">🔖</div>
            <p className="font-semibold text-gray-700">No saved places yet</p>
            <p className="text-xs text-gray-400 mt-1">Tap the bookmark icon on any place to save it</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {bookmarks.map(b => (
              <li key={b.localId} className="flex items-center gap-3 px-6 py-4">
                <span className="text-2xl flex-shrink-0">{EMOJI[b.category] ?? '📍'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(b.savedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onNavigate(b)}
                    className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => onRemove(b)}
                    className="text-xs text-gray-400 px-2 py-1.5"
                    aria-label="Remove bookmark"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>,
    document.body
  )
}
