import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Place, UserLocation, RangeMetres } from '../../types'
import { haversine } from '../../utils/haversine'

const ESCALATION: RangeMetres[] = [500, 1000, 2000]

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const USER_AGENT = 'IBD-Navigator/1.0 (https://github.com/ajinkyachintawar/ibd-navigator)'

function round3(n: number) {
  return Math.round(n * 1000) / 1000
}

function mapsUrl(place: Place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking`
}

function nearest(places: Place[], loc: UserLocation): Place {
  return [...places].sort(
    (a, b) =>
      haversine(loc.lat, loc.lon, a.lat, a.lon) -
      haversine(loc.lat, loc.lon, b.lat, b.lon)
  )[0]
}

async function fetchToilets(radius: RangeMetres, loc: UserLocation): Promise<Place[]> {
  const query = `[out:json][timeout:10];(node["amenity"="toilets"](around:${radius},${loc.lat},${loc.lon});node["toilets"="yes"](around:${radius},${loc.lat},${loc.lon}););out body;`
  const encoded = encodeURIComponent(query)

  for (const endpoint of ENDPOINTS) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 10_000)
      const res = await fetch(`${endpoint}?data=${encoded}`, {
        signal: ctrl.signal,
        headers: { 'User-Agent': USER_AGENT },
      })
      clearTimeout(t)
      if (!res.ok) continue
      const data = await res.json()
      return (data.elements ?? [])
        .filter((e: Record<string, unknown>) => e.lat && e.lon)
        .map((e: Record<string, unknown>) => ({
          id: `osm-node-${e.id}`,
          name: ((e.tags as Record<string, string>)?.name) ?? 'Toilet',
          lat: e.lat as number,
          lon: e.lon as number,
          category: 'toilet' as const,
          source: 'osm' as const,
          placeType: 'toilets',
        }))
    } catch { continue }
  }
  return []
}

interface Props {
  location: UserLocation | null
  locationDenied: boolean
}

export default function PanicButton({ location, locationDenied }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handlePanic = async () => {
    if (locationDenied || !location) {
      setStatus('⚠️ Enable location access in your browser settings')
      setTimeout(() => setStatus(null), 4000)
      return
    }

    setLoading(true)

    for (const radius of ESCALATION) {
      const label = radius < 1000 ? `${radius}m` : `${radius / 1000}km`
      setStatus(`Searching within ${label}…`)

      // Cache-first: if we already fetched toilets at this radius, use instantly
      const cacheKey = ['places', 'toilet', radius, round3(location.lat), round3(location.lon)]
      const cached = queryClient.getQueryData<Place[]>(cacheKey)
      const places = cached && cached.length > 0 ? cached : await fetchToilets(radius, location)

      if (places.length > 0) {
        const target = nearest(places, location)
        window.open(mapsUrl(target), '_blank')
        setStatus(null)
        setLoading(false)
        return
      }
    }

    // All radii exhausted — Google Maps fallback
    setStatus(null)
    setLoading(false)
    window.open(
      `https://www.google.com/maps/search/public+toilet/@${location.lat},${location.lon},15z`,
      '_blank'
    )
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2">
      {status && (
        <div className="bg-black/70 text-white text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap">
          {status}
        </div>
      )}

      <button
        onClick={handlePanic}
        disabled={loading}
        aria-label="Find nearest toilet now"
        className="flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-bold text-base shadow-lg transition-transform active:scale-95 disabled:opacity-70 whitespace-nowrap"
        style={{
          background: loading ? '#c0392b' : '#e74c3c',
          boxShadow: '0 4px 20px rgba(231,76,60,0.55)',
        }}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching…
          </>
        ) : (
          <>🚨 Find Nearest Toilet</>
        )}
      </button>
    </div>
  )
}
