---
name: impeccable
description: >-
  Design craftsmanship, UI polish, and anti-pattern constraint engine (inspired by
  impeccable.style). Eliminates AI slop, enforces strict optical alignment,
  color contrast, typography scales, and state completeness.
---

# Impeccable Design & Polish Engine

Impeccable is a design discipline framework that enforces visual hierarchy, precise spacing, and state completeness across frontend codebases.

## Anti-Patterns To Eliminate (The AI Slop Checklist)

1. **The Floating Bubble / Rainbow Gradient**:
   - ❌ *Never*: `bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500` splashed across generic cards.
   - ✅ *Do*: Intentional subtle glows (`bg-coral-500/10` with `blur-3xl` behind dark glass surfaces).
2. **The 3-Card Cookie-Cutter Hero**:
   - ❌ *Never*: A hero followed immediately by 3 identical icon-title-description cards with no real content.
   - ✅ *Do*: Product-centric heroes (live leaderboard, interactive calculator, preview widget, live data feed).
3. **Emoji Overuse**:
   - ❌ *Never*: Using `🚀`, `🔥`, `💡`, `🤖`, `✨` as category or status icons.
   - ✅ *Do*: Crisp monochrome SVG stroke icons ([Lucide](https://lucide.dev)) with matching stroke widths (`strokeWidth={1.75}`).
4. **Missing States**:
   - ❌ *Never*: A button without hover, active, focus-visible, and disabled styling.
   - ✅ *Do*: Complete state definitions for every interactive element.

## Impeccable Commands & Workflows

- **/impeccable polish**:
  - Check text contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text).
  - Audit optical alignment (e.g., center text inside badges taking into account cap height).
  - Apply tabular numbers to all dynamic numeric data.
  - Tighten container paddings and border radiuses (`rounded-xl` for items, `rounded-2xl` for cards, `rounded-3xl` for hero containers).
- **/impeccable critique**:
  - Evaluate visual balance, density, visual hierarchy, and contrast.
  - Flag unnecessary decorative elements that don't serve the product function.
- **/impeccable craft**:
  - Elevate UI with glassmorphism (`backdrop-blur-md bg-surface/80 border border-white/[0.08]`).
  - Add responsive keyboard navigation and clear focus rings.

## Color Tokens & Dark Mode Hierarchy

| Token | Hex / Alpha | Role |
| :--- | :--- | :--- |
| `bg-background` | `#09090b` / `#0b0c10` | Base canvas |
| `bg-surface-1` | `#111113` / `#13151c` | Cards & containers |
| `bg-surface-2` | `#18181b` / `#1e2029` | Inputs, pills, hover backgrounds |
| `border-subtle` | `rgba(255, 255, 255, 0.06)` | Secondary dividers & card borders |
| `border-active` | `rgba(255, 255, 255, 0.15)` | Hover borders & input focus |
| `text-primary` | `#ffffff` / `#f3f4f6` | Headings & primary labels |
| `text-muted` | `#a1a1aa` / `#9ca3af` | Descriptions & secondary labels |
| `text-faint` | `#71717a` / `#6b7280` | Timestamps & fine print |
