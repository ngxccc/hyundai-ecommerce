# UI/UX & Styling Guidelines

This document establishes the canonical UI/UX design standards, component architecture, and styling rules used in both the storefront (`apps/storefront`) and admin (`apps/admin`) applications.

## 1. Executive Summary & Aesthetic Direction

We aim for a highly premium, modern look that emphasizes **industrial power, high reliability, and premium precision**. It aligns with Next.js App Router conventions, Tailwind CSS v4's inline `@theme` config, and a rigid, sharp-corner industrial look inspired by tool-launcher aesthetics (e.g., Raycast).

- **Industrial Chrome & Precision**: Minimalist layout structures with a strict focus on grid alignment, high typography contrast, and subtle depth.
- **Glassmorphism**: Backdrop blurs (`backdrop-blur-md` with `bg-background/80`) are standard on sticky navs, sheets, and popovers.
- **Letter Spacing & Micro-animations**: Provide clean transitions (`transition-all duration-300`) on interactive states like hover, focus, and active clicks.

---

## 2. Design Tokens & Mappings

### 2.1. OKLCH Color Palettes

All colors are defined strictly in the **OKLCH space** (Lightness, Chroma, Hue) to guarantee perceptually uniform luminosity steps.

#### Unified Light Palette (`:root` - Active in both Storefront & Admin)

| CSS Custom Property        | OKLCH Value                 | Architectural Role / Visual Description                        |
| :------------------------- | :-------------------------- | :------------------------------------------------------------- |
| `--background`             | `oklch(1 0 0)`              | Pure white page foundation                                     |
| `--foreground`             | `oklch(0.2 0.02 258)`       | Deep industrial indigo-slate for body text                     |
| `--card`                   | `oklch(1 0 0)`              | Pure white card surfaces                                       |
| `--card-foreground`        | `oklch(0.2 0.02 258)`       | Deep indigo-slate for card headings/copy                       |
| `--popover`                | `oklch(1 0 0)`              | Dropdowns, menus, and popover dialogs                          |
| `--popover-foreground`     | `oklch(0.2 0.02 258)`       | Headings and icons inside popovers                             |
| `--primary`                | `oklch(0.318 0.11 258)`     | Dark electric indigo-blue; primary interactive elements        |
| `--primary-foreground`     | `oklch(0.97 0.014 254.604)` | Ultra-light ice-blue for text on primary backgrounds           |
| `--secondary`              | `oklch(0.96 0.01 258)`      | Light grey-blue for secondary button/input backgrounds         |
| `--secondary-foreground`   | `oklch(0.318 0.11 258)`     | Primary interactive color used as text on secondary elements   |
| `--muted`                  | `oklch(0.96 0.01 258)`      | Background for disabled or non-interactive blocks              |
| `--muted-foreground`       | `oklch(0.55 0.02 258)`      | Medium slate-gray for placeholder text, captions, and details  |
| `--accent`                 | `oklch(0.96 0.01 258)`      | Interactive hover highlights on lists, dropdown rows, and tabs |
| `--accent-foreground`      | `oklch(0.2 0.02 258)`       | Slate-gray text for accent hover states                        |
| `--border` / `--input`     | `oklch(0.9 0.02 258)`       | Structural layout borders and form inputs                      |
| `--ring`                   | `oklch(0.318 0.11 258)`     | Focus ring outline color                                       |
| `--destructive`            | `oklch(0.6 0.2 25)`         | Coral-red warning color for destructive states                 |
| `--destructive-foreground` | `oklch(1 0 0)`              | White text on destructive warning blocks                       |

#### Dark Palette Comparison: Storefront vs. Admin

Storefront uses a warmer, slightly more electric blue-slate theme (Hue `258`, Chroma `0.02` / `0.01`), while Admin uses a highly neutral, low-fatigue slate (Hue `250`, Chroma `0.01` / `0.005`) with a slightly dimmer primary interactive component.

