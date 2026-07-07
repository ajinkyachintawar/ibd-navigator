import type { Place } from '../../types'
import { formatDistance, getWalkingTime } from '../../utils/formatDistance'

interface Props {
  place: Place
  distance: number | null
  onCancel: () => void
}

export default function PanicCard({ place, distance, onCancel }: Props) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`

  return (
    <div
      className="fixed inset-x-3 bottom-24 z-[900] md:absolute md:inset-x-auto md:left-24 md:bottom-5 md:w-[340px] xl:left-[336px]
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl p-4 border-2 border-brand-red/40"
      style={{ animation: 'sheetUp 0.2s ease' }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0" />
        <p className="text-[13px] font-extrabold tracking-wide text-brand-red">NEAREST RESTROOM</p>
      </div>

      <p className="font-bold text-[17px] mt-2 truncate">{place.name}</p>
      {distance !== null && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {getWalkingTime(distance)} · {formatDistance(distance)}
        </p>
      )}

      <div className="flex gap-2 mt-3.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-white font-bold text-[13.5px] py-2.5 rounded-xl bg-brand-red"
        >
          Get Directions Now
        </a>
        <button
          onClick={onCancel}
          className="px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-[13.5px]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
