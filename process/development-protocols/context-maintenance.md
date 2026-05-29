# Context Maintenance

## Purpose

`process/context/` is the durable shared project-knowledge layer for agents. It is not the same as feature planning or tool-specific memory.

Use it for stable operational knowledge such as:

- architecture and routing
- testing procedures
- debugging procedures
- deployment and infrastructure flows
- UI or workflow conventions

## Read Order

1. Read `process/context/all-context.md` first.
2. Load only the relevant root file or context-group entrypoint.
3. Follow that entrypoint into deeper docs only when needed.

## Context Groups

Context groups are durable knowledge domains, not feature folders.

Every group should have an `all-{group}.md` entrypoint that includes:

- scope
- read-when rules
- quick procedures
- source paths
- update triggers
- routing to deeper docs

## When to Create or Split a Group

Create or promote a context group when any of these are true:

- the topic has 3 or more durable docs
- a single doc grows beyond roughly 800 lines and contains separable subtopics
- multiple agents repeatedly need only one slice of a large context file

## Update Rules

- Update the owning context docs whenever code or workflow behavior changes what those docs describe.
- Update `process/context/all-context.md` whenever a new durable entrypoint is added, renamed, grouped, or removed.
- Move or split one group at a time so discovery changes stay reviewable.
- After context-organization changes, run the `vc-audit-context` skill or its validators.

## Relationship to Tool Memory

- Claude may also maintain its own project-memory layer under `~/.claude/projects/.../memory/`.
- Codex does not have a repo-local project-memory mirror in this repo.
- Durable shared knowledge that both systems should rely on belongs in `process/context/`.
