---
name: web-design-guidelines
description: >-
  Vercel Web Interface Guidelines and frontend engineering standards.
  Covers accessibility, performance, zero layout shift (CLS), touch targets,
  and keyboard navigation.
---

# Vercel Web Interface Guidelines

Auditing and implementation standards derived from Vercel's official Web Interface Guidelines to ensure rock-solid, production-grade web applications.

## 1. Zero Cumulative Layout Shift (CLS)

- **Fixed Dimensions on Media**: Always specify explicit `width` and `height` (or aspect ratio) on avatars, favicons, logos, and images.
- **Skeleton Placeholders**: Render accurately sized skeleton states while async data (leaderboard rows, stats, activity) is loading.
- **Font Display**: Use `font-display: swap` with metric-matched system fallbacks.

## 2. Interaction & Touch Targets

- **Minimum Touch Target**: Interactive elements on mobile touchscreens must be at least `44x44px` (or `min-h-[40px] px-3`).
- **Focus Rings**:
  - Never set `outline: none` without providing an explicit replacement.
  - Standard focus ring: `focus-visible:ring-2 focus-visible:ring-coral-500/50 focus-visible:outline-none`.
- **Keyboard Shortcuts**: Modals must close on `Escape` key press. Dropdowns must navigate via `ArrowDown` / `ArrowUp` and confirm on `Enter`.

## 3. Responsive & Mobile Performance

- **Fast First Meaningful Paint**: Keep bundle sizes minimal, split chunk entrypoints, and avoid loading heavy charting libraries on the critical path if not immediately visible.
- **Safe Area Insets**: Respect mobile viewports with `env(safe-area-inset-bottom)` on sticky navigation bars and action sheets.
- **No Horizontal Overflow**: Never allow unintentional horizontal scroll on the viewport body (`overflow-x-hidden` on main wrappers).
