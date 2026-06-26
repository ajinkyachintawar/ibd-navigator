import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { Place, UserLocation } from '../../types'
import { haversine } from '../../utils/haversine'
import { formatDistance, getWalkingTime } from '../../utils/formatDistance'
import { isOpenNow } from '../../utils/isOpenNow'

const EMOJI: Record<string, string> = {
  toilet: '🚻',
  pharmacy: '💊',
  restaurant: '🍽️',
}

const BORDER: Record<string, string> = {
  toilet: '#6c3fc5',
  pharmacy: '#27ae60',
  restaurant: '#e67e22',
}

function createIcon(category: string) {
  return L.divIcon({
    html: `<div class="place-marker" style="border-color:${BORDER[category] ?? '#6c3fc5'}">${EMOJI[category] ?? '📍'}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

const STATUS_LABEL: Record<string, string> = {
  open: '🟢 Open now',
  closed: '🔴 Closed',
  unknown: '⚫ Hours unknown',
}

interface Props {
  place: Place
  userLocation: UserLocation | null
}

export default function PlaceMarker({ place, userLocation }: Props) {
  const icon = createIcon(place.category)
  const dist = userLocation
    ? haversine(userLocation.lat, userLocation.lon, place.lat, place.lon)
    : null
  const openStatus = isOpenNow(place.openingHours)
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`

  return (
    <Marker position={[place.lat, place.lon]} icon={icon}>
      <Popup minWidth={220}>
        <div className="flex flex-col gap-1 py-1">
          <p className="font-bold text-gray-800 text-sm leading-snug">{place.name}</p>

          {dist !== null && (
            <p className="text-xs text-blue-600 font-semibold">
              🚶 {getWalkingTime(dist)} · {formatDistance(dist)}
            </p>
          )}

          <p className="text-xs text-gray-500">{STATUS_LABEL[openStatus]}</p>

          {place.wheelchair && (
            <p className="text-xs text-gray-500">♿ Wheelchair accessible</p>
          )}
          {place.fee && (
            <p className="text-xs text-gray-500">💰 Fee required</p>
          )}

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg py-1.5 px-3 transition-colors"
          >
            Get Walking Directions
          </a>
        </div>
      </Popup>
    </Marker>
  )
}
