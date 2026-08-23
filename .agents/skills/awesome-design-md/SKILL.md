---
name: awesome-design-md
description: >-
  Curated collection of production DESIGN.md specifications for modern tech brands
  (Linear, Stripe, Raycast, Vercel, Apple, Notion). Provides design tokens, component
  styles, and visual systems.
---

# Awesome Design.md — Executable Design System Specifications

This skill provides modular `DESIGN.md` design system tokens and guidelines to build interfaces matching industry-leading craft benchmarks.

## 1. The Precision Tech Theme (Linear & Raycast Style)

- **Canvas Background**: `#08090a` / `#0b0c10`
- **Surface Elevation**: `#111215` → `#18191e` → `#22232a`
- **Border Gradients**: `border border-white/[0.08]` with highlight top borders `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- **Accent Primary**: `#f97316` (Coral/Orange), `#22d3ee` (Cyan), or `#6366f1` (Indigo)
- **Typography**: Space Grotesk (headings) + Inter / Geist (body) + JetBrains Mono (data)
- **Radius Tokens**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px)

## 2. The Clean Fintech Theme (Stripe & Mercury Style)

- **Canvas Background**: `#0a0b0d` / `#ffffff`
- **Surface Elevation**: `#12151a` with soft ambient radial glows (`bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent`)
- **Accent Primary**: `#635bff` (Stripe Blurple) or `#00d4b2` (Mint Green)
- **Typography**: Söhne / Inter + Tabular Numerals

## 3. Creating a Project `DESIGN.md`

Every vibe-coded project should include a `DESIGN.md` at its root specifying:
1. **Visual Theme**: Theme name, mood, aesthetic adjectives.
2. **Color Palette**: Backgrounds, surfaces, borders, primary/accent, text tiers.
3. **Typography Stack**: Display font, body font, code font, scale ratios.
4. **Elevation & Shadows**: Shadow styles and glassmorphism levels.
5. **Component Standards**: Buttons, cards, badges, inputs, modal dialogs.
6. **Anti-Patterns**: Explicit list of visual elements to never generate.
