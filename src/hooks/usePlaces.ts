import { useQuery } from '@tanstack/react-query'
import type { Category, Place, RangeMetres, UserLocation } from '../types'

import {
  OVERPASS_ENDPOINTS as ENDPOINTS,
  OVERPASS_USER_AGENT as USER_AGENT,
  OVERPASS_TIMEOUT_MS as TIMEOUT_MS,
} from '../lib/overpass'

/**
 * Builds the Overpass QL query for a given category.
 *
 * Toilets uses a union to capture:
 *   1. Dedicated public toilet nodes (amenity=toilets)
 *   2. Any node/way tagged toilets=yes (shopping centres, venues)
 *   3. Common venues (fast food, cafés, supermarkets, pubs, petrol stations)
 *      that have toilets=yes tagged — these are the ones IBD patients actually use
 *   4. Toilet ways (polygon toilet blocks) via `out center`
 *
 * Pharmacy / restaurant use a simple amenity tag query.
 */
function buildQuery(category: Category, range: RangeMetres, loc: UserLocation): string {
  const around = `around:${range},${loc.lat},${loc.lon}`

  if (category === 'toilet') {
    return `
[out:json][timeout:15];
(
  node["amenity"="toilets"](${around});
  node["toilets"="yes"](${around});
  node["amenity"~"^(fast_food|cafe|pub|bar|restaurant|supermarket|fuel|shopping_centre|department_store|cinema|theatre|hospital|clinic|pharmacy)$"]["toilets"="yes"](${around});
  way["amenity"="toilets"](${around});
  way["toilets"="yes"](${around});
);
out center;
    `.trim()
  }

  // Pharmacy and restaurant: straightforward amenity tag
  const amenity = category === 'pharmacy' ? 'pharmacy' : 'restaurant'
  return `[out:json][timeout:10];node["amenity"="${amenity}"](${around});out body;`
}

// Friendly fallback name when a venue has toilets=yes but no name tag
const VENUE_TOILET_LABEL: Record<string, string> = {
  fast_food:          'Fast Food (has toilet)',
  cafe:               'Café (has toilet)',
  pub:                'Pub (has toilet)',
  bar:                'Bar (has toilet)',
  restaurant:         'Restaurant (has toilet)',
  supermarket:        'Supermarket (has toilet)',
  fuel:               'Petrol Station (has toilet)',
  shopping_centre:    'Shopping Centre (has toilet)',
  department_store:   'Department Store (has toilet)',
  cinema:             'Cinema (has toilet)',
  theatre:            'Theatre (has toilet)',
  hospital:           'Hospital (has toilet)',
  clinic:             'Clinic (has toilet)',
  pharmacy:           'Pharmacy (has toilet)',
}

function parseName(tags: Record<string, string>, category: Category): string {
  if (tags.name) return tags.name
  if (category === 'toilet') {
    return VENUE_TOILET_LABEL[tags.amenity] ?? 'Public Toilet'
  }
  return 'Unknown'
}

type RawElement = {
  id: number
  type: 'node' | 'way' | 'relation'
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

function parseElements(data: { elements?: RawElement[] }, category: Category): Place[] {
  const results: Place[] = []

  for (const el of data.elements ?? []) {
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    if (!lat || !lon) continue

    const tags = el.tags ?? {}
    results.push({
      id: `osm-${el.type}-${el.id}`,
      name: parseName(tags, category),
      lat,
      lon,
      category,
      source: 'osm',
      openingHours: tags.opening_hours,
      wheelchair: tags.wheelchair === 'yes' || tags['toilets:wheelchair'] === 'yes',
      fee: tags.fee === 'yes',
      placeType: tags.amenity,
    })
  }

  return results
}

async function fetchWithTimeout(url: string, externalSignal: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS)
  const onExternalAbort = () => controller.abort(externalSignal.reason)
  externalSignal.addEventListener('abort', onExternalAbort, { once: true })

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    })
  } finally {
    clearTimeout(timeoutId)
    externalSignal.removeEventListener('abort', onExternalAbort)
  }
}

async function fetchFromOverpass(
  category: Category,
  range: RangeMetres,
  loc: UserLocation,
  signal: AbortSignal
): Promise<Place[]> {
  const query = buildQuery(category, range, loc)
  const encoded = encodeURIComponent(query)
  let lastError: Error = new Error('No endpoints available')

  for (const endpoint of ENDPOINTS) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')

    try {
      const res = await fetchWithTimeout(`${endpoint}?data=${encoded}`, signal)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return parseElements(data, category)
    } catch (err) {
      if (signal.aborted) throw err
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError
}

// Round to 3 decimal places ≈ 111m precision.
// Prevents tiny GPS drift from producing a new query key and re-fetching.
function round3(n: number) {
  return Math.round(n * 1000) / 1000
}

export function usePlaces(
  category: Category | null,
  range: RangeMetres,
  location: UserLocation | null
) {
  return useQuery({
    queryKey: [
      'places',
      category,
      range,
      location ? round3(location.lat) : null,
      location ? round3(location.lon) : null,
    ],
    queryFn: ({ signal }) => fetchFromOverpass(category!, range, location!, signal),
    enabled: !!category && !!location,
    staleTime: 60_000,
    retry: false,
  })
}
