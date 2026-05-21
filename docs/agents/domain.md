# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repo root. This is the single source of truth for the repo's domain language.
- `docs/adr/` for system-wide architectural decisions.

If any of these files don't exist, proceed silently. Don't flag their absence.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/ or apps/ or packages/
```

For this repo, treat the root `CONTEXT.md` as the single source of truth for terms used across:

- `apps/storefront`
- `apps/docs`
- shared packages under `packages/`

## Use the glossary's vocabulary

When output names a domain concept, use the term as defined in the root `CONTEXT.md`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
