import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { Place, UserLocation } from '../../types'
import { haversine } from '../../utils/haversine'
import { formatDistance, getWalkingTime } from '../../utils/formatDistance'
import { isOpenNow } from '../../utils/isOpenNow'

const EMOJI: Record<string, string> = {
  toilet:     '🚻',
  pharmacy:   '💊',
  restaurant: '🍽️',
}

const BORDER_COLOUR: Record<string, string> = {
  toilet:     '#6c3fc5',
  pharmacy:   '#0ea5e9',
  restaurant: '#f97316',
}

const CATEGORY_LABEL: Record<string, string> = {
  toilet:     'Public Toilet',
  pharmacy:   'Pharmacy',
  restaurant: 'Restaurant',
}

function createIcon(category: string) {
  return L.divIcon({
    html: `<div class="place-marker" style="border-color:${BORDER_COLOUR[category] ?? '#6c3fc5'}">${EMOJI[category] ?? '📍'}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  })
}

const STATUS: Record<string, { label: string; colour: string }> = {
  open:    { label: 'Open now',     colour: '#16a34a' },
  closed:  { label: 'Closed',       colour: '#dc2626' },
  unknown: { label: 'Hours unknown', colour: '#9ca3af' },
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
  const status = STATUS[openStatus]
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`
  const accentColour = BORDER_COLOUR[place.category] ?? '#6c3fc5'

  return (
    <Marker position={[place.lat, place.lon]} icon={icon}>
      <Popup minWidth={280} maxWidth={320} className="ibd-popup">
        <div className="ibd-card">
          {/* Category label */}
          <p className="ibd-card-category" style={{ color: accentColour }}>
            {EMOJI[place.category]} {CATEGORY_LABEL[place.category]}
          </p>

          {/* Place name */}
          <h3 className="ibd-card-name">{place.name}</h3>

          {/* Walking time — the most important info */}
          {dist !== null && (
            <div className="ibd-card-distance">
              <span className="ibd-card-time">{getWalkingTime(dist)}</span>
              <span className="ibd-card-dist">· {formatDistance(dist)}</span>
            </div>
          )}

          {/* Status + badges row */}
          <div className="ibd-card-meta">
            <span className="ibd-card-status" style={{ color: status.colour }}>
              ● {status.label}
            </span>
            {place.wheelchair && (
              <span className="ibd-card-badge">♿ Accessible</span>
            )}
            {place.fee && (
              <span className="ibd-card-badge">💰 Fee</span>
            )}
          </div>

          {/* Directions button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ibd-card-btn"
            style={{ background: accentColour }}
          >
            🧭 Directions
          </a>
        </div>
      </Popup>
    </Marker>
  )
}