| Token Group    | Property                  | Storefront Dark (`.dark` in Storefront) | Admin Dark (`.dark` in `@nhatnang/ui`) | Purpose & Design Justification                                                                           |
| :------------- | :------------------------ | :-------------------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Canvas**     | `--background`            | `oklch(0.15 0.02 258)`                  | `oklch(0.14 0.01 250)`                 | Admin is darker (14% L) and more neutral for screen endurance.                                           |
|                | `--foreground`            | `oklch(0.98 0.01 258)`                  | `oklch(0.98 0.005 250)`                | Bright, clean off-white text in both apps.                                                               |
| **Surfaces**   | `--card` / `--popover`    | `oklch(0.2 0.02 258)`                   | `oklch(0.17 0.01 250)`                 | Raised container background; admin keeps a lower chroma.                                                 |
|                | `--card-foreground`       | `oklch(0.98 0.01 258)`                  | `oklch(0.98 0.005 250)`                | Text inside cards/popovers.                                                                              |
| **Accents**    | `--primary`               | `oklch(0.5 0.15 258)`                   | `oklch(0.6 0.15 250)`                  | Interactive accent. Admin uses a higher lightness (60% vs 50%) for readability on its darker background. |
|                | `--primary-foreground`    | `oklch(0.15 0.02 258)`                  | `oklch(0.12 0.01 250)`                 | Text on primary containers; uses dark background colors.                                                 |
| **Muted**      | `--muted` / `--secondary` | `oklch(0.25 0.02 258)`                  | `oklch(0.22 0.01 250)`                 | Subdued backgrounds.                                                                                     |
|                | `--muted-foreground`      | `oklch(0.65 0.02 258)`                  | `oklch(0.7 0.01 250)`                  | Placeholders; admin text is slightly brighter for contrast.                                              |
| **Borders**    | `--border` / `--input`    | `oklch(0.25 0.02 258)`                  | `oklch(0.22 0.01 250)`                 | Component and divider line borders.                                                                      |
| **Focus**      | `--ring`                  | `oklch(0.5 0.15 258)`                   | `oklch(0.6 0.15 250)`                  | Interactive focus indicator outline.                                                                     |
| **Warning**    | `--destructive`           | `oklch(0.6 0.2 25)`                     | `oklch(0.5 0.15 25)`                   | Error indicator. Admin is slightly darker and less saturated.                                            |
| **Navigation** | `--sidebar`               | `oklch(0.205 0 0)`                      | `oklch(0.15 0.01 250)`                 | Admin integrates a custom side layout, storefront uses pure gray.                                        |
|                | `--sidebar-border`        | `oklch(1 0 0 / 10%)`                    | `oklch(0.22 0.01 250)`                 | Sidebar segmenting lines.                                                                                |

### 2.2. Typography Guidelines

Typography is engineered for technical precision, data density, and maximum legibility.

1. **Font Families**:
   - **`--font-sans` / `--font-heading`**: Inter. Used for layouts, titles, buttons, forms, and general body text.
   - **`--font-mono`**: JetBrains Mono (or fallback `ui-monospace, SFMono-Regular, Menlo, monospace`). Used for tech elements: Product SKUs, coupon codes, currencies/prices, invoice numbers, table data, and form labels containing numerical values.
2. **Typography Sizing & Spacing Scale**:
   - **Display Header**: `text-4xl` / `text-5xl` with `tracking-tighter` (`-0.035em`) and `font-bold`. Used for Hero storefront titles.
   - **Page Title (H1)**: `text-2xl` / `text-3xl` with `tracking-tight` (`-0.015em`) and `font-semibold`. Used in the shared Admin `<Header>` component.
   - **Section Title (H2)**: `text-lg` / `text-xl` with `font-semibold`.
   - **Body Text**: `text-sm` (0.875rem) / `text-base` (1rem, line-height 1.5–1.55 for long-form storefront descriptions).
   - **Labels / Captions**: `text-xs` (0.75rem) with `font-medium`. Monospace labels use `tracking-wider` and `uppercase`.

### 2.3. Border Radius Constraints

A core aesthetic pillar of the Hyundai E-commerce system is **the sharp-border design language**. The base border radius is set strictly to:
$$\text{Base Radius } (--radius) = 0.125\text{rem} \quad (2\text{px})$$

Components compute secondary radii programmatically in `globals.css` using Tailwind v4 inline definitions:

- **`--radius-sm`**: `calc(var(--radius) * 0.6)` (1.2px) -> Used for checkboxes, tiny visual toggles.
- **`--radius-md`**: `calc(var(--radius) * 0.8)` (1.6px) -> Used for select dropdowns, text inputs, buttons.
- **`--radius-lg`**: `var(--radius)` (2px) -> Used for cards, modal dialogs, sheet slide-outs.
- **`--radius-xl` / `--radius-2xl`**: Programmatically clamped to remain visual fits but must not exceed `0.25rem` (4px).
- **Exceptions**: Pills (e.g., standard badges, toggle tracks) use `rounded-full` to achieve a complete circular cap.

---

## 3. Component Standards

To prevent visual drift between apps, components must adhere to the exact Tailwind structure mapped below:

### 3.1. Buttons

Buttons drive all core transactions. They must maintain flat profiles with high-contrast active states.

- **Standard classes**: `inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 cursor-pointer`.
- **Hover and Active States**:
  - `variant="default"`: `bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]`.
  - `variant="outline"`: `border bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`.
