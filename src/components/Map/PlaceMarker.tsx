import L from 'leaflet'
import { Marker } from 'react-leaflet'
import type { Place } from '../../types'
import { PIN_LABEL, PIN_COLOUR, isVenueToilet } from './placeMeta'

// SVG teardrop pin with a category letter. `hollow` (venue toilets) draws a
// white pin with coloured outline; community places get a small "C" badge.
// `selected` scales the pin up (design spec: 1.15x) so the tapped pin stands out.
function createIcon(category: string, isCommunity: boolean, hollow: boolean, selected: boolean) {
  const colour = PIN_COLOUR[category] ?? '#005c4a'
  const label = PIN_LABEL[category] ?? '•'
  const fill = hollow ? '#ffffff' : colour
  const textColour = hollow ? colour : '#ffffff'
  const commBadge = isCommunity
    ? `<circle cx="26.5" cy="8" r="7" fill="#ffffff" stroke="${colour}" stroke-width="1.5"/>` +
      `<text x="26.5" y="11.2" text-anchor="middle" font-size="9" font-weight="700" fill="${colour}" font-family="ui-sans-serif,system-ui,sans-serif">C</text>`
    : ''
  const html =
    `<div style="transform:scale(${selected ? 1.15 : 1});transform-origin:bottom center;transition:transform 0.15s ease;">` +
    `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M17 1.5 C8.7 1.5 2 8.2 2 16.5 C2 26 17 42.5 17 42.5 C17 42.5 32 26 32 16.5 C32 8.2 25.3 1.5 17 1.5 Z" ` +
    `fill="${fill}" stroke="${colour}" stroke-width="2.5"/>` +
    `<text x="17" y="21.5" text-anchor="middle" font-size="12" font-weight="700" fill="${textColour}" font-family="ui-sans-serif,system-ui,sans-serif">${label}</text>` +
    commBadge +
    `</svg>` +
    `</div>`
  return L.divIcon({
    html,
    className: 'ibd-pin',
    iconSize: [34, 44],
    iconAnchor: [17, 43],
    popupAnchor: [0, -40],
  })
}

interface Props {
  place: Place
  isSelected: boolean
  onSelect: (place: Place) => void
}

export default function PlaceMarker({ place, isSelected, onSelect }: Props) {
  const isCommunity = place.source === 'community'
  const venueToilet = isVenueToilet(place)
  // Venue toilets draw as a hollow pin; walk-in public toilets are solid —
  // the eye lands on the safe bets first.
  const icon = createIcon(place.category, isCommunity, venueToilet, isSelected)

  return (
    <Marker
      position={[place.lat, place.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(place) }}
    />
  )
}
