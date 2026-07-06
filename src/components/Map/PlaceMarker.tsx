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

// Lettered map pins (WC / Rx / H / R) — the Claude Design map look
const PIN_LABEL: Record<string, string> = {
  toilet:     'WC',
  pharmacy:   'Rx',
  hospital:   'H',
  restaurant: 'R',
}

const PIN_COLOUR: Record<string, string> = {
  toilet:     '#15803d', // green
  pharmacy:   '#7c3aed', // purple
  hospital:   '#2563eb', // blue
  restaurant: '#c2410c', // amber-brown
}

// Small emoji still used inside the popup header
const EMOJI: Record<string, string> = {
  toilet:     '🚻',
  pharmacy:   '💊',
  hospital:   '🏥',
  restaurant: '🍽️',
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

// Toilets inside a venue — patient may be expected to be a customer.
// Short "a café" / "a supermarket" phrasing for the access hint line.
const VENUE_TOILET_SHORT: Record<string, string> = {
  fast_food:        'a fast food spot',
  cafe:             'a café',
  pub:              'a pub',
  bar:              'a bar',
  restaurant:       'a restaurant',
  supermarket:      'a supermarket',
  fuel:             'a petrol station',
  shopping_centre:  'a shopping centre',
  department_store: 'a department store',
  cinema:           'a cinema',
  theatre:          'a theatre',
  hospital:         'a hospital',
  clinic:           'a clinic',
  pharmacy:         'a pharmacy',
}

// A toilet sitting inside a venue (café, shop...) vs a standalone public one.
// Community-added toilets carry placeType 'toilet' and standalone OSM ones
// carry 'toilets' — both count as walk-in public.
function isVenueToilet(place: Place): boolean {
  return place.category === 'toilet' && !!place.placeType && place.placeType in VENUE_TOILET_SHORT
}

// SVG teardrop pin with a category letter. `hollow` (venue toilets) draws a
// white pin with coloured outline; community places get a small "C" badge.
function createIcon(category: string, isCommunity: boolean, hollow: boolean) {
  const colour = PIN_COLOUR[category] ?? '#0f766e'
  const label = PIN_LABEL[category] ?? '•'
  const fill = hollow ? '#ffffff' : colour
  const textColour = hollow ? colour : '#ffffff'
  const commBadge = isCommunity
    ? `<circle cx="26.5" cy="8" r="7" fill="#ffffff" stroke="${colour}" stroke-width="1.5"/>` +
      `<text x="26.5" y="11.2" text-anchor="middle" font-size="9" font-weight="700" fill="${colour}" font-family="ui-sans-serif,system-ui,sans-serif">C</text>`
    : ''
  const html =
    `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M17 1.5 C8.7 1.5 2 8.2 2 16.5 C2 26 17 42.5 17 42.5 C17 42.5 32 26 32 16.5 C32 8.2 25.3 1.5 17 1.5 Z" ` +
    `fill="${fill}" stroke="${colour}" stroke-width="2.5"/>` +
    `<text x="17" y="21.5" text-anchor="middle" font-size="12" font-weight="700" fill="${textColour}" font-family="ui-sans-serif,system-ui,sans-serif">${label}</text>` +
    commBadge +
    `</svg>`
  return L.divIcon({
    html,
    className: 'ibd-pin',
    iconSize: [34, 44],
    iconAnchor: [17, 43],
    popupAnchor: [0, -40],
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
  isBookmarked: boolean
  isIbdFriendly: boolean
  onBookmark: (place: Place) => void
}

export default function PlaceMarker({ place, userLocation, user, isBookmarked, isIbdFriendly, onBookmark }: Props) {
  const [showRating, setShowRating] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const isCommunity = place.source === 'community'
  const venueToilet = isVenueToilet(place)
  // Venue toilets draw as a hollow pin; walk-in public toilets are solid —
  // the eye lands on the safe bets first.
  const icon = createIcon(place.category, isCommunity, venueToilet)
  const dist = userLocation
    ? haversine(userLocation.lat, userLocation.lon, place.lat, place.lon)
    : null
  const openStatus = isOpenNow(place.openingHours)
  const status = STATUS[openStatus]
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`
  const accentColour = PIN_COLOUR[place.category] ?? '#0f766e'

  return (
    <>
      <Marker position={[place.lat, place.lon]} icon={icon}>
        <Popup minWidth={260} maxWidth={320} className="ibd-popup">
          <div className="ibd-card">
            {/* Source badge */}
            <p className="ibd-card-category" style={{ color: accentColour }}>
              {EMOJI[place.category]} {getPlaceLabel(place.category, place.placeType).toUpperCase()}
              {isCommunity && (
                <span className="ml-2 text-[9px] font-bold bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded-full">
                  👤 COMMUNITY
                </span>
              )}
              {isIbdFriendly && (
                <span className="ml-2 text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
                  💜 IBD-FRIENDLY
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

            {/* Access hint — the patient's real question: "can I just walk in?" */}
            {place.category === 'toilet' && (
              venueToilet ? (
                <p className="text-[11px] text-amber-700 leading-snug mt-1">
                  🚪 Inside {VENUE_TOILET_SHORT[place.placeType!]} — you may need to be a customer
                </p>
              ) : (
                <p className="text-[11px] text-green-700 font-medium leading-snug mt-1">
                  ✅ Public toilet — walk straight in
                </p>
              )
            )}

            {/* Accessible toilets are often locked — flag that a key may be needed */}
            {place.category === 'toilet' && place.wheelchair && (
              <p className="text-[11px] text-gray-500 leading-snug mt-1">
                🔑 May be locked — needs an accessible-toilet key.{' '}
                <a
                  href="https://www.iwa.ie/faq/where-can-i-get-the-universal-key-for-accessible-toilets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 font-semibold underline"
                >
                  Get one
                </a>
              </p>
            )}

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

            {/* Action row: bookmark + rate */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onBookmark(place)}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
                style={{ background: isBookmarked ? '#ede0ff' : '#f3f4f6' }}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this place'}
              >
                {isBookmarked ? '🔖' : '🔖'}
              </button>
              <button
                onClick={() => user ? setShowRating(true) : setShowAuth(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                ⭐ Rate
              </button>
            </div>
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
