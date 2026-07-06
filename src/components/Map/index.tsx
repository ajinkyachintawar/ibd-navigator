import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useAppContext } from '../../context/AppContext'
import { useGeolocation, IRELAND_CENTRE } from '../../hooks/useGeolocation'
import { useDarkMode } from '../../hooks/useDarkMode'
import SearchBar from '../Search/SearchBar'
import type { UserLocation } from '../../types'
import { usePlaces } from '../../hooks/usePlaces'
import { useCommunityPlaces } from '../../hooks/useCommunityPlaces'
import { useAuth } from '../../hooks/useAuth'
import { isOpenNow } from '../../utils/isOpenNow'
import FlyToUser from './FlyToUser'
import LocationMarker from './LocationMarker'
import PlaceMarker from './PlaceMarker'
import AddMarkerFlow from './AddMarkerFlow'
import CategoryFilter from '../CategoryFilter'
import RangeSelector from '../RangeSelector'
import OpenNowToggle from '../Controls/OpenNowToggle'
import PanicButton from '../PanicButton'
import NoWaitCard from '../CantWaitCard'
import AuthSheet from '../Auth/AuthSheet'
import BookmarksPanel from '../Bookmarks/BookmarksPanel'
import { useBookmarks } from '../../hooks/useBookmarks'
import { useIbdFriendly, ibdKeyForPlace } from '../../hooks/useIbdFriendly'
import type { Category, Place } from '../../types'

const CLUSTER_COLOUR: Record<Category, string> = {
  toilet:     '#15803d',
  pharmacy:   '#7c3aed',
  hospital:   '#2563eb',
  restaurant: '#c2410c',
}

const CLUSTER_LABEL: Record<Category, string> = {
  toilet:     'WC',
  pharmacy:   'Rx',
  hospital:   'H',
  restaurant: 'R',
}

const CATEGORIES: Category[] = ['toilet', 'pharmacy', 'hospital', 'restaurant']

function makeClusterIcon(category: Category) {
  const colour = CLUSTER_COLOUR[category]
  const label  = CLUSTER_LABEL[category]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (cluster: any) => {
    const count = cluster.getChildCount()
    return L.divIcon({
      html: `<div class="cluster-bubble" style="background:${colour}"><span class="cluster-emoji">${label}</span><span class="cluster-count">${count}</span></div>`,
      className: '',
      iconSize: L.point(52, 52),
      iconAnchor: L.point(26, 26),
    })
  }
}

// Flies the map to a searched location whenever it changes.
function FlyTo({ target }: { target: UserLocation | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 14, { animate: true, duration: 1.0 })
  }, [map, target])
  return null
}

