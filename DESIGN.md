# Design Specification — Bidboard (Pay-to-Rank Public Leaderboard)

## 1. Visual Theme & Personality
- **Aesthetic**: Precision Dark Mode (Linear / Raycast / Outbid.lol vibe)
- **Mood**: High-contrast, electric, competitive, clean, transparent
- **Core Principle**: Product-first density over decorative fluff. Rank is determined purely by bid amount.

## 2. Color Palette & Tokens
- **Canvas Base**: `#0b0c10` (Deep obsidian zinc)
- **Surface 1 (Cards)**: `#13151c`
- **Surface 2 (Inputs/Active)**: `#1e2029`
- **Primary Accent**: `#f97316` / `#ff5733` (Electric Coral/Orange)
- **Top 1 Gold Highlight**: `#fbbf24` / `#f59e0b`
- **Borders**:
  - Default: `border-white/[0.06]`
  - Hover: `border-white/[0.14]`
  - Accent Active: `border-coral-500/60`
- **Text Tiers**:
  - Primary: `#ffffff` / `#f3f4f6`
  - Secondary / Description: `#a1a1aa` / `#9ca3af`
  - Subtle / Metadata: `#71717a` / `#6b7280`

## 3. Iconography Standard
- **Zero Emojis**: Never use system emojis (`🤖`, `🎨`, `📢`, `🥗`, `👑`, `🔥`) for UI categories, buttons, or rankings.
- **Vector Icons**: Use [Lucide Icons](https://lucide.dev) with `strokeWidth={1.75}` via `<CategoryIcon />`.

## 4. Typography Rules
- **Headings**: `Space Grotesk` or heavy `Inter` with `tracking-tight`
- **Body Prose**: `Inter` with `leading-relaxed`
- **All Numerical Data**: `JetBrains Mono` or `tabular-nums` for prices, ranks, click counts, and timestamps.

## 5. Pricing & Ranking Mechanics
- **Minimum Bid**: `$1.00`
- **Minimum Outbid Step**: `+$1.00`
- **Rebids / Top-ups**: Pay only the difference when raising an existing listing's bid.
