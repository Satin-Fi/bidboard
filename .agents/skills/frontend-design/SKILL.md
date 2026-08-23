---
name: frontend-design
description: >-
  Expert guide for crafting distinctive, production-grade frontend interfaces,
  web components, and application designs with high visual craftsmanship,
  intentional typography, polished animations, and zero generic AI tropes.
---

# Frontend Design & Craftsmanship Skill

This skill provides guidelines and actionable standards for building distinctive, production-grade web interfaces with exceptional aesthetic taste.

## Core Philosophy

- **Avoid Generic "AI Slop"**: Reject clichéd AI tropes like default purple-to-blue gradient cards, generic hero sections with 3 identical cards, floating colorful bubbles, and generic stock illustrations.
- **Commit to a Strong Visual Identity**: Choose a bold, coherent art direction:
  - *Precision Dark Mode* (Linear, Raycast, Vercel)
  - *Editorial / High Contrast* (Stripe Press, ReadCV, Pitch)
  - *Brutal Minimalist* (Craigslist, Gumroad, Figma FigJam)
  - *Neo-Fintech / Clean Technical* (Stripe, Mercury, Ramp)
- **High Information Density**: Present meaningful data cleanly with tabular numbers (`font-mono` / `tabular-nums`), compact badges, micro-interactions, and tight spacing scales rather than giant empty cards.

## Typography Principles

1. **Hierarchy & Scale**:
   - Establish strict contrast between page titles, section headers, card titles, and metadata.
   - Use high-contrast font pairings (e.g., expressive display font + crisp neutral sans-serif body).
2. **Tabular Numerals**:
   - Always use `font-mono` or `font-feature-settings: 'tnum'` for prices, ranks, click counts, timestamps, and stock/crypto values to avoid layout shifts.
3. **Leading & Tracking**:
   - Tighten tracking on display headings (`tracking-tight` / `-0.03em`).
   - Generous line height on body prose (`leading-relaxed`), tight leading on titles.

## Spacing & Layout Architecture

- **Predictable Spacing Scale**: Stick strictly to 4px/8px grid units (`gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`).
- **Surface Elevation Layers**:
  - `bg-bg` / Canvas (`#09090b` or `#0b0c10`)
  - `bg-surface-1` / Cards (`#111113` or `#13151c`)
  - `bg-surface-2` / Active elements (`#18181b` or `#1e2029`)
  - `border-white/[0.06]` to `border-white/[0.12]` for crisp, non-blurry borders.
- **Mobile First & Responsive Density**:
  - Horizontal scrolling pills on mobile (`overflow-x-auto no-scrollbar`).
  - Collapse secondary metadata into compact horizontal lines.

## Iconography & Vector Assets

- **Never Use System Emojis in Professional UI**:
  - Replace emojis (`🤖`, `🎨`, `📢`, `👑`, `🔥`) with monochrome vector SVG stroke icons ([Lucide Icons](https://lucide.dev) with `stroke-width={1.75}`).
- **Consistent Sizing**:
  - Inline icons: `w-3.5 h-3.5` or `w-4 h-4`.
  - Icon buttons / avatar badges: `w-7 h-7` to `w-9 h-9` with `rounded-lg` or `rounded-xl`.

## Micro-Interactions & Motion

- **Subtle, Fast Durations**: Transitions between 100ms - 200ms (`transition-all duration-150 ease-out`).
- **Spring Physics for Modals**: Use Framer Motion springs (`stiffness: 300, damping: 25`).
- **Interactive Feedback**:
  - Hover states: `hover:bg-white/[0.04]`, `hover:border-white/[0.15]`.
  - Active states: `active:scale-[0.98]`.
  - Focus states: `focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none`.
