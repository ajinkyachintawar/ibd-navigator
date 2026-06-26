import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { UserLocation } from '../../types'

const userIcon = L.divIcon({
  html: `<div class="user-dot"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function LocationMarker({ location }: { location: UserLocation }) {
  return (
    <Marker position={[location.lat, location.lon]} icon={userIcon}>
      <Popup>
        <p className="text-sm font-semibold text-gray-700">📍 You are here</p>
      </Popup>
    </Marker>
  )
}