- **Focus States**: Outlines are prohibited. Always use `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring`.
- **Loading State**: When a button is in a loading state, the text remains visible but is set to `opacity-30` or `opacity-0` (if centered spinner), and a custom micro-spinner `<Loader2 className="animate-spin size-4" />` is rendered. The width of the button must remain stable during loading to avoid layout shifts.

### 3.2. Cards

Cards house product information, dashboard stats, and layout blocks. They must remain structurally clean.

- **Borders & Shadows**: Cards must use a single-pixel border `border-border` and a soft shadow `shadow-sm`.
- **Structural Spacing**:
  - Main Padding: `p-6` (24px) or `p-4` (16px) on mobile viewports.
  - Heading Layout: Cards must divide content cleanly. The `CardHeader` uses a `@container/card-header grid items-start gap-2 px-6`.
- **Action Alignment**: Primary action buttons inside cards belong in `CardFooter` or on the right side of the heading area wrapped in a dedicated `CardAction` slot.
- **Micro-interactions**: Hoverable cards (such as product cards in Storefront) must use `hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`. Scales (`scale-105`) are forbidden to maintain layout containment.

### 3.3. Tables

Tables handle intensive administrative datasets. Density and readability are key.

- **Density**: Table rows (`tr`) must be set to `h-10` with cells (`td`) using `py-2 px-4`.
- **Borders & Headers**:
  - Table headers (`th`) use `bg-muted/30 text-foreground font-semibold border-b border-border uppercase text-xs tracking-wider`.
  - Rows use `border-b border-border/60 transition-colors hover:bg-muted/30`.
- **Alignment Rules**:
  - text columns: left-aligned (`text-left`).
  - numeric/price columns: right-aligned (`text-right`) and rendered in `font-mono`.
  - status/badge columns: center-aligned (`text-center`).
- **Selection / Active States**: Rows that are selected or active must apply `bg-muted/70`.

### 3.4. Forms

Form inputs must provide reliable, structured validation styling without shifting adjacent layouts.

- **Spacing**: Form groups must be separated by `space-y-4`. Field labels (`Label`) and descriptions (`FieldDescription`) must be separated by `space-y-1.5`.
- **Validation States (Zod/React Hook Form)**:
  - Error messages must use `text-sm font-normal text-destructive`.
  - Validated fields must never shift nearby elements. Always allocate a fixed height for error text or use a relative container (`h-5`) to host the error message cleanly.
  - Inputs with invalid values must change their borders immediately via `aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`.
- **Disabled States**: Inputs or labels marked `disabled` must use `disabled:cursor-not-allowed disabled:opacity-50`.

---

## 4. Shell & Layout Standards

### 4.1. Backdrop Blur & Overlay Conventions

Backdrop blurs must be applied to floating layers to build visual depth:

- **Standard Overlay Blur**: Use `backdrop-blur-md` combined with `bg-background/80` (or `bg-background/50` depending on theme constraints).
- **Z-Index Layering**:
  - Floating Sheets/Sidebars: `z-40`
  - Sticky Headers: `z-30`
  - Dialog / Modal Overlays: `z-50`
  - Toast Notifications: `z-100`

### 4.2. Admin Sidebar States

The admin application navigation uses a side-bar architecture. It maintains three states:

1. **Expanded**: Width `w-64` (256px). Fully displays icons, labels, and sub-menus.
2. **Collapsed**: Width `w-16` (64px). Displays icons only. Hovering over a collapsed item must trigger an instant tooltip containing the label.
3. **Mobile Drawer**: Hidden off-screen, animates to `w-64` from `left-0` with a full dark overlay (`bg-black/60 backdrop-blur-xs`).

- **Visual Rules**:
  - Sidebar container background is strictly bound to `--sidebar`.
  - Active item uses `bg-sidebar-accent text-sidebar-accent-foreground` with a 2px vertical highlight bar on the left edge (`before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary`).

### 4.3. Sticky Headers

Both Storefront and Admin headers must sit at the top of the viewport:

- **Header Height**: Fixed to `h-14` (56px) or `h-16` (64px).
- **Background & Bottom Border**: `sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/40 z-30`.
- **Transitions**: When scrolling, the header border-bottom opacity changes to provide a clean separation indicator.

### 4.4. Linear Overlay Gradients

To prevent muddy gray midpoints inside dark overlays, all gradients must be interpolated using **OKLCH color-stops** rather than default RGB stops.

- **Overlays on Product Images**: Use a vertical gradient from transparent to a dark slate with rich chroma:

  ```css
  background: linear-gradient(
    to bottom,
    oklch(0 0 0 / 0%) 0%,
    oklch(0.15 0.02 258 / 80%) 100%
  );
  ```

- **Interactive Accents**: Horizontal linear gradients for buttons or headers must transition across tight hues (e.g., Hue 258 to Hue 280) to preserve rich saturation.
