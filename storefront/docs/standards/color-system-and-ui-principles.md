# Enterprise 60-30-10 Color System & Flat UI Principles

## 1. The 60-30-10 Architectural Color Rule

Every UI layout, screen, dialog, and component in this project MUST strictly follow the **60-30-10 Golden Ratio of Color Distribution**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        60-30-10 COLOR BUDGET                           │
├────────────────────────────┬─────────────────────────────┬─────────────┤
│   60% DOMINANT CANVAS      │   30% STRUCTURAL SECONDARY  │ 10% ACCENT  │
│   (Neutral Background)     │   (Surfaces & Typography)   │ (Action CTA)│
├────────────────────────────┼─────────────────────────────┼─────────────┤
│ Light: #FFFFFF / #F8FAFC   │ Solid Navy:  #002C6C (Brand)│ #0077C8     │
│ Dark:  #090D16 / #0F172A   │ Dark Slate:  #1E293B (Text) │ (Electric)  │
│ Purpose: Breathing space,  │ Border Line: #E2E8F0 (Line) │ Purpose:    │
│ contrast & readability     │ Neutral Card: #FFFFFF (Card)│ Primary CTAs│
└────────────────────────────┴─────────────────────────────┴─────────────┘
```

### Allocation Breakdown:

1. **60% Dominant Neutral (Canvas / White Space)**:
   - Light Mode: Pure White (`#FFFFFF`) or Slate-50 (`#F8FAFC`).
   - Dark Mode: Deep Neutral Charcoal (`#090D16` / `#0F172A`).
   - **Requirement**: Must dominate the total pixel area to provide calm, uncluttered breathing room and high readability.

2. **30% Structural Secondary (Surfaces, Containers & Typography)**:
   - Corporate Brand Anchor: Solid Hyundai Navy (`#002C6C` / Pantone 294C).
   - Primary Body Text: High-contrast Dark Slate (`#0F172A` in light mode, `#F8FAFC` in dark mode).
   - Card Surfaces & Tables: Neutral background (`bg-card`), neutral borders (`border-border` / `#E2E8F0`).
   - Structural Sidebar / Brand Panels: Solid deep navy (`bg-[#002C6C]`), never multi-color or gradient.

3. **10% Intentional Accent (Action & Focus ONLY)**:
   - Accent Token: Solid Electric Blue (`#0077C8` / Pantone 3005C) or Solid Cyan (`#00A3E0`).
   - **STRICT RESTRICTION**: Reserved _exclusively_ for:
     - Primary Action Buttons (Submit, Save, Create, Add to Quote).
     - Active Tab indicators & Selected Radio/Checkbox items.
     - Interactive focus rings (`ring-[#0077C8]`).
   - **PROHIBITED**: Never use accent colors for large decorative container backgrounds, card borders, or full-width banners.

---

## 2. Strict Anti-AI-Slop Design Mandates

To ensure our storefront maintains an authentic, high-precision industrial enterprise aesthetic (mirroring Linear, Stripe, and Hyundai Global Engineering Portals) rather than looking like an unpolished AI template:

### 🚫 MANDATE 1: ZERO GRADIENTS (100% Solid Flat Colors)

- **RULE**: Gradients (`bg-gradient-to-*`, `linear-gradient`, `radial-gradient`) are **STRICTLY FORBIDDEN** on:
  - Background panels, hero sections, catalog toolbars.
  - Button fills, card surfaces, product grids, and badges.
  - Vector logos, icons, and typography.
- **REASON**: Gradients create visual noise, fail high-contrast accessibility tests, and represent the primary visual hallmark of amateur AI-generated boilerplates.

### 🚫 MANDATE 2: ZERO RAINBOW / COLORFUL ICON BOXES

- **RULE**: Never place icons inside pastel, neon, or rainbow-colored boxes (e.g. sky-blue icon in cyan box, yellow icon in amber box, purple icon in violet box).
- **STANDARD**:
  - All icons MUST be **Monochromatic Neutral** (`text-muted-foreground`, `text-slate-400`, `text-slate-600` on light surfaces; `text-white/80` or `text-slate-300` on dark navy surfaces).
  - Icon containers MUST be neutral (`bg-white/5 border-white/10` or `bg-muted/40 border-border`).

### 🚫 MANDATE 3: ZERO COLORED GLOWS / NEON SHADOWS

- **RULE**: Drop shadows must strictly use neutral black alpha values (`shadow-sm`, `shadow-md`, `shadow-lg` using `rgba(0, 0, 0, 0.04)` to `rgba(0, 0, 0, 0.12)`).
- **PROHIBITED**: `drop-shadow-[0_4px_12px_rgba(0,163,224,...)]`, blur glow orbs, or colored ambient halos.

### 🚫 MANDATE 4: MONOCHROMATIC SEMANTIC TOKENS

- **Success (`emerald`)**, **Error (`destructive`)**, and **Warning (`amber`)** are reserved strictly for:
  - Small status indicator dots (size 6px - 8px).
  - Badge text labels on inventory/RFQ statuses (`IN STOCK`, `REQUEST QUOTE`).
  - Form validation error text under inputs.
- They MUST NEVER be sprayed across entire card backgrounds or toast dialogs.

---

## 3. Brand Color Palette Reference (Hyundai Industrial Standard)

| Token Name       | Hex Code  | Purpose                          | Permitted Usage                                 |
| :--------------- | :-------- | :------------------------------- | :---------------------------------------------- |
| `HYUNDAI_NAVY`   | `#002C6C` | Corporate Authority (30%)        | Brand sidebars, official headers, logo wordmark |
| `ELECTRIC_BLUE`  | `#0077C8` | Primary Interactive Accent (10%) | Primary buttons, active tabs, link focus        |
| `CYAN_ACCENT`    | `#00A3E0` | Secondary Technical Accent (10%) | Dark mode logo text, subtle technical badges    |
| `DEEP_SLATE`     | `#0F172A` | Core Typography (30%)            | Headings, high-contrast readable body text      |
| `MUTED_SLATE`    | `#64748B` | Secondary Typography (30%)       | Meta labels, timestamps, table descriptions     |
| `NEUTRAL_BORDER` | `#E2E8F0` | Structural Division (30%)        | 1px clean gridlines, card borders, dividers     |
| `CANVAS_WHITE`   | `#FFFFFF` | Dominant Base (60%)              | Light mode background canvas, card fills        |
| `CANVAS_DARK`    | `#090D16` | Dominant Dark Base (60%)         | Dark mode background canvas                     |

---

## 4. Pre-Commit Verification Checklist

Before submitting or reviewing any UI component:

- [ ] Does the page comply with the 60% Canvas / 30% Structure / 10% Accent ratio?
- [ ] Are all backgrounds and surfaces 100% solid flat colors (Zero gradients)?
- [ ] Are all icons monochromatic neutral without pastel rainbow boxes?
- [ ] Is the primary accent color (`#0077C8`) limited strictly to interactive CTAs and active states?
- [ ] Does typography maintain high contrast with sharp geometric sans rendering?
