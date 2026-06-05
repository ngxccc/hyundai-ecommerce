# Standard Skill Layout Specification

This document defines the strict layout specification for skill modules in this repository.

## 1. Directory Structure

A compliant skill must reside under `.claude/skills/[skill-name]/` (or `.omp/skills/[skill-name]/` for OMP-only skills) and conform to the following directory layout:

```
.claude/skills/[skill-name]/
├── SKILL.md                 # Entrypoint and quick reference (Mandatory)
├── AGENTS.md                # Full compiled documentation (Optional, for large skills)
├── references/              # Detailed sub-topic markdown files (Optional)
│   ├── _sections.md         # Impact ordering and category definitions (Optional)
│   └── [rule-name].md       # Specific rule files
└── scripts/                 # Executable scripts and utility tasks (Optional)
```

## 2. SKILL.md Frontmatter Rules

The YAML frontmatter block must be the very first content block in `SKILL.md`:

- **name**: MUST match the enclosing directory name exactly (e.g. directory `ag-tailwind` must have `name: ag-tailwind`).
- **description**: MUST explain both _what_ the skill is and _when_ the agent should load it. It must be between 24 and 1024 characters and contain at least one of the trigger words: `use`, `when`, `for`.
- **license**: Typically `MIT`.
- **argument-hint**: Human/Agent readable usage hints (e.g. `[args]`).

## 3. Mandatory Markdown Headings

The body of the `SKILL.md` file must contain these specific H2 headings (verbatim):

1. **`## When to Apply`**: Defines the clear trigger conditions and contexts under which this skill is relevant.
2. **`## How to Use`**: Explains how to invoke the skill, reference its subtopics, or run its scripts.
3. **`## References`**: Lists external specifications, official documentations, or links supporting the guidelines.

Any file missing these sections is considered non-compliant and will fail the integration build checks.
