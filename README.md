# Bidboard

**The auction house for outdoor advertising.** Bidboard is a live marketplace
where media owners list billboard / outdoor ad slots and advertisers bid on them
in real time — a complete, full-stack take on the reverse-auction billboard
marketplace.

## Architecture

```
┌─────────────────────────┐         REST + WebSocket          ┌──────────────────────────┐
│  Bidboard SPA (Vercel)   │  ───────────────────────────────▶ │  Bidboard API (Render)    │
│  Vite + React + TS       │  /api/*  +  /ws (live bids)        │  Node + Express + ws      │
│  Zustand + Tailwind      │  ◀─────────────────────────────── │  JWT auth · market-maker  │
└─────────────────────────┘                                    └────────────┬───────────────┘
                                                                         │ JSON repo (Postgres-ready)
                                                                         ▼
                                                              data/db.json  (swap for Supabase/PG)
```

- **Frontend** (`/`): Vite + React + TS, React Router, Tailwind, Zustand, JWT
  in `localStorage`, live updates over WebSocket, SVG map view (no external map
  dependency).
- **Backend** (`/server`): Node + Express + `ws`, JWT auth (bcrypt), a
  JSON-file repository whose interface mirrors a SQL repo (drop-in Postgres
  swap), a market-maker bot that places rival bids and closes expired auctions,
  and a WebSocket hub broadcasting every event to all clients.

## Features

- **Two auction types** — Timed (English, with anti-snipe) and Dutch (reverse,
  declining price until accepted).
- **Auth** — register/login, JWT, demo owner + buyer accounts.
- **Realtime** — bids, accepts and auction ends stream over WebSocket; the grid
  and detail pages update live with no refresh.
- **Buyer tools** — category + format + city filters, CPM sort, watchlist (★),
  saved searches, simulated rival activity.
- **Seller** — dashboard (KPIs, live inventory, close-early), create listings
  (both auction types, geo, specs), login-gated publishing.
- **Map view** — live slots plotted on a US map via lat/lng.
- **Polish** — how-it-works + trust sections, toasts, Open Graph meta.

## Run locally

```bash
# terminal 1 — backend (auto-seeds)
cd server && npm install && npm start          # :4000

# terminal 2 — frontend (dev proxy forwards /api + /ws to :4000)
npm install && npm run dev                       # :5173
```

Open http://localhost:5173. Demo logins: `owner@bidboard.app` / `buyer@bidboard.app`
(password `password123`).

## Build & test

```bash
npm run build      # type-check + production build -> dist/
npm test           # vitest: auction rules unit tests
cd server && npm test   # live REST + WS backend integration test (spins a real server)
```

## Deploy

- **Frontend → Vercel**: `vercel.json` builds `dist/` and SPA-rewrites all
  routes. Set `VITE_API_URL` / `VITE_WS_URL` to the backend, or rely on the
  same-origin proxy.
- **Backend → Render**: `render.yaml` + `server/Procfile` run `npm start` on the
  free tier. Set `CORS_ORIGIN` to your Vercel domain and `JWT_SECRET`.

## Roadmap

- Swap the JSON repo for Postgres/Supabase (interface already matches).
- Payments + automated invoice on auction close.
- Owner verification flow; richer analytics.
