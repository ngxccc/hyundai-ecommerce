---
name: ag-skill-standard
description: "Rules, standards, and validation guides for writing and structure of skills. Use when creating or updating any skill files to ensure pattern compliance."
license: MIT
argument-hint: "[no-args]"
metadata:
  author: Team
  version: "1.0.0"
---

# Skill Structural Pattern Standard

This skill establishes and enforces the canonical structural pattern for all skills in the `agent-skills-kit`. It includes automated checks to verify that every skill follows the same layout, frontmatter, and section conventions.

## When to Apply

Reference and run these guidelines when:

- Creating a new skill folder under `.claude/skills/` or `.omp/skills/`.
- Updating the structure or frontmatter of existing skills.
- Performing quality assurance audits on the skill catalog.

## How to Use

To verify if skills comply with this standard, run:

```bash
bun run .claude/skills/ag-skill-standard/scripts/validate-skill-patterns.mjs
```

If any skill violates the required frontmatter or heading pattern, the script exits with code `1` and raises an error detailing the issue.

## References

- [Standard Skill Layout Specification](references/skill-layout.md)
