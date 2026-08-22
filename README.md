# Bidboard

**The auction house for outdoor advertising.** Bidboard is a live marketplace
where media owners list billboard / outdoor ad slots and advertisers bid on them
in real time.

## Stack

- **Vite + React + TypeScript**
- **React Router** — `/` (browse), `/listing/:id` (bid), `/sell` (list)
- **Tailwind CSS** — dark "night-billboard" theme
- **Zustand** (with `persist`) — bidding store, watchlist, sort, persisted to `localStorage`

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build -> dist/
npm run preview  # serve the production build
npm run test     # headless store logic tests (vite-node)
```

## Features

- **Live auction grid** with per-card countdowns, filter by format, search by
  city/title, sort by ending-soon / newest / highest-bid / impressions.
- **Simulated marketplace** — rival brands auto-bid every ~7s so the board
  feels alive; you get a toast when a watched slot receives a new bid.
- **Bidding** with min-bid validation, bid history, and **anti-snipe**: a bid in
  the final 3 minutes extends the auction by 3 minutes.
- **Watchlist** (★) — star any slot; filter the grid to watched-only; toasts on
  activity for watched slots.
- **Sell a slot** — publish with rich specs (size, illumination, audience,
  dayparting, impressions, reserve, auction length, artwork swatch).
- **Persistence** — listings, bids, watchlist and sort survive reloads via
  `localStorage` (`bidboard-v1`).
- **Toasts** for bid confirmations, errors and watch activity.
- **SEO/meta** — title, description, Open Graph + Twitter cards.

## Structure

```
src/
  components/   Layout, ListingCard, ToastViewport
  data/seed.ts  Demo billboard inventory (6 slots, enriched specs)
  lib/format.ts Money / impressions / countdown / relative-time helpers
  pages/        HomePage (browse), ListingPage (bid), SellPage (list)
  store/        useBidStore (bid logic) + useUiStore (toasts, watched filter)
  types.ts      Listing / Bid domain types
scripts/        store.test.mjs (headless logic tests)
```

## Roadmap (when you take it live)

- Replace the client-side store + `localStorage` with a real backend
  (Postgres / Supabase) and auth.
- Real-time bid pushes via WebSocket / Supabase Realtime (replace the
  simulated rival engine).
- Media-owner onboarding + KYC, automated auction close + invoicing.

Deploy: static build on **Vercel** — `vite build` output in `dist/` is the
artifact; SPA rewrite is handled by Vercel's default SPA fallback.
