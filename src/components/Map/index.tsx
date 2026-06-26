import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
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

export default function MapView() {
  const { state } = useAppContext()
  const { location, error, loading } = useGeolocation()
  const { data: places = [], isFetching } = usePlaces(
    state.activeCategory,
    state.range,
    location
  )

  const hasGps = !!location && error !== 'location-denied'

  return (
    <div className="relative h-full w-full">
      {/* Floating controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 w-full max-w-sm px-4">
        <CategoryFilter />
        <RangeSelector />
      </div>

      {/* GPS loading / denied banner */}
      {loading && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full shadow">
          📡 Getting your location…
        </div>
      )}
      {error === 'location-denied' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-full shadow whitespace-nowrap">
          ⚠️ Location access denied — showing all of Ireland
        </div>
      )}

      {/* Places loading indicator */}
      {isFetching && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow animate-pulse">
          Searching…
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

        <MarkerClusterGroup chunkedLoading>
          {places.map((place) => (
            <PlaceMarker key={place.id} place={place} userLocation={location} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
