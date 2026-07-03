import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Place, RangeMetres, UserLocation } from '../types'

// Coord key matches an OSM/community place against a rated shadow marker.
// 5dp ≈ 1.1m — enough to line up the same physical spot from either source.
function key(category: string, lat: number, lon: number) {
  return `${category}:${lat.toFixed(5)}:${lon.toFixed(5)}`
}

export function ibdKeyForPlace(p: Place) {
  return key(p.category, p.lat, p.lon)
}

async function fetchIbdFriendly(range: RangeMetres, loc: UserLocation): Promise<Set<string>> {
  const delta = range / 111_000
  const { data, error } = await supabase
    .from('markers')
    .select('lat, lon, category, ratings(ibd_friendly)')
    .gte('lat', loc.lat - delta)
    .lte('lat', loc.lat + delta)
    .gte('lon', loc.lon - delta)
    .lte('lon', loc.lon + delta)

  if (error) throw error

  const set = new Set<string>()
  for (const row of data ?? []) {
    const ratings = (row.ratings ?? []) as { ibd_friendly: boolean }[]
    if (ratings.some((r) => r.ibd_friendly)) {
      set.add(key(row.category, row.lat, row.lon))
    }
  }
  return set
}

export function useIbdFriendly(range: RangeMetres, location: UserLocation | null) {
  return useQuery({
    queryKey: ['ibd-friendly', range, location?.lat, location?.lon],
    queryFn: () => fetchIbdFriendly(range, location!),
    enabled: !!location,
    staleTime: 60_000,
    retry: false,
  })
}
