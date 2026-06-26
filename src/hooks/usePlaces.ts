import { useQuery } from '@tanstack/react-query'
import type { Category, Place, RangeMetres, UserLocation } from '../types'

const AMENITY: Record<Category, string> = {
  toilet: 'toilets',
  pharmacy: 'pharmacy',
  restaurant: 'restaurant',
}

// Three independent public Overpass instances — tried in order on failure
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

const TIMEOUT_MS = 10_000

/**
 * fetch() with a hard client-side timeout AND respect for an external AbortSignal.
 * Whichever fires first (timeout or external cancel) aborts the request.
 */
async function fetchWithTimeout(url: string, externalSignal: AbortSignal): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS)

  // Forward external cancellation (e.g. TanStack Query aborting a stale query)
  const onExternalAbort = () => controller.abort(externalSignal.reason)
  externalSignal.addEventListener('abort', onExternalAbort, { once: true })

  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timeoutId)
    externalSignal.removeEventListener('abort', onExternalAbort)
  }
}

function parseElements(data: Record<string, unknown>, category: Category): Place[] {
  const elements = (data.elements as Record<string, unknown>[]) ?? []
  return elements
    .filter((el) => el.lat && el.lon)
    .map((el) => {
      const tags = (el.tags ?? {}) as Record<string, string>
      return {
        id: `osm-${el.id}`,
        name: tags.name ?? 'Unknown',
        lat: el.lat as number,
        lon: el.lon as number,
        category,
        source: 'osm' as const,
        openingHours: tags.opening_hours,
        wheelchair: tags.wheelchair === 'yes',
        fee: tags.fee === 'yes',
      } satisfies Place
    })
}

async function fetchFromOverpass(
  category: Category,
  range: RangeMetres,
  loc: UserLocation,
  signal: AbortSignal
): Promise<Place[]> {
  const amenity = AMENITY[category]
  // Server-side timeout matches our client-side timeout
  const query = `[out:json][timeout:10];node["amenity"="${amenity}"](around:${range},${loc.lat},${loc.lon});out body;`
  const encoded = encodeURIComponent(query)

  let lastError: Error = new Error('No endpoints available')

  for (const endpoint of ENDPOINTS) {
    // Stop immediately if TanStack Query cancelled this query (e.g. key changed)
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')

    try {
      const res = await fetchWithTimeout(`${endpoint}?data=${encoded}`, signal)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return parseElements(data, category)
    } catch (err) {
      // If the external signal fired, stop trying — no point hitting more endpoints
      if (signal.aborted) throw err
      lastError = err instanceof Error ? err : new Error(String(err))
      // Otherwise fall through to next endpoint
    }
  }

  throw lastError
}

export function usePlaces(
  category: Category | null,
  range: RangeMetres,
  location: UserLocation | null
) {
  return useQuery({
    // Key change → TanStack auto-cancels the old request via signal
    queryKey: ['places', category, range, location?.lat, location?.lon],
    queryFn: ({ signal }) => fetchFromOverpass(category!, range, location!, signal),
    enabled: !!category && !!location,
    staleTime: 60_000,
    retry: false, // we already retry across 3 endpoints internally
  })
}
