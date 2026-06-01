# UI/UX & Styling Guidelines

This document establishes the UI/UX design standards, component architecture, and styling rules used in Hyundai E-commerce storefront and admin applications.

## Theme & Aesthetic Direction

We aim for a highly premium, modern look that emphasizes industrial power, reliability, and precision.

- **Harmonious Palette**: Use a curated HSL color palette featuring deep industrial slates, electric blues, and warning/amber accents rather than raw basic colors.
- **Glassmorphism & Gradients**: Subtle background blur (`backdrop-blur`) and light gradients create visual depth.
- **Micro-animations**: Provide clean transitions (`transition-all duration-300`) on interactive states like hover, focus, and active clicks.

## Styling Approach

- **Tailwind CSS**: Tailwind CSS is the primary utility class framework. Follow standard Tailwind practices.
- **Vanilla CSS**: Used inside global or component-specific stylesheets for advanced styles, animations, or layout controls not easily modeled with Tailwind.
- **Shadcn/UI**: Leverage Shadcn UI as the base component library, wrapping primitives into highly polished, customized interfaces.

## Admin Page Layout Standards

- **Header Component**: When building forms or dashboard screens in `apps/admin`, do not place `<h2>` or page title headings inside the form or sub-components themselves. Use the shared `<Header>` component at the page level and pass the localized `title` and `description` to it.
- **Form Design**: Keep forms clean, responsive, and well-spaced. Use standard field components with clear validation error messages powered by Zod and Hook Form.
- **Internationalization (Next-Intl)**: Translation keys inside `messages/vi.json` and `messages/en.json` MUST remain flat when referenced dynamically. Avoid nesting keys deep inside objects as it breaks strict type checks.

## Key Design Patterns

- **Cards**: Cards should use subtle borders, soft shadows (`shadow-sm`), and a clean, hoverable transform scale or highlight.
- **Buttons**: Every action button must have a clear hover state, transition, and loading spinner state if triggered asynchronously.
- **CldImage**: For Cloudinary image rendering, use the customized `<CldImage>` component to ensure responsive, layout-shift-free, and optimized loading.
