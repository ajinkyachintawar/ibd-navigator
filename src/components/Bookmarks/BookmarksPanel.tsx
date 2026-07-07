import { createPortal } from 'react-dom'
import type { Bookmark } from '../../hooks/useBookmarks'
import type { UserLocation } from '../../types'
import { haversine } from '../../utils/haversine'
import { formatDistance } from '../../utils/formatDistance'
import { PIN_LABEL, PIN_COLOUR } from '../Map/placeMeta'

interface Props {
  bookmarks: Bookmark[]
  userLocation: UserLocation | null
  onClose: () => void
  onNavigate: (b: Bookmark) => void
  onRemove: (b: Bookmark) => void
}

export default function BookmarksPanel({ bookmarks, userLocation, onClose, onNavigate, onRemove }: Props) {
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-[6000]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[6001] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-2xl shadow-2xl max-w-lg mx-auto max-h-[70vh] flex flex-col
                       md:inset-0 md:m-auto md:w-[410px] md:max-w-none md:h-fit md:rounded-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold">Saved places</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300">✕</button>
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
            <p className="font-semibold text-gray-700 dark:text-gray-200">No saved places yet</p>
            <p className="text-xs text-gray-400 mt-1">Tap the bookmark icon on any place to save it</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto flex flex-col gap-2 px-6 py-4">
            {bookmarks.map(b => {
              const dist = userLocation ? haversine(userLocation.lat, userLocation.lon, b.lat, b.lon) : null
              return (
                <li key={b.localId}>
                  <button
                    onClick={() => onNavigate(b)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: PIN_COLOUR[b.category] ?? '#005c4a' }}
                    >
                      {PIN_LABEL[b.category] ?? '•'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{b.name}</p>
                      {dist !== null && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDistance(dist)}</p>
                      )}
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onRemove(b) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove(b) } }}
                      aria-label="Remove bookmark"
                      className="text-gray-300 dark:text-gray-500 px-2 py-1.5 flex-shrink-0"
                    >
                      ✕
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>,
    document.body
  )
}
