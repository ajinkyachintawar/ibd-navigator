import { useQuery } from '@tanstack/react-query'
import type { Category, Place, RangeMetres, UserLocation } from '../types'

const AMENITY: Record<Category, string> = {
  toilet: 'toilets',
  pharmacy: 'pharmacy',
  restaurant: 'restaurant',
}

async function fetchFromOverpass(
  category: Category,
  range: RangeMetres,
  loc: UserLocation
): Promise<Place[]> {
  const amenity = AMENITY[category]
  const query = `[out:json][timeout:15];node["amenity"="${amenity}"](around:${range},${loc.lat},${loc.lon});out body;`
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`)

  const data = await res.json()

  return (data.elements ?? [])
    .filter((el: Record<string, unknown>) => el.lat && el.lon)
    .map((el: Record<string, unknown>) => {
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

export function usePlaces(
  category: Category | null,
  range: RangeMetres,
  location: UserLocation | null
) {
  return useQuery({
    queryKey: ['places', category, range, location?.lat, location?.lon],
    queryFn: () => fetchFromOverpass(category!, range, location!),
    enabled: !!category && !!location,
    staleTime: 60_000,
    retry: 1,
  })
}
