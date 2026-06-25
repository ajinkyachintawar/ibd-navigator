export type Category = 'toilet' | 'pharmacy' | 'restaurant'

export type OpenStatus = 'open' | 'closed' | 'unknown'

export type MarkerSource = 'osm' | 'community'

export interface Place {
  id: string
  name: string
  lat: number
  lon: number
  category: Category
  source: MarkerSource
  openingHours?: string
  wheelchair?: boolean
  fee?: boolean
  details?: string
  distance?: number   // metres from user, set at runtime
  openStatus?: OpenStatus
}

export interface UserLocation {
  lat: number
  lon: number
}

export type RangeMetres = 500 | 1000 | 2000 | 5000

export interface AppState {
  userLocation: UserLocation | null
  activeCategory: Category | null
  range: RangeMetres
  openNowOnly: boolean
  showCantWait: boolean
}
