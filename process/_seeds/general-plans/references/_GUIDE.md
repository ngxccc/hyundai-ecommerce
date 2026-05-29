# References

This folder holds research outputs and reference material for general and cross-cutting work. Feature-specific references live in `process/features/{feature}/references/`.

## What Goes Here

- Research outputs from RESEARCH mode (library comparisons, architecture studies)
- Audit results (context audits, security audits, etc.)
- Competitive analysis or external research
- Architecture decision records (ADRs)
- Technical spike results
- External documentation snapshots or summaries
- Design decisions and rationale documents

## Naming Convention

Use descriptive names: `{topic}-reference.md` or `{topic}-research_{dd-mm-yy}.md`

Examples:
- `auth-library-comparison-reference.md`
- `websocket-patterns-research_15-03-26.md`
- `security-audit-results_22-04-26.md`

## What Does Not Go Here

- Implementation plans (use `active/`)
- Execution reports (use `reports/`)
- Durable operational knowledge (use `process/context/`)
- Feature-specific references (use `process/features/{feature}/references/`)

## Lifecycle

- Created during RESEARCH mode or as a side output of other work
- Referenced by plans and reports as needed
- Kept as long as the information is still relevant
- Pruned when superseded by newer research
