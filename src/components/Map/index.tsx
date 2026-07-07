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
import LogoMark from '../LogoMark'
import PlaceDetailSheet from './PlaceDetailSheet'
import AddMarkerFlow from './AddMarkerFlow'
import RatingSheet from '../Ratings/RatingSheet'
import PanicCard from '../PanicButton/PanicCard'
import Toast from '../Toast'
import { useToast } from '../../hooks/useToast'
import CategoryFilter from '../CategoryFilter'
import RangeSelector from '../RangeSelector'
import OpenNowToggle from '../Controls/OpenNowToggle'
import PanicButton from '../PanicButton'
import NoWaitCard from '../CantWaitCard'
import AuthSheet from '../Auth/AuthSheet'
import BookmarksPanel from '../Bookmarks/BookmarksPanel'
import FlareLogSheet from '../FlareLog/FlareLogSheet'
import { useBookmarks } from '../../hooks/useBookmarks'
import { useIbdFriendly, ibdKeyForPlace } from '../../hooks/useIbdFriendly'
import { haversine } from '../../utils/haversine'
import { PIN_COLOUR } from './placeMeta'
import type { Category, Place } from '../../types'

const CLUSTER_COLOUR = PIN_COLOUR as Record<Category, string>

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

// Drops Leaflet's own "Leaflet" self-promo prefix from the attribution control.
// OSM/CARTO attribution stays — that one's required by their licence, this isn't.
function TrimAttribution() {
  const map = useMap()
  useEffect(() => { map.attributionControl.setPrefix(false) }, [map])
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

  const activeTypes: Category[] = state.selectedTypes
  const activeRange = state.range

  // One query per category so multiple types can show at once; each stays
  // disabled (and free) when its category isn't selected.
  const catQueries: Record<Category, ReturnType<typeof usePlaces>> = {
    toilet:     usePlaces(activeTypes.includes('toilet') ? 'toilet' : null, activeRange, activeLocation),
    pharmacy:   usePlaces(activeTypes.includes('pharmacy') ? 'pharmacy' : null, activeRange, activeLocation),
    hospital:   usePlaces(activeTypes.includes('hospital') ? 'hospital' : null, activeRange, activeLocation),
    restaurant: usePlaces(activeTypes.includes('restaurant') ? 'restaurant' : null, activeRange, activeLocation),
  }
  const { data: communityPlaces = [], refetch: refetchCommunity } = useCommunityPlaces(
    activeRange, activeLocation
  )
  const { data: ibdSet } = useIbdFriendly(activeRange, activeLocation)

  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks(user)
  const [showCantWait, setShowCantWait] = useState(false)
  const [showAddFlow, setShowAddFlow] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showFlareLog, setShowFlareLog] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [panicResult, setPanicResult] = useState<Place | null>(null)
  const { message: toastMessage, showToast } = useToast()

  const hasGps = !!location && error !== 'location-denied'
  const locationDenied = error === 'location-denied'

  // Merge OSM + community per category, apply Open Now filter
  const openNowOk = (p: Place) => !state.openNowOnly || isOpenNow(p.openingHours) !== 'closed'
  const placesByCat = {} as Record<Category, Place[]>
  let totalRaw = 0
  let totalShown = 0
  for (const c of CATEGORIES) {
    if (!activeTypes.includes(c)) { placesByCat[c] = []; continue }
    const merged = [...(catQueries[c].data ?? []), ...communityPlaces.filter(p => p.category === c)]
    totalRaw += merged.length
    placesByCat[c] = merged.filter(openNowOk)
    totalShown += placesByCat[c].length
  }
  const isFetching = activeTypes.some(c => catQueries[c].isFetching)
  const isError = activeTypes.some(c => catQueries[c].isError) && totalRaw === 0

  const selectedPlace = selectedPlaceId
    ? CATEGORIES.flatMap(c => placesByCat[c]).find(p => p.id === selectedPlaceId) ?? null
    : null
  const selectedDistance = selectedPlace && activeLocation
    ? haversine(activeLocation.lat, activeLocation.lon, selectedPlace.lat, selectedPlace.lon)
    : null
  // Panic escalation fetches around raw GPS `location` (not the search override),
  // so distance here matches what was actually searched.
  const panicDistance = panicResult && location
    ? haversine(location.lat, location.lon, panicResult.lat, panicResult.lon)
    : null

  // Auto-revert Open Now if it empties all results
  useEffect(() => {
    if (state.openNowOnly && !isFetching && totalRaw > 0 && totalShown === 0) {
      dispatch({ type: 'TOGGLE_OPEN_NOW' })
    }
  }, [state.openNowOnly, isFetching, totalRaw, totalShown, dispatch])

  // Shared across the desktop sidebar list and the tablet icon rail
  const navItems = [
    { label: 'No-Wait Card', icon: 'ID', color: '#005c4a', radius: '8px', onClick: () => setShowCantWait(true) },
    { label: 'Saved places', icon: String(bookmarks.length), color: PIN_COLOUR.pharmacy, radius: '50% 50% 50% 6px', onClick: () => setShowBookmarks(true) },
    { label: 'Add a place', icon: '＋', color: PIN_COLOUR.restaurant, radius: '8px', onClick: () => user ? setShowAddFlow(true) : setShowAuth(true) },
    { label: 'Flare log', icon: 'Rx', color: PIN_COLOUR.hospital, radius: '8px', onClick: () => setShowFlareLog(true) },
  ]

  return (
    <div className="relative h-full w-full">

      <Toast message={toastMessage} />

      {/* Desktop left sidebar (lg+) */}
      <aside className="hidden xl:flex flex-col fixed left-0 top-0 bottom-0 w-80 z-[1000] bg-white dark:bg-gray-900 shadow-xl p-4 gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={32} className="rounded-lg flex-shrink-0" />
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
          <CategoryFilter wrap />
        </div>
        <div>
          <RangeSelector />
        </div>
        <OpenNowToggle />

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-1">
          {navItems.map(({ label, icon, color, radius, onClick }) => (
            <button key={label} onClick={onClick} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
              <span
                className="w-8 h-8 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                style={{ background: color, borderRadius: radius }}
              >
                {icon}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-3">
          <PanicButton
            location={location}
            locationDenied={locationDenied}
            onFound={(p) => { setPanicResult(p); setSelectedPlaceId(null) }}
          />
        </div>
      </aside>

      {/* Tablet icon rail (md–lg): same nav items as the sidebar, icon-only, no labels */}
      <aside className="hidden md:flex xl:hidden flex-col items-center fixed left-0 top-0 bottom-0 w-[76px] z-[1000] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 py-5 gap-2.5">
        <LogoMark size={30} className="rounded-[9px] flex-shrink-0" />
        <button
          onClick={toggleDark}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 mt-1.5"
        >
          {dark ? '☀' : '☾'}
        </button>

        <div className="h-px w-8 bg-gray-100 dark:bg-gray-800 my-2" />

        {navItems.map(({ label, icon, color, radius, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label}
            className="w-[46px] h-[46px] flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
            style={{ background: color, borderRadius: radius }}
          >
            {icon}
          </button>
        ))}

        <div className="flex-1" />

        <PanicButton
          location={location}
          locationDenied={locationDenied}
          variant="fab"
          size={56}
          onFound={(p) => { setPanicResult(p); setSelectedPlaceId(null) }}
        />
      </aside>

      {/* Floating controls — no card; pieces float directly on the map. Shifts right of the
          tablet rail at md, hidden entirely at lg where the sidebar takes over. */}
      <div className="absolute top-4 inset-x-0 md:left-24 z-[1000] flex flex-col items-stretch gap-2 w-full md:w-auto max-w-md md:max-w-none px-4 pointer-events-none xl:hidden">
        <div className="pointer-events-auto w-full flex flex-col gap-2">
          <SearchBar
            onResult={(loc, label) => { setSearchLoc(loc); setSearchLabel(label) }}
            activeLabel={searchLabel}
            onClear={() => { setSearchLoc(null); setSearchLabel(null) }}
            dark={dark}
            onToggleDark={toggleDark}
          />
          <CategoryFilter />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <RangeSelector />
            <OpenNowToggle />
          </div>
        </div>
        {isFetching && (
          <div className="self-center pointer-events-none bg-white/90 dark:bg-gray-900/90 text-brand-700 dark:text-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow animate-pulse">
            Searching…
          </div>
        )}
        {loading && (
          <div className="self-center pointer-events-none bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full shadow">
            Getting your location…
          </div>
        )}
      </div>

      {/* Location denied — sits below the detail sheet so an open sheet takes priority */}
      {locationDenied && !selectedPlace && !panicResult && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-4 py-2 rounded-full shadow whitespace-nowrap">
          Location access denied — showing all of Ireland
        </div>
      )}

      {/* All endpoints failed */}
      {isError && !isFetching && !selectedPlace && !panicResult && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-2.5 rounded-full shadow whitespace-nowrap">
          Couldn't load places — check connection and try again
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
        <TrimAttribution />

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
                  isSelected={selectedPlaceId === place.id}
                  onSelect={(p) => { setSelectedPlaceId(p.id); setPanicResult(null) }}
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
            onAdded={() => { refetchCommunity(); showToast('Added! Pending community review.') }}
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

      {/* Bottom action bar + SOS FAB — grouped in one container so the FAB stays
          anchored to the bar's own right edge, not the viewport's (they used to
          drift apart on wider phones since the bar is centred with max-w-md). */}
      <div className="fixed bottom-4 inset-x-0 z-[500] w-full max-w-md mx-auto px-3 md:hidden">
        <div className="relative">
          <div className="absolute right-0 bottom-full mb-3">
            <PanicButton
              location={location}
              locationDenied={locationDenied}
              variant="fab"
              onFound={(p) => { setPanicResult(p); setSelectedPlaceId(null) }}
            />
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl shadow-xl px-2 py-2 flex items-center justify-around">
            <button
              onClick={() => setShowCantWait(true)}
              className="flex flex-col items-center gap-1 px-3 py-1"
              aria-label="Show No-Wait card"
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: '#005c4a' }}>ID</span>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">No-Wait</span>
            </button>

            <button
              onClick={() => setShowBookmarks(true)}
              className="flex flex-col items-center gap-1 px-3 py-1 relative"
              aria-label="Saved places"
            >
              <span
                className="w-9 h-9 flex items-center justify-center text-white text-sm font-extrabold"
                style={{ background: PIN_COLOUR.pharmacy, borderRadius: '50% 50% 50% 6px' }}
              >
                {bookmarks.length}
              </span>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Saved</span>
            </button>

            <button
              onClick={() => user ? setShowAddFlow(true) : setShowAuth(true)}
              className="flex flex-col items-center gap-1 px-3 py-1"
              aria-label="Add a place"
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xl font-bold leading-none" style={{ background: PIN_COLOUR.restaurant }}>＋</span>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Add place</span>
            </button>

            <button
              onClick={() => setShowFlareLog(true)}
              className="flex flex-col items-center gap-1 px-3 py-1"
              aria-label="Flare log"
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold" style={{ background: PIN_COLOUR.hospital }}>Rx</span>
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Flare log</span>
            </button>
          </div>
        </div>
      </div>

      {showCantWait && <NoWaitCard onClose={() => setShowCantWait(false)} />}
      {showAuth && <AuthSheet onClose={() => setShowAuth(false)} />}
      {showBookmarks && (
        <BookmarksPanel
          bookmarks={bookmarks}
          userLocation={activeLocation}
          onClose={() => setShowBookmarks(false)}
          onNavigate={(b) => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lon}&travelmode=walking`, '_blank')
            setShowBookmarks(false)
          }}
          onRemove={(b) => toggleBookmark({ id: b.placeId, name: b.name, lat: b.lat, lon: b.lon, category: b.category as never, source: 'community' })}
        />
      )}
      {showFlareLog && (
        <FlareLogSheet
          onClose={() => setShowFlareLog(false)}
          onSaved={() => showToast('Flare logged')}
        />
      )}

      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          distance={selectedDistance}
          isCommunity={selectedPlace.source === 'community'}
          isIbdFriendly={ibdSet?.has(ibdKeyForPlace(selectedPlace)) ?? false}
          isBookmarked={isBookmarked(selectedPlace)}
          onClose={() => setSelectedPlaceId(null)}
          onBookmarkToggle={() => toggleBookmark(selectedPlace)}
          onRate={() => user ? setShowRating(true) : setShowAuth(true)}
        />
      )}
      {showRating && user && selectedPlace && (
        <RatingSheet place={selectedPlace} user={user} onClose={() => setShowRating(false)} />
      )}

      {panicResult && (
        <PanicCard
          place={panicResult}
          distance={panicDistance}
          onCancel={() => setPanicResult(null)}
        />
      )}
    </div>
  )
}
