import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type { UserLocation } from '../../types'

interface Props {
  location: UserLocation
  hasGps: boolean // false = Ireland fallback, skip animation
}

// Inner component — must live inside MapContainer to use useMap()
export default function FlyToUser({ location, hasGps }: Props) {
  const map = useMap()
  const firstFly = useRef(true)

  useEffect(() => {
    if (firstFly.current) {
      firstFly.current = false
      if (hasGps) {
        map.flyTo([location.lat, location.lon], 14, { animate: true, duration: 1.2 })
      } else {
        map.setView([location.lat, location.lon], 7)
      }
    }
  }, [map, location.lat, location.lon, hasGps])

  return null
}
