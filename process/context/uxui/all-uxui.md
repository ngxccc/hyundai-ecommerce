# UI/UX Context Index

This file is the canonical UI/UX context entrypoint for the Hyundai E-commerce monorepo.

## Scope

This group covers:

- Authorized design tokens, HSL/OKLCH color palettes, and visual aesthetic guidelines.
- Typography scale, weight constraints, and Monospace usage rules.
- Rigid border radius calculations (`--radius: 0.125rem`).
- Component standards (Buttons, Cards, Tables, Forms) for storefront/admin parity.
- Layout shells (backdrop blur, sidebar states, sticky headers, linear gradients).

It does not cover:

- Backend databases, API routes, or business domain logics.

## Read When

- Modifying or building UI components inside `packages/ui` or applications.
- Reviewing design quality gates before deploying code.

## Quick Routing

- Canonical Guidelines: `process/context/uxui/uiux.md`
- Design Presets (e.g. Raycast): `process/context/uxui/design-raycast.md`
- Brand Preset (Hyundai Classic): `process/context/uxui/design-hyundai.md`

## Update Triggers

- Modification of color presets or primary brand values.
- Re-architecting components in the shared UI library.
- Adapting new viewport, spacing, or typography scales.
