# Exit Right · Next.js

> Smart metro exit & last-mile planner for Chennai Metro

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + design tokens |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth) |
| HTTP | fetch / REST |

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup (public)
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/           # Protected screens with bottom nav
│   │   ├── home/
│   │   ├── station/
│   │   ├── destination/
│   │   ├── recommendation/
│   │   ├── compare/
│   │   ├── cabs/
│   │   ├── redirect/
│   │   ├── safety/
│   │   ├── saved/
│   │   ├── history/
│   │   └── settings/
│   └── auth/callback/   # OAuth redirect handler
├── components/
│   ├── ui/              # Icon, BottomNav, Pill, CrowdMeter, TapBtn, BackBtn
│   ├── map/             # MapBg (swap for Mapbox/Google Maps)
│   └── forms/           # FormField
├── lib/
│   ├── tokens.ts        # Design tokens (colours, shadows, radii)
│   ├── supabase.ts      # Browser Supabase client
│   └── api/             # auth · stations · routes · trips · saved
├── store/               # Zustand: useAuthStore · useRouteStore · useSettingsStore
└── types/               # Shared TypeScript types
```

## Quick start

### 1 — Install

```bash
npm install
# or
pnpm install
```

### 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run the full `supabase/schema.sql` file
3. Enable **Google OAuth** in Authentication → Providers (optional)

### 3 — Configure environment

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4 — Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Backend API routes to add

Create these under `src/app/api/` to wire up real recommendations:

| Route | Purpose |
|---|---|
| `POST /api/recommend` | Takes `fromStationId` + `toDestination`, returns `RouteRecommendation` |
| `GET /api/cabs` | Aggregates live cab ETAs from Uber/Ola/Rapido APIs |
| `GET /api/weather` | Returns weather alerts for a lat/lng |

## Replacing the map

`src/components/map/MapBg.tsx` renders a static SVG grid. To use a real map:

```tsx
// Install: npm install mapbox-gl @types/mapbox-gl
import Map from 'react-map-gl';

export function MapBg({ children }: { children?: React.ReactNode }) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: 80.22, latitude: 12.97, zoom: 14 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {children}
    </Map>
  );
}
```

## Cab deep links

`src/lib/api/routes.ts` exports `buildCabDeepLink()` which generates native app
deep links for Uber, Ola, Rapido, and Namma Yatri. On mobile these open the
installed app directly with the pickup pre-filled.

## Design tokens

All colours, shadows and radii live in `src/lib/tokens.ts` as the `ER` object,
and are also registered in `tailwind.config.ts` as `er-*` utilities
(e.g. `text-er-green`, `bg-er-greens`, `shadow-er-card`).

---

Made with ♥ in Chennai
