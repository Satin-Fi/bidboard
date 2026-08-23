---
name: taste-skill
description: >-
  Enforces frontend design taste, modern high-agency visual standards,
  distinctive font pairings, and anti-generic aesthetic guidelines (Leonxlnx/taste-skill).
---

# Taste Skill — Modern High-Agency Frontend Aesthetics

Taste Skill provides constraints and aesthetic principles to ensure AI-generated interfaces feel like bespoke, high-craft software (Linear, Raycast, Vercel, Stripe) rather than template clones.

## The Taste Rules

1. **Avoid Template Predictability**:
   - Don't build standard "SaaS boilerplate" hero sections unless specifically asked.
   - Put the actual functional product (the list, the feed, the editor, the interactive widget) front and center above the fold.
2. **Precision Border Contrast**:
   - Dark mode interfaces live and die by their borders.
   - Use semi-transparent white borders:
     - Neutral surfaces: `border border-white/[0.06]`
     - Hovered surfaces: `border-white/[0.14]`
     - Active / focused: `border-coral-500/60` or `border-cyan-500/60`
3. **Typography & Expressiveness**:
   - Pair an expressive, tightly tracked heading font (`Space Grotesk`, `Cal Sans`, `Syne`, or heavy `Inter`) with a crisp, hyper-legible body font (`Inter`, `Geist`, `Plus Jakarta Sans`).
   - Use monospaced fonts (`JetBrains Mono`, `Geist Mono`) for all quantitative data.
4. **Restraint Over Decoration**:
   - Good design is 90% subtraction.
   - Remove unnecessary divider lines, nested borders inside cards, rainbow badges, and noisy background patterns.
   - Let white space, typography, and optical alignment carry the design.

## The Vibe Checklist

- [x] Does this look like software built by a top-tier craft team in 2026?
- [x] Are prices and numbers formatted consistently with tabular alignment?
- [x] Are emojis replaced with clean, monochrome SVG icons?
- [x] Does dark mode feel deep, rich, and cohesive (not pitch black `#000000` everywhere, but layered zinc `#09090b` → `#13151c` → `#1e2029`)?
- [x] Do all interactions have instantaneous, polished feedback?
