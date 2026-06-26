import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useAppContext } from '../../context/AppContext'
import { useGeolocation, IRELAND_CENTRE } from '../../hooks/useGeolocation'
import { usePlaces } from '../../hooks/usePlaces'
import FlyToUser from './FlyToUser'
import LocationMarker from './LocationMarker'
import PlaceMarker from './PlaceMarker'
import CategoryFilter from '../CategoryFilter'
import RangeSelector from '../RangeSelector'
import type { Category } from '../../types'

const CLUSTER_COLOUR: Record<Category, string> = {
  toilet:     '#6c3fc5',   // brand purple
  pharmacy:   '#0ea5e9',   // sky blue — distinct from green markers
  restaurant: '#f97316',   // orange
}

const CLUSTER_EMOJI: Record<Category, string> = {
  toilet:     '🚻',
  pharmacy:   '💊',
  restaurant: '🍽️',
}

function makeClusterIcon(category: Category) {
  const colour = CLUSTER_COLOUR[category]
  const emoji  = CLUSTER_EMOJI[category]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (cluster: any) => {
    const count = cluster.getChildCount()
    return L.divIcon({
      html: `
        <div class="cluster-bubble" style="background:${colour}">
          <span class="cluster-emoji">${emoji}</span>
          <span class="cluster-count">${count}</span>
        </div>`,
      className: '',
      iconSize: L.point(52, 52),
      iconAnchor: L.point(26, 26),
    })
  }
}

export default function MapView() {
  const { state } = useAppContext()
  const { location, error, loading } = useGeolocation()
  const { data: places = [], isFetching, isError } = usePlaces(
    state.activeCategory,
    state.range,
    location
  )

  const hasGps = !!location && error !== 'location-denied'
  const clusterIcon = state.activeCategory ? makeClusterIcon(state.activeCategory) : undefined

  return (
    <div className="relative h-full w-full">
      {/* Floating controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 w-full max-w-sm px-4">
        <CategoryFilter />
        <RangeSelector />
      </div>

      {/* GPS loading banner */}
      {loading && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full shadow">
          📡 Getting your location…
        </div>
      )}

      {/* Location denied banner */}
      {error === 'location-denied' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-full shadow whitespace-nowrap">
          ⚠️ Location access denied — showing all of Ireland
        </div>
      )}

      {/* Places fetching indicator */}
      {isFetching && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow animate-pulse">
          Searching…
        </div>
      )}

      {/* Error — all 3 endpoints failed or timed out */}
      {isError && !isFetching && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-2.5 rounded-full shadow whitespace-nowrap">
          ⚠️ Couldn't load places — check your connection and try again
        </div>
      )}

      <MapContainer
        center={[IRELAND_CENTRE.lat, IRELAND_CENTRE.lon]}
        zoom={7}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <>
            <FlyToUser location={location} hasGps={hasGps} />
            <LocationMarker location={location} />
          </>
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          iconCreateFunction={clusterIcon}
        >
          {places.map((place) => (
            <PlaceMarker key={place.id} place={place} userLocation={location} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
