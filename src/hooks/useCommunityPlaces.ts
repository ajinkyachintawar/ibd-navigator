import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, Place, RangeMetres, UserLocation } from '../types'

// Ireland bounding box — reject markers outside this
const IRELAND_BBOX = { minLat: 51.3, maxLat: 55.4, minLon: -10.7, maxLon: -5.4 }

export function isWithinIreland(lat: number, lon: number) {
  return (
    lat >= IRELAND_BBOX.minLat && lat <= IRELAND_BBOX.maxLat &&
    lon >= IRELAND_BBOX.minLon && lon <= IRELAND_BBOX.maxLon
  )
}

async function fetchCommunityPlaces(
  category: Category,
  range: RangeMetres,
  loc: UserLocation
): Promise<Place[]> {
  // Rough bounding box from centre + range (1 degree lat ≈ 111km)
  const delta = range / 111_000
  const { data, error } = await supabase
    .from('markers')
    .select('*')
    .eq('category', category)
    .gte('lat', loc.lat - delta)
    .lte('lat', loc.lat + delta)
    .gte('lon', loc.lon - delta)
    .lte('lon', loc.lon + delta)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: `community-${row.id}`,
    name: row.name ?? 'Community marker',
    lat: row.lat,
    lon: row.lon,
    category: row.category as Category,
    source: 'community' as const,
    openingHours: row.opening_hours ?? undefined,
    wheelchair: row.wheelchair ?? false,
    fee: row.fee ?? false,
    details: row.details ?? undefined,
    placeType: row.category,
  }))
}

export function useCommunityPlaces(
  category: Category | null,
  range: RangeMetres,
  location: UserLocation | null
) {
  return useQuery({
    queryKey: ['community-places', category, range, location?.lat, location?.lon],
    queryFn: () => fetchCommunityPlaces(category!, range, location!),
    enabled: !!category && !!location,
    staleTime: 60_000,
    retry: false,
  })
}
