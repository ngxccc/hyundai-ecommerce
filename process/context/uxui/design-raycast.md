---
version: alpha
name: Raycast
description: Sleek dark chrome. Vibrant gradient accents.
colors:
  primary: "#F4F4F4"
  secondary: "#959BA3"
  tertiary: "#FF6363"
  neutral: "#0E0E12"
  surface: "#16161C"
  on-primary: "#0E0E12"
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
  sm: 8px
  md: 10px
  lg: 14px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

Raycast: productivity-launcher dark chrome, vibrant pink-to-red gradient accents, keyboard-first density.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#F4F4F4`):** Headlines and core text.
- **Secondary (`#959BA3`):** Borders, captions, and metadata.
- **Tertiary (`#FF6363`):** The sole driver for interaction. Reserve it.
- **Neutral (`#0E0E12`):** The page foundation.

## Typography

- **display:** Inter 4.5rem
- **h1:** Inter 2.2rem
- **body:** Inter 0.95rem
- **label:** JetBrains Mono 0.72rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
