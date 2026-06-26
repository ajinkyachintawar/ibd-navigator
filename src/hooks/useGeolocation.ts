import { useState, useEffect } from 'react'
import type { UserLocation } from '../types'

interface GeolocationState {
  location: UserLocation | null
  error: string | null
  loading: boolean
}

// Ireland centre — fallback if GPS is denied or unsupported
export const IRELAND_CENTRE: UserLocation = { lat: 53.4, lon: -8.0 }

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: IRELAND_CENTRE, error: 'Geolocation not supported', loading: false })
      return
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          error: null,
          loading: false,
        })
      },
      () => {
        // Permission denied or timeout — fall back to Ireland centre silently
        setState({ location: IRELAND_CENTRE, error: 'location-denied', loading: false })
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    )

    return () => navigator.geolocation.clearWatch(watcher)
  }, [])

  return state
}
