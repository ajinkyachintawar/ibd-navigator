import type { Place } from '../../types'
import { formatDistance, getWalkingTime } from '../../utils/formatDistance'
import { isOpenNow } from '../../utils/isOpenNow'
import { PIN_LABEL, PIN_COLOUR, PIN_TINT, isVenueToilet, VENUE_TOILET_SHORT, getPlaceLabel, STATUS } from './placeMeta'

interface Props {
  place: Place
  distance: number | null
  isCommunity: boolean
  isIbdFriendly: boolean
  isBookmarked: boolean
  onClose: () => void
  onBookmarkToggle: () => void
  onRate: () => void
}

export default function PlaceDetailSheet({
  place,
  distance,
  isCommunity,
  isIbdFriendly,
  isBookmarked,
  onClose,
  onBookmarkToggle,
  onRate,
}: Props) {
  const colour = PIN_COLOUR[place.category] ?? '#005c4a'
  const tint = PIN_TINT[place.category] ?? '#f0fdfa'
  const glyph = PIN_LABEL[place.category] ?? '•'
  const venueToilet = isVenueToilet(place)
  const openStatus = isOpenNow(place.openingHours)
  const status = STATUS[openStatus]
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`

  return (
    <div
      className="fixed inset-x-3 bottom-24 z-[900] md:absolute md:inset-x-auto md:left-24 md:bottom-5 md:w-[340px] xl:left-[336px]
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl p-4"
      style={{ animation: 'sheetUp 0.2s ease' }}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0"
            style={{ background: tint, color: colour }}
          >
            {glyph}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[15px] truncate">{place.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {getPlaceLabel(place.category, place.placeType)}
              {distance !== null && <> · {getWalkingTime(distance)} · {formatDistance(distance)}</>}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-300 flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <p className="text-[11.5px] font-semibold mt-2.5" style={{ color: status.colour }}>
        ● {status.label}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {isCommunity && (
          <span className="text-[9px] font-bold bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded-full">
            COMMUNITY
          </span>
        )}
        {isIbdFriendly && (
          <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
            IBD-FRIENDLY
          </span>
        )}
        {place.wheelchair && (
          <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
            Accessible
          </span>
        )}
        {place.fee && (
          <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
            Fee
          </span>
        )}
      </div>

      {/* Access hint — the patient's real question: "can I just walk in?" */}
      {place.category === 'toilet' && (
        venueToilet ? (
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug mt-2">
            Inside {VENUE_TOILET_SHORT[place.placeType!]} — you may need to be a customer
          </p>
        ) : (
          <p className="text-[11px] text-green-700 dark:text-green-400 font-medium leading-snug mt-2">
            Public toilet — walk straight in
          </p>
        )
      )}

      {/* Accessible toilets are often locked — flag that a key may be needed */}
      {place.category === 'toilet' && place.wheelchair && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-1">
          May be locked — needs an accessible-toilet key.{' '}
          <a
            href="https://www.iwa.ie/faq/where-can-i-get-the-universal-key-for-accessible-toilets/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-700 dark:text-brand-300 font-semibold underline"
          >
            Get one
          </a>
        </p>
      )}

      <div className="flex gap-2 mt-3.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-white font-bold text-[13.5px] py-2.5 rounded-xl"
          style={{ background: colour }}
        >
          Directions
        </a>
        <button
          onClick={onBookmarkToggle}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this place'}
          className="w-11 rounded-xl flex items-center justify-center text-base"
          style={{
            background: isBookmarked ? '#ede0ff' : '#f3f4f6',
            color: isBookmarked ? PIN_COLOUR.pharmacy : '#9ca3af',
          }}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
        <button
          onClick={onRate}
          aria-label="Rate this place"
          className="w-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
        >
          Rate
        </button>
      </div>
    </div>
  )
}