export default function MapView() {
  const { state, dispatch } = useAppContext()
  const { location, error, loading } = useGeolocation()
  const { user } = useAuth()
  const { dark, toggle: toggleDark } = useDarkMode()

  // Search overrides GPS as the point we fetch/centre around, until cleared.
  const [searchLoc, setSearchLoc] = useState<UserLocation | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const activeLocation = searchLoc ?? location

  // Flare mode overrides at render time — never mutates the user's stored filters,
  // so exiting flare restores their previous category/range for free.
  const selection = state.flareMode ? 'toilet' : state.activeCategory // CategorySelection | null
  const effectiveRange = state.flareMode ? 500 : state.range
  const show = (c: Category) => selection === 'all' || selection === c

  // One query per category so "All" can show every type at once; each stays
  // disabled (and free) when its category isn't selected.
  const catQueries: Record<Category, ReturnType<typeof usePlaces>> = {
    toilet:     usePlaces(show('toilet') ? 'toilet' : null, effectiveRange, activeLocation),
    pharmacy:   usePlaces(show('pharmacy') ? 'pharmacy' : null, effectiveRange, activeLocation),
    hospital:   usePlaces(show('hospital') ? 'hospital' : null, effectiveRange, activeLocation),
    restaurant: usePlaces(show('restaurant') ? 'restaurant' : null, effectiveRange, activeLocation),
  }
  const { data: communityPlaces = [], refetch: refetchCommunity } = useCommunityPlaces(
    selection, effectiveRange, activeLocation
  )
  const { data: ibdSet } = useIbdFriendly(effectiveRange, activeLocation)

  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks(user)
  const [showCantWait, setShowCantWait] = useState(false)
  const [showAddFlow, setShowAddFlow] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)

  const hasGps = !!location && error !== 'location-denied'
  const locationDenied = error === 'location-denied'

  // Merge OSM + community per category, apply Open Now filter
  const openNowOk = (p: Place) => !state.openNowOnly || isOpenNow(p.openingHours) !== 'closed'
  const placesByCat = {} as Record<Category, Place[]>
  let totalRaw = 0
  let totalShown = 0
  for (const c of CATEGORIES) {
    const merged = [...(catQueries[c].data ?? []), ...communityPlaces.filter(p => p.category === c)]
    totalRaw += merged.length
    placesByCat[c] = merged.filter(openNowOk)
    totalShown += placesByCat[c].length
  }
  const isFetching = CATEGORIES.some(c => catQueries[c].isFetching)
  const isError = CATEGORIES.some(c => catQueries[c].isError) && totalRaw === 0

  // Auto-revert Open Now if it empties all results
  useEffect(() => {
    if (state.openNowOnly && !isFetching && totalRaw > 0 && totalShown === 0) {
      dispatch({ type: 'TOGGLE_OPEN_NOW' })
    }
  }, [state.openNowOnly, isFetching, totalRaw, totalShown, dispatch])

  return (
    <div className="relative h-full w-full">

      {/* Desktop left sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-80 z-[1000] bg-white dark:bg-gray-900 shadow-xl p-4 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white text-sm font-bold">◐</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">IBD Navigator</span>
          </div>
          <button
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300"
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>

        <SearchBar
          onResult={(loc, label) => { setSearchLoc(loc); setSearchLabel(label) }}
          activeLabel={searchLabel}
          onClear={() => { setSearchLoc(null); setSearchLabel(null) }}
          dark={dark}
          onToggleDark={toggleDark}
          hideToggle
        />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Amenities</p>
          <CategoryFilter />
        </div>
        <div>
          <RangeSelector />
        </div>
        <OpenNowToggle />

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-1">
          {[
            { label: 'No-Wait Card', icon: 'ID', color: '#0f766e', onClick: () => setShowCantWait(true) },
            { label: 'Saved places', icon: '🔖', color: '#7c3aed', onClick: () => setShowBookmarks(true), badge: bookmarks.length },
            { label: 'Add a place', icon: '＋', color: '#c2410c', onClick: () => user ? setShowAddFlow(true) : setShowAuth(true) },
            { label: 'Flare mode', icon: '🩸', color: '#2563eb', onClick: () => dispatch({ type: 'TOGGLE_FLARE' }) },
          ].map(({ label, icon, color, onClick, badge }) => (
            <button key={label} onClick={onClick} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>{icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
              {badge ? <span className="ml-auto text-xs font-bold text-brand-700">{badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-3">
          <PanicButton location={location} locationDenied={locationDenied} />
        </div>
      </aside>

      {/* Floating controls — no card; pieces float directly on the map (lg: sidebar takes over) */}
      <div className="absolute top-4 inset-x-0 z-[1000] flex flex-col items-stretch gap-2 w-full max-w-md px-4 pointer-events-none lg:hidden">
        {state.flareMode ? (
          <div className="pointer-events-auto w-full bg-rose-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">Flare mode</p>
              <p className="text-[11px] text-rose-100 leading-tight">Nearest toilets within 500m only</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_FLARE' })}
              className="flex-shrink-0 bg-white text-rose-600 text-xs font-bold px-3 py-2 rounded-full active:scale-95 transition-transform"
            >
              Exit
            </button>
          </div>
        ) : (
          <div className="pointer-events-auto w-full flex flex-col gap-2">
            <SearchBar
              onResult={(loc, label) => { setSearchLoc(loc); setSearchLabel(label) }}
              activeLabel={searchLabel}
              onClear={() => { setSearchLoc(null); setSearchLabel(null) }}
              dark={dark}
              onToggleDark={toggleDark}
            />
            <CategoryFilter />
            <div className="flex items-center gap-2">
              <RangeSelector />
              <OpenNowToggle />
            </div>
          </div>
        )}
        {isFetching && (
          <div className="self-center pointer-events-none bg-white/90 dark:bg-gray-900/90 text-brand-700 dark:text-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow animate-pulse">
            Searching…
          </div>
        )}
        {loading && (
          <div className="self-center pointer-events-none bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full shadow">
            📡 Getting your location…
          </div>
        )}
      </div>

      {/* Location denied */}
      {locationDenied && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-full shadow whitespace-nowrap">
          ⚠️ Location access denied — showing all of Ireland
        </div>
      )}

      {/* All endpoints failed */}
      {isError && !isFetching && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-2.5 rounded-full shadow whitespace-nowrap">
          ⚠️ Couldn't load places — check connection and try again
        </div>
      )}

      <MapContainer
        center={[IRELAND_CENTRE.lat, IRELAND_CENTRE.lon]}
        zoom={7}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          key={dark ? 'dark' : 'light'}
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            dark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
        />

        {location && (
          <>
            <FlyToUser location={location} hasGps={hasGps} />
            <LocationMarker location={location} />
          </>
        )}
        <FlyTo target={searchLoc} />

        {CATEGORIES.map((c) =>
          placesByCat[c].length > 0 ? (
            <MarkerClusterGroup
              key={c}
              chunkedLoading
              maxClusterRadius={50}
              iconCreateFunction={makeClusterIcon(c)}
            >
              {placesByCat[c].map((place) => (
                <PlaceMarker
                  key={place.id}
                  place={place}
                  userLocation={activeLocation}
                  user={user}
                  isBookmarked={isBookmarked(place)}
                  isIbdFriendly={ibdSet?.has(ibdKeyForPlace(place)) ?? false}
                  onBookmark={toggleBookmark}
                />
              ))}
            </MarkerClusterGroup>
          ) : null
        )}

        {/* Add marker draggable pin — inside MapContainer so it has map context */}
        {showAddFlow && user && location && (
          <AddMarkerFlow
            user={user}
            userLocation={location}
            onClose={() => setShowAddFlow(false)}
            onAdded={() => refetchCommunity()}
          />
        )}
      </MapContainer>

      {/* User avatar — top right */}
      {user && (
        <div className="absolute top-4 right-4 z-[1000] w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold shadow"
          title={user.email ?? 'Signed in'}>
          {(user.email?.[0] ?? '?').toUpperCase()}
        </div>
      )}

      {/* SOS floating action button — bottom right, above the bar */}
      <div className="fixed bottom-24 right-4 z-[600] lg:hidden">
        <PanicButton location={location} locationDenied={locationDenied} variant="fab" />
      </div>

      {/* Bottom action bar — 4 colour-coded tiles (No-Wait / Saved / Add / Flare) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-3 lg:hidden">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl shadow-xl px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setShowCantWait(true)}
            className="flex flex-col items-center gap-1 px-3 py-1"
            aria-label="Show No-Wait card"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0f766e' }}>ID</span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">No-Wait</span>
          </button>

          <button
            onClick={() => setShowBookmarks(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 relative"
            aria-label="Saved places"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: '#7c3aed' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Saved</span>
            {bookmarks.length > 0 && (
              <span className="absolute top-0 right-1.5 w-4 h-4 bg-brand-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {bookmarks.length > 9 ? '9+' : bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => user ? setShowAddFlow(true) : setShowAuth(true)}
            className="flex flex-col items-center gap-1 px-3 py-1"
            aria-label="Add a place"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xl font-bold leading-none" style={{ background: '#c2410c' }}>＋</span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Add place</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_FLARE' })}
            className="flex flex-col items-center gap-1 px-3 py-1"
            aria-label="Flare mode"
          >
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: state.flareMode ? '#e74c3c' : '#2563eb' }}>🩸</span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Flare</span>
          </button>
        </div>
      </div>

      {showCantWait && <NoWaitCard onClose={() => setShowCantWait(false)} />}
      {showAuth && <AuthSheet onClose={() => setShowAuth(false)} />}
      {showBookmarks && (
        <BookmarksPanel
          bookmarks={bookmarks}
          onClose={() => setShowBookmarks(false)}
          onNavigate={(b) => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lon}&travelmode=walking`, '_blank')
            setShowBookmarks(false)
          }}
          onRemove={(b) => toggleBookmark({ id: b.placeId, name: b.name, lat: b.lat, lon: b.lon, category: b.category as never, source: 'community' })}
        />
      )}
    </div>
  )
}
