# Bidboard

**The auction house for outdoor advertising.** Bidboard is a live marketplace
where media owners list billboard / outdoor ad slots and advertisers bid on them
in real time.

> Demo build: bidding, listings, and the auction clock run client-side (no
> backend yet). Wire up a real API when you're ready to take bids to production.

## Stack

- **Vite + React + TypeScript**
- **React Router** for routing (`/`, `/listing/:id`, `/sell`)
- **Tailwind CSS** for the dark "night-billboard" theme
- **Zustand** for the bidding store (live state, bid validation, auction clock)

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build -> dist/
npm run preview    # serve the production build
```

## Structure

```
src/
  components/      Layout, ListingCard
  data/seed.ts     Demo billboard inventory
  lib/format.ts    Money / impressions / countdown helpers
  pages/           HomePage (browse), ListingPage (bid), SellPage (list)
  store/           Zustand bid store (placeBid, createListing, tick)
  types.ts         Listing / Bid domain types
```

## Pages

- **/** — hero + live auction grid, filter by format and search by city/title.
- **/listing/:id** — slot detail, live countdown, bid form with min-bid
  validation, and bid history.
- **/sell** — publish a new slot straight into the open auction.

## Roadmap (when you take it live)

- Replace the in-memory Zustand store with a real backend (bids, auth, payments).
- Persist listings + bids (Postgres / Supabase).
- Real-time update channel (WebSocket / Supabase Realtime) for live bid pushes.
- Media-owner onboarding + KYC, and automated auction close + invoicing.

Deploy: static build on **Vercel** — `vite build` output in `dist/` is the
artifact; SPA rewrite is handled by `vite preview` and Vercel's default SPA
fallback.
