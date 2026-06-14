---
version: alpha
name: Hyundai Classic
description: Premium, modern, industrial look emphasizing industrial power, high reliability, and premium precision.
colors:
  primary: "oklch(0.318 0.11 258)" # Deep electric indigo-blue
  secondary: "oklch(0.96 0.01 258)" # Light silver gray
  destructive: "oklch(0.6 0.2 25)" # Coral-red warning
  neutral: "oklch(1 0 0)" # Pure white page foundation
  surface: "oklch(1 0 0)" # Pure white card surfaces
  on-primary: "oklch(0.97 0.014 254.604)" # Ultra-light ice-blue text
typography:
  display:
    fontFamily: Inter
    fontSize: 4.5rem
    fontWeight: 700
    letterSpacing: "-0.035em"
  h1:
    fontFamily: Inter
    fontSize: 2.2rem
    fontWeight: 600
  body:
    fontFamily: Inter
    fontSize: 0.95rem
    lineHeight: 1.55
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.72rem
    letterSpacing: "0.02em"
rounded:
  sm: "calc(var(--radius) * 0.6)" # 1.2px
  md: "calc(var(--radius) * 0.8)" # 1.6px
  lg: "var(--radius)" # 2px (sharp-border base radius)
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

Hyundai Classic: premium industrial dark electric indigo-blue accents, high-contrast layouts, sharp-border design language (`--radius: 0.125rem` / 2px), and backdrop blurred floating layers.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`oklch(0.318 0.11 258)`):** Dark electric indigo-blue for interactive elements.
- **Secondary (`oklch(0.96 0.01 258)`):** Light grey-blue for secondary button/input backgrounds.
- **Destructive (`oklch(0.6 0.2 25)`):** Coral-red warning color.
- **Neutral (`oklch(1 0 0)`):** Pure white page foundation.

## Typography

- **display:** Inter 4.5rem (bold, tracking-tighter)
- **h1:** Inter 2.2rem (semibold)
- **body:** Inter 0.95rem (line-height 1.55)
- **label:** JetBrains Mono 0.72rem (medium, tracking-wider, uppercase)

## Do's and Don'ts

- **Do** respect the sharp border base radius of `2px` (`0.125rem`) for all cards and dialogs.
- **Do** use `font-mono` (JetBrains Mono) for prices, SKUs, and data labels.
- **Don't** exceed `4px` (`0.25rem`) for rounded borders unless it is a circular pill (like status badges).
- **Don't** use standard drop shadows; use clean borders or low-light overlays to define containers.
