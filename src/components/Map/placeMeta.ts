import type { Place } from '../../types'

// Lettered map pins (WC / Rx / H / R) — the Claude Design map look
export const PIN_LABEL: Record<string, string> = {
  toilet:     'WC',
  pharmacy:   'Rx',
  hospital:   'H',
  restaurant: 'R',
}

// Exact conversion of the design handoff's oklch tokens (toilet 0.5/0.1/175,
// pharmacy 0.5/0.1/300, hospital 0.5/0.12/250, restaurant 0.58/0.13/70).
export const PIN_COLOUR: Record<string, string> = {
  toilet:     '#007560', // teal
  pharmacy:   '#6c5594', // muted purple
  hospital:   '#2266a4', // muted blue
  restaurant: '#aa6a00', // mustard/amber
}

// Pale tint of each category colour (spec: oklch(0.94 0.03 <hue>)) — used
// behind the glyph in the detail sheet
export const PIN_TINT: Record<string, string> = {
  toilet:     '#d8f2ea',
  pharmacy:   '#eee7fd',
  hospital:   '#ddedff',
  restaurant: '#f9e8d6',
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

export function getPlaceLabel(category: string, placeType?: string): string {
  if (category === 'toilet' && placeType) {
    return TOILET_TYPE_LABEL[placeType] ?? 'Toilet'
  }
  return CATEGORY_LABEL[category] ?? category
}

// Toilets inside a venue — patient may be expected to be a customer.
// Short "a café" / "a supermarket" phrasing for the access hint line.
export const VENUE_TOILET_SHORT: Record<string, string> = {
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
export function isVenueToilet(place: Place): boolean {
  return place.category === 'toilet' && !!place.placeType && place.placeType in VENUE_TOILET_SHORT
}

export const STATUS: Record<string, { label: string; colour: string }> = {
  open:    { label: 'Open now',     colour: '#16a34a' },
  closed:  { label: 'Closed',       colour: '#dc2626' },
  unknown: { label: 'Hours unknown', colour: '#9ca3af' },
}
