# Bidboard

**The auction house for outdoor advertising.** Bidboard is a live marketplace
where media owners list billboard / outdoor ad slots and advertisers bid on them
in real time — built to be a better, more complete take on the reverse-auction
billboard marketplaces out there.

## Stack

- **Vite + React + TypeScript**
- **React Router** — `/` (browse), `/listing/:id` (bid), `/sell` (list), `/dashboard` (seller)
- **Tailwind CSS** — dark "night-billboard" theme
- **Zustand** (with `persist`) — bidding store, watchlist, saved searches, sort; persisted to `localStorage`

## Features

**Two auction types**
- **Timed (English)** — outbid rivals; min-bid validation; **anti-snipe** extends the
  clock 3 minutes on any bid in the final 3 minutes.
- **Dutch (reverse)** — price starts high and drops on a schedule until a buyer
  accepts and wins instantly at the current price.

**Buyer tools**
- Live grid with per-card countdowns, auction-type badges (Timed / Dutch),
  filter by **category** + format + city search, sort by ending / newest /
  highest-bid / impressions / **best CPM**.
- **Watchlist (★)** with watched-only filter and toasts on watched-slot activity.
- **Saved searches** — pin a filter combo and re-apply it in one click.
- **Simulated rival bidding** keeps timed auctions feeling live.

**Listing richness**
- Geo coordinates + map-style pin, weekly impressions, **views/day**, reserve,
  rate/week, **live CPM**, size, illumination, audience, dayparting, verified
  badge.

**Seller dashboard**
- KPIs (live / ended / watched / live value), live inventory table, close-early.

**Polish**
- How-it-works + trust sections, toasts, Open Graph / Twitter meta, persistence.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build -> dist/
npm run preview  # serve the production build
npm run test     # headless store logic tests (vite-node)
```

## Structure

```
src/
  components/   Layout, ListingCard, ToastViewport
  data/seed.ts  Demo inventory (7 slots, both auction types, enriched specs)
  lib/format.ts Money / impressions / countdown / relative-time / CPM helpers
  pages/        HomePage, ListingPage, SellPage, DashboardPage
  store/        useBidStore (bid logic) + useUiStore (toasts, watched filter)
  types.ts      Listing / Bid domain types
scripts/        store.test.mjs (headless logic tests)
```

## Roadmap (when you take it live)

- Replace client-side store + `localStorage` with a real backend (Supabase /
  Postgres) and auth.
- Real-time bid pushes (WebSocket / Supabase Realtime) replacing the simulated
  rival engine.
- Owner verification flow, payments, and automated auction-close + invoicing.
- Map view (Leaflet) using the geo coordinates already stored per listing.

Deploy: static build on **Vercel** — `vite build` output in `dist/` is the
artifact; SPA rewrite is handled by Vercel's default SPA fallback.
