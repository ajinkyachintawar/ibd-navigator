# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # tsc -b && vite build (type-check first, then bundle)
npm run lint      # oxlint
npm run preview   # preview production build locally
```

No test suite yet. The backend Express server (legacy, not used by the new app) is in the sibling directory `../Navigator-main/markers-backend/`.

## Environment

Requires `.env` at project root (never commit it):
```
VITE_SUPABASE_URL=https://zayzetpvechcibvmbpoc.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Supabase project ref: `zayzetpvechcibvmbpoc`. MCP server is wired in `.mcp.json`. Schema lives in `supabase/schema.sql` — run once in the Supabase SQL editor.

## Architecture

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS v3. Map: React-Leaflet + react-leaflet-cluster (no OpenLayers — avoids DOM conflicts). Server state: TanStack Query v5. Global UI state: React Context + useReducer (`AppContext`). Database: Supabase PostgreSQL. Hosted on Cloudflare Pages.

### Data flow

```
useGeolocation (watchPosition)
    ↓ UserLocation
AppContext (activeCategory, range, openNowOnly)
    ↓
usePlaces → Overpass API → Place[]
    ↓ filtered by isOpenNow if openNowOnly
Map/index.tsx → MarkerClusterGroup → PlaceMarker (per result)
```

### Key files

| File | Purpose |
|---|---|
| `src/types/index.ts` | All shared types: `Place`, `Category`, `RangeMetres`, `AppState` |
| `src/context/AppContext.tsx` | Global state — location, activeCategory, range, openNowOnly. Use `useAppContext()` hook. |
| `src/lib/overpass.ts` | Shared Overpass constants: 3 public endpoints, User-Agent, 10s timeout |
| `src/hooks/usePlaces.ts` | Fetches places from Overpass with endpoint rotation, AbortController timeout, 3-endpoint fallback, GPS coord rounding to prevent re-fetches on tiny GPS drift |
| `src/hooks/useGeolocation.ts` | `watchPosition` wrapper. Falls back to `IRELAND_CENTRE` (53.4, -8.0) silently if GPS denied |
| `src/utils/haversine.ts` | Distance in metres between two lat/lon points |
| `src/utils/isOpenNow.ts` | Parses OSM `opening_hours` strings → `'open' \| 'closed' \| 'unknown'` |
| `src/utils/formatDistance.ts` | `getWalkingTime(metres)` and `formatDistance(metres)`. Uses non-breaking space to prevent unit wrapping. |

### Overpass query behaviour

- **Toilets**: union query — public nodes + `toilets=yes` nodes/ways + 12 venue types (fast food, pubs, supermarkets, etc.) with `toilets=yes`. Uses `out center` to get way centroids. `placeType` on `Place` stores the original OSM `amenity` tag so the popup shows "SUPERMARKET · HAS TOILET" not "PUBLIC TOILET".
- **Pharmacy / Restaurant**: simple `amenity=pharmacy` / `amenity=restaurant` node query.
- GPS lat/lon rounded to 3dp (~111m) in TanStack Query key to avoid refetching on GPS micro-drift.
- `refetchOnWindowFocus: false` and `refetchOnReconnect: false` set globally.

### Phase 3 urgency features

- **PanicButton**: checks TanStack cache first, then hits Overpass. Auto-escalates 500m → 1km → 2km if 0 results. GPS-denied guard. Falls back to Google Maps search URL on total failure. Queries both nodes AND ways (unlike early version that missed way-mapped toilets).
- **CantWaitCard**: portal to `document.body`. Screen Wake Lock API keeps screen on. `history.pushState` pattern handles Android back button. Language persisted in `localStorage` (`cwc-lang`). 10 languages in `src/components/CantWaitCard/translations.ts`.
- **OpenNowToggle**: hides only `'closed'` status places — `'unknown'` hours are kept visible. Auto-reverts if filtering leaves 0 results.

### Styling

Tailwind utility classes for all new components. Custom CSS only in `src/index.css` for Leaflet overrides and custom marker/cluster/popup classes (`.place-marker`, `.cluster-bubble`, `.ibd-card`, `.ibd-card-*`). Do not add component-level `.css` files.

### Supabase (Phase 4 — not yet wired to UI)

Tables: `markers` (community-submitted places), `ratings` (per-user star ratings), `bookmarks`. All have RLS enabled. `markers.source` distinguishes `'osm'` (Overpass) from `'community'` (user-submitted). Use `supabase` client from `src/lib/supabase.ts`.

## Decisions worth knowing

- **No Next.js** — map is 100% client-side, SSR adds zero benefit.
- **React-Leaflet over OpenLayers** — OL manipulates the DOM directly and causes React `insertBefore` errors on state changes.
- **Overpass over Google Maps API** — free, open-source, no key needed.
- **Cloudflare Pages over Vercel** — unlimited bandwidth, 310+ edge locations.
- **Supabase free tier pauses after 1 week idle** — solve with a Cloudflare Worker daily ping cron.
