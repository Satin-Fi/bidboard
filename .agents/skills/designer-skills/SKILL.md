---
name: designer-skills
description: >-
  Comprehensive design systems, accessibility standards, information architecture,
  and UX interaction patterns from the Owl-Listener designer skills collection.
---

# Designer Skills — Systems, Interaction & Architecture

This skill provides foundational UI/UX design capabilities to make thoughtful architectural and interaction design decisions before writing code.

## 1. Information Architecture & Density

- **Clear Scannability**: Users should understand the page hierarchy in under 3 seconds.
- **Top-Level Navigation**: Max 4–6 primary links. Action buttons must be visually distinct (`btn-primary` or `btn-accent`).
- **Data Tables & Leaderboards**:
  - Always align numbers to the right (`text-right tabnum font-mono`).
  - Align text descriptions to the left (`text-left`).
  - Keep status badges and rank counters compact and centered.

## 2. Inclusive & Cognitive Accessibility

- **Keyboard Traversal**:
  - Ensure all interactive rows, buttons, tabs, and inputs are reachable via `Tab` / `Shift+Tab`.
  - Use `role="button"` and `tabIndex={0}` if non-button elements are clickable, with `onKeyDown` supporting `Enter` and `Space`.
- **Accessible Contrast**:
  - Text on dark backgrounds must have at least 4.5:1 contrast against `#09090b` (e.g., `#ffffff`, `#f3f4f6`, `#a1a1aa`).
  - Secondary metadata must not drop below `#71717a`.
- **ARIA & Screen Readers**:
  - Dynamic live regions for real-time tickers and rank updates (`aria-live="polite"`).
  - Clear `aria-label` attributes on icon-only buttons (close buttons, menu triggers, copy links).

## 3. Responsive Layout Patterns

- **Fluid Breakpoints**:
  - `sm`: 640px (single column to 2-column or table expansion)
  - `md`: 768px (sidebar navigation / drawer collapse)
  - `lg`: 1024px (multi-column dashboard / podium cards)
- **Container Max-Widths**:
  - Focused leaderboards / tools: `max-w-4xl` (896px).
  - Dashboards / wide apps: `max-w-7xl` (1280px).
  - Form flows & auth: `max-w-md` to `max-w-xl` (448px - 576px).
