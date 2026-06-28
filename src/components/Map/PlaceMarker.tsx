import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import type { Place, UserLocation } from '../../types'
import { haversine } from '../../utils/haversine'
import { formatDistance, getWalkingTime } from '../../utils/formatDistance'
import { isOpenNow } from '../../utils/isOpenNow'
import type { User } from '@supabase/supabase-js'
import RatingSheet from '../Ratings/RatingSheet'
import AuthSheet from '../Auth/AuthSheet'

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

// For venues with toilets=yes, show the actual venue type — not "Public Toilet"
const TOILET_TYPE_LABEL: Record<string, string> = {
  toilets:          'Public Toilet',
  fast_food:        'Fast Food · has toilet',
  cafe:             'Café · has toilet',
  pub:              'Pub · has toilet',
  bar:              'Bar · has toilet',
  restaurant:       'Restaurant · has toilet',
  supermarket:      'Supermarket · has toilet',
  fuel:             'Petrol Station · has toilet',
  shopping_centre:  'Shopping Centre · has toilet',
  department_store: 'Department Store · has toilet',
  cinema:           'Cinema · has toilet',
  theatre:          'Theatre · has toilet',
  hospital:         'Hospital · has toilet',
  clinic:           'Clinic · has toilet',
  pharmacy:         'Pharmacy · has toilet',
}

const CATEGORY_LABEL: Record<string, string> = {
  toilet:     'Public Toilet',
  pharmacy:   'Pharmacy',
  restaurant: 'Restaurant',
}

function getPlaceLabel(category: string, placeType?: string): string {
  if (category === 'toilet' && placeType) {
    return TOILET_TYPE_LABEL[placeType] ?? 'Toilet'
  }
  return CATEGORY_LABEL[category] ?? category
}

function createIcon(category: string, isCommunity: boolean) {
  const border = BORDER_COLOUR[category] ?? '#6c3fc5'
  const emoji  = EMOJI[category] ?? '📍'
  // Community markers: dashed border + 👤 badge
  const style = isCommunity
    ? `border:2.5px dashed ${border};`
    : `border:2.5px solid ${border};`
  const badge = isCommunity
    ? `<span style="position:absolute;top:-4px;right:-4px;font-size:9px;background:white;border-radius:50%;padding:1px">👤</span>`
    : ''
  return L.divIcon({
    html: `<div class="place-marker" style="${style}position:relative">${emoji}${badge}</div>`,
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
  user: User | null
}

export default function PlaceMarker({ place, userLocation, user }: Props) {
  const [showRating, setShowRating] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const isCommunity = place.source === 'community'
  const icon = createIcon(place.category, isCommunity)
  const dist = userLocation
    ? haversine(userLocation.lat, userLocation.lon, place.lat, place.lon)
    : null
  const openStatus = isOpenNow(place.openingHours)
  const status = STATUS[openStatus]
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`
  const accentColour = BORDER_COLOUR[place.category] ?? '#6c3fc5'

  return (
    <>
      <Marker position={[place.lat, place.lon]} icon={icon}>
        <Popup minWidth={260} maxWidth={320} className="ibd-popup">
          <div className="ibd-card">
            {/* Source badge */}
            <p className="ibd-card-category" style={{ color: accentColour }}>
              {EMOJI[place.category]} {getPlaceLabel(place.category, place.placeType).toUpperCase()}
              {isCommunity && (
                <span className="ml-2 text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                  👤 COMMUNITY
                </span>
              )}
            </p>

            <h3 className="ibd-card-name">{place.name}</h3>

            {dist !== null && (
              <div className="ibd-card-distance">
                <span className="ibd-card-time">{getWalkingTime(dist)}</span>
                <span className="ibd-card-dist">·&nbsp;{formatDistance(dist)}</span>
              </div>
            )}

            <p className="ibd-card-status" style={{ color: status.colour }}>
              ● {status.label}
            </p>

            <div className="ibd-card-meta">
              {place.wheelchair && <span className="ibd-card-badge">♿ Accessible</span>}
              {place.fee && <span className="ibd-card-badge">💰 Fee</span>}
            </div>

            {/* Action buttons */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ibd-card-btn"
              style={{ background: accentColour }}
            >
              🧭 Directions
            </a>

            <button
              onClick={() => user ? setShowRating(true) : setShowAuth(true)}
              className="ibd-card-btn mt-2"
              style={{ background: '#f3f4f6', color: '#374151' }}
            >
              ⭐ Rate this place
            </button>
          </div>
        </Popup>
      </Marker>

      {showRating && user && (
        <RatingSheet place={place} user={user} onClose={() => setShowRating(false)} />
      )}
      {showAuth && (
        <AuthSheet onClose={() => setShowAuth(false)} />
      )}
    </>
  )
}
