# Graph Report - src  (2026-06-28)

## Corpus Check
- Corpus is ~5,609 words - fits in a single context window. You may not need a graph.

## Summary
- 137 nodes · 243 edges · 12 communities
- Extraction: 96% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Place Marker Rendering|Place Marker Rendering]]
- [[_COMMUNITY_Category Controls|Category Controls]]
- [[_COMMUNITY_Geolocation & Map Pan|Geolocation & Map Pan]]
- [[_COMMUNITY_Overpass Fetch Pipeline|Overpass Fetch Pipeline]]
- [[_COMMUNITY_Distance & Hours Utils|Distance & Hours Utils]]
- [[_COMMUNITY_App Root & Core Math|App Root & Core Math]]
- [[_COMMUNITY_Global Context & State|Global Context & State]]
- [[_COMMUNITY_Overpass Config & Panic|Overpass Config & Panic]]
- [[_COMMUNITY_State Types & Reducer|State Types & Reducer]]
- [[_COMMUNITY_Can't Wait Card|Can't Wait Card]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_IBD Card Translations|IBD Card Translations]]

## God Nodes (most connected - your core abstractions)
1. `MapView component (root map UI)` - 17 edges
2. `UserLocation` - 11 edges
3. `useAppContext()` - 9 edges
4. `Place interface` - 9 edges
5. `PlaceMarker component (Leaflet Marker + Popup)` - 9 edges
6. `UserLocation interface` - 8 edges
7. `usePlaces hook (react-query wrapper)` - 8 edges
8. `PlaceMarker()` - 7 edges
9. `PanicButton component (emergency toilet finder)` - 7 edges
10. `Category type (toilet|pharmacy|restaurant)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `supabase client singleton` --conceptually_related_to--> `Place interface`  [AMBIGUOUS]
  src/lib/supabase.ts → src/types/index.ts
- `App (root component)` --references--> `MapView component (root map UI)`  [EXTRACTED]
  src/App.tsx → src/components/Map/index.tsx
- `usePlaces hook (react-query wrapper)` --shares_data_with--> `QueryClient (react-query cache config)`  [INFERRED]
  src/hooks/usePlaces.ts → src/main.tsx
- `MapView component (root map UI)` --conceptually_related_to--> `reducer function (AppState actions)`  [INFERRED]
  src/components/Map/index.tsx → src/context/AppContext.tsx
- `MapView component (root map UI)` --references--> `CantWaitCard component (IBD dignity card overlay)`  [EXTRACTED]
  src/components/Map/index.tsx → src/components/CantWaitCard/index.tsx

## Hyperedges (group relationships)
- **MapView orchestrates all UI state, location, and place data** — map_mapview, appcontext_useappcontext, usegeolocation_usegeolocation, useplaces_useplaces, isoopennow_isoopennow, placemarker_placemarker, categoryfilter_categoryfilter, rangeselector_rangeselector, opennowtoggle_opennowtoggle, panicbutton_panicbutton, cantwaittcard_cantwaittcard [INFERRED 0.95]
- **Overpass data pipeline: build query → fetch with retry → parse to Place[]** — useplaces_buildquery, useplaces_fetchwithttimeout, useplaces_fetchfromoverpass, useplaces_parseelements, overpass_endpoints, overpass_useragent, overpass_timeoutms, types_place [EXTRACTED 0.97]
- **Panic mode: escalating radius search → nearest sort → Google Maps redirect** — panicbutton_panicbutton, panicbutton_fetchtoilets, panicbutton_nearest, haversine_haversine, types_place, types_rangemetres, main_queryclient [EXTRACTED 0.92]
- **Global app state shared across all control components via AppContext** — appcontext_appcontext, appcontext_appprovider, appcontext_useappcontext, appcontext_reducer, types_appstate, categoryfilter_categoryfilter, rangeselector_rangeselector, opennowtoggle_opennowtoggle, map_mapview [EXTRACTED 0.96]
- **Place display pipeline: Place data → haversine dist → isOpenNow → PlaceMarker popup** — types_place, haversine_haversine, isoopennow_isoopennow, formatdistance_formatdistance, formatdistance_getwalkingtime, placemarker_placemarker, placemarker_createicon, placemarker_getplacelabel [INFERRED 0.93]

## Communities (12 total, 0 thin omitted)

### Community 0 - "Place Marker Rendering"
Cohesion: 0.12
Nodes (17): BORDER_COLOUR, CATEGORY_LABEL, createIcon(), EMOJI, getPlaceLabel(), PlaceMarker(), Props, STATUS (+9 more)

### Community 1 - "Category Controls"
Cohesion: 0.14
Nodes (16): CATEGORIES, CategoryFilter(), Action, AppContext, AppProvider(), initial, useAppContext(), OpenNowToggle() (+8 more)

### Community 2 - "Geolocation & Map Pan"
Cohesion: 0.15
Nodes (11): GeolocationState, IRELAND_CENTRE, useGeolocation(), Props, CLUSTER_COLOUR, CLUSTER_EMOJI, makeClusterIcon(), MapView() (+3 more)

### Community 3 - "Overpass Fetch Pipeline"
Cohesion: 0.26
Nodes (10): buildQuery(), fetchFromOverpass(), fetchWithTimeout(), parseElements(), parseName(), RawElement, round3(), usePlaces() (+2 more)

### Community 4 - "Distance & Hours Utils"
Cohesion: 0.27
Nodes (10): formatDistance utility, getWalkingTime utility (1.4 m/s WHO standard), isOpenNow utility (OSM opening_hours parser), createIcon (divIcon factory per category), getPlaceLabel (venue-type label resolver), PlaceMarker component (Leaflet Marker + Popup), supabase client singleton, MarkerSource type (osm|community) (+2 more)

### Community 5 - "App Root & Core Math"
Cohesion: 0.22
Nodes (10): App (root component), AppProvider component, FlyToUser component (map pan on GPS), haversine distance formula, LocationMarker component (user position dot), main.tsx (entry point), QueryClient (react-query cache config), nearest (haversine sort for closest toilet) (+2 more)

### Community 6 - "Global Context & State"
Cohesion: 0.33
Nodes (9): AppContext (React context), useAppContext hook, CategoryFilter component, makeClusterIcon factory (per-category cluster icons), MapView component (root map UI), OpenNowToggle component, RangeSelector component, IRELAND_CENTRE fallback location (+1 more)

### Community 7 - "Overpass Config & Panic"
Cohesion: 0.32
Nodes (8): OVERPASS_ENDPOINTS (3 fallback URLs), OVERPASS_TIMEOUT_MS constant (10s), OVERPASS_USER_AGENT constant, fetchToilets (standalone Overpass fetch, no hook), buildQuery (Overpass QL builder), fetchFromOverpass (multi-endpoint retry), fetchWithTimeout (AbortController wrapper), parseElements (OSM response parser)

### Community 8 - "State Types & Reducer"
Cohesion: 0.43
Nodes (7): Action union type (5 action types), reducer function (AppState actions), AppState interface, Category type (toilet|pharmacy|restaurant), RangeMetres type (500|1000|2000|5000), round3 (GPS drift stabilizer, 111m precision), usePlaces hook (react-query wrapper)

### Community 9 - "Can't Wait Card"
Cohesion: 0.40
Nodes (3): Props, Translation, TRANSLATIONS

### Community 10 - "Supabase Client"
Cohesion: 0.50
Nodes (3): key, supabase, url

### Community 11 - "IBD Card Translations"
Cohesion: 0.67
Nodes (3): CantWaitCard component (IBD dignity card overlay), Translation interface, TRANSLATIONS (multilingual IBD card text, 10 languages)

## Ambiguous Edges - Review These
- `Place interface` → `supabase client singleton`  [AMBIGUOUS]
  src/lib/supabase.ts · relation: conceptually_related_to

## Knowledge Gaps
- **34 isolated node(s):** `queryClient`, `MarkerSource`, `Action`, `initial`, `AppContext` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Place interface` and `supabase client singleton`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `MapView component (root map UI)` connect `Global Context & State` to `State Types & Reducer`, `IBD Card Translations`, `Distance & Hours Utils`, `App Root & Core Math`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `UserLocation` connect `Geolocation & Map Pan` to `Place Marker Rendering`, `Category Controls`, `Overpass Fetch Pipeline`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `usePlaces hook (react-query wrapper)` connect `State Types & Reducer` to `Distance & Hours Utils`, `App Root & Core Math`, `Global Context & State`, `Overpass Config & Panic`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `queryClient`, `MarkerSource`, `Action` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Place Marker Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
- **Should `Category Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._