# IBD Navigator

A free, open-source Progressive Web App for people with Inflammatory Bowel Disease (IBD) in Ireland. Find nearby toilets, pharmacies, and IBD-friendly places — fast.

**Live:** https://ibd-navigator.ajinkyachintawar12.workers.dev

---

## Features

- **Map** — real-time place search using OpenStreetMap data (toilets, pharmacies, restaurants)
- **Panic Button** — instantly finds the nearest toilet, auto-escalates search radius if nothing is close
- **No Wait Card** — digital version of the Crohn's & Colitis Ireland No Wait Card, with a link to register for the physical card
- **Open Now filter** — shows only places currently open based on OSM opening hours
- **Community markers** — signed-in users can add and rate places
- **Bookmarks** — save places locally or to your account
- **PWA** — installable on iOS and Android, works offline with cached map tiles

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind CSS |
| Map | React-Leaflet v5 + react-leaflet-cluster |
| Place data | Overpass API (OpenStreetMap), 3-endpoint rotation |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Cloudflare Workers (free tier) |
| PWA | vite-plugin-pwa + Workbox |

## Getting Started

```bash
git clone https://github.com/ajinkyachintawar/ibd-navigator.git
cd ibd-navigator
npm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set up the database using `supabase/schema.sql` in your Supabase project, then:

```bash
npm run dev
```

## Contributing

Contributions are welcome. Open an issue to discuss what you'd like to add before submitting a PR.

A few areas where help would be valuable:
- IBD-friendly restaurant tagging and filtering
- Translations (Irish language support)
- Accessibility improvements
- More granular toilet data (baby change, RADAR key, etc.)

## Data Sources

Place data comes from [OpenStreetMap](https://www.openstreetmap.org/) via the [Overpass API](https://overpass-api.de/). No API key required.

## License

MIT
