# Parallel Fan-Out Checkpoint Protocol

## Purpose

This document defines when and how the orchestrator should recommend parallel subagent fan-out
during RIPER-5 workflow. It provides a signal-based scoring system, two escalation tiers, five
lifecycle checkpoints, and a synthesis protocol for merging parallel outputs back into the main
flow.

## Complexity Scoring

Use a simple signal count to decide whether fan-out adds value. Each signal counts as 1.

Signals:

1. **Multi-package scope**: files touch 3+ workspace packages
2. **Schema/API/auth surface touched**: plan or research identifies changes to DB schema, public API contracts, or auth/identity flows
3. **3+ viable directions**: research or innovate surfaced 3+ meaningfully different approaches or investigation areas
4. **Phase program classification**: the work was classified as a phase program (3+ phases)
5. **User requests depth**: the user explicitly asks for depth ("go deep", "explore all options", "compare thoroughly")

Auto-skip rule: single-file or trivial changes always skip fan-out regardless of score.

Thresholds:

| Score | Label | Orchestrator action |
|-------|-------|---------------------|
| 0-1 | LOW | Skip fan-out. Do not mention it. |
| 2 | MEDIUM | Mention availability: "Parallel fan-out available for deeper coverage." |
| 3+ | HIGH | Recommend fan-out: "Recommend parallel fan-out -- [reason]." |

## Two Tiers

### Tier 1: Lightweight Parallel Subagents (Default)

- Spawns existing agents in parallel via the Agent tool
- Each agent works independently with no inter-agent communication
- Orchestrator collects all outputs and synthesizes them
- Use when: agents work on independent dimensions, directions, or review concerns

### Tier 2: vc-team (Escalation)

- Full Agent Teams with worktree isolation and inter-agent messaging
- Use when: agents need adversarial debate, cross-layer implementation touching the same files, or results that depend on each other
- Escalation trigger: if any parallel agent's output could conflict with or depend on another parallel agent's output, use vc-team instead of Tier 1

When in doubt, start with Tier 1. The orchestrator can always escalate to vc-team if the first
round reveals inter-dependencies.

## Checkpoints

Five checkpoints across the RIPER-5 lifecycle. Each checkpoint is a recommendation, not a gate.
The user can always accept or skip.

### Checkpoint 1: Research Fan-Out

**Fires:** after initial light research identifies 2+ distinct investigation directions.

**Trigger:** research-agent reports multiple distinct areas needing deep investigation (different
packages, different external APIs, different architectural options).

**Spawn type:** `research-agent` per direction.

**Recommendation wording:**

> Research identified N distinct directions: [list]. Recommend parallel deep-dive?
> [A] Single agent sequentially (faster, cheaper)
> [B] Fan out N research agents (deeper, ~Nx tokens)
> [C] Fan out via vc-team (agents can cross-reference findings)

**Per-agent task:** investigate one specific direction or area. Produce a structured findings
summary using the output format in the Synthesis Protocol section.

**Synthesis:** orchestrator merges findings into one research summary, noting agreements and
contradictions between directions.

### Checkpoint 2: Innovate Fan-Out

This is a lighter checkpoint -- mention-only by default, not a full recommendation.

Innovate is already a discussion phase. Parallel innovate agents produce overlapping brainstorm
outputs that are hard to synthesize meaningfully. The value comes from structured analysis of
individual approaches, not from parallel brainstorming.

**Fires:** only when 4+ viable approaches are identified AND the approaches span fundamentally
different architectural directions.

**Trigger:** innovate-agent lists 4+ approaches with meaningfully different tradeoff profiles.

**Spawn type:** `research-agent` per approach (not innovate-agent -- these agents do structured
analysis of a single approach's pros/cons/effort/risk, which is research work).

**Recommendation wording:**

> 4+ architectural directions identified. Fan out approach analysis?
> [A] Continue sequentially
> [B] Fan out analysis agents per approach

**Per-agent task:** flesh out one approach with pros, cons, effort estimate, and risk assessment.

**Synthesis:** orchestrator presents a comparison table. User picks the approach to carry forward.

### Checkpoint 3: Plan Validation Fan-Out

**Fires:** after plan-agent creates a plan file (before EXECUTE approval).

**Trigger:** complexity score >= MEDIUM (2+ signals).

**Spawn type:** `research-agent` per validation dimension (these agents read and assess the plan
against a domain -- that is analytical research, not planning or execution).

**Recommendation wording:**

> Plan created at [path]. Recommend parallel validation?
> [A] Skip to EXECUTE approval
> [B] Fan out 3-4 validation agents (infra fit, test coverage, breaking changes, security)

**Validation dimensions** (each is one parallel agent):

| Dimension | Focus | Context to attach |
|-----------|-------|-------------------|
| Infra/setup fit | Does this work with container/worker/proxy architecture? | `container/all-container.md`, `infra/all-infra.md` |
| Test coverage | Is the verification strategy realistic given test infra? | `tests/all-tests.md` |
| Breaking changes | API contracts, schemas, auth flows, public contract changes | Plan's public contracts and blast radius sections |
| Security surface | Quick STRIDE/OWASP scan | `vc-security` skill context |

**Per-agent output:** structured pass/fail/concern list against the plan.

**Synthesis:** orchestrator aggregates into a plan review summary. Any "fail" items must be
addressed before EXECUTE approval.

### Checkpoint 4: Phase-Program Validation Fan-Out

**Fires:** after umbrella + phase plans are created for a phase program.

**Trigger:** phase program has 3+ phases.

**Spawn type:** `research-agent` per phase (feasibility assessment is analytical research).

**Recommendation wording:**

> Phase program with N phases created. Recommend parallel feasibility check?
> [A] Skip
> [B] Fan out one agent per phase for feasibility assessment

**Per-agent task:** review one phase plan for feasibility, dependency correctness, and gate
realism.

**Synthesis:** orchestrator flags any phase with concerns. User decides whether to revise before
executing phase 1.

### Checkpoint 5: Post-Execute Review Fan-Out

**Fires:** after execute-agent reports DONE on non-trivial implementation.

**Trigger:** complexity score >= MEDIUM OR implementation touched 5+ files.

**Mutual exclusion:** if `/vc:team review` was already invoked for the same scope, skip this
checkpoint. Conversely, if this checkpoint was already run, do not also invoke `/vc:team review`
for the same scope.

**Recommendation wording:**

> Implementation complete. Recommend parallel review?
> [A] Skip to closeout
> [B] Fan out review agents (code quality, test gaps, security, API contracts)

**Review dimensions with spawn types:**

| Dimension | Agent type | Context to attach |
|-----------|-----------|-------------------|
| Code quality | `code-reviewer` | Changed files, plan checklist |
| Test gaps | `tester` | Changed files, `tests/all-tests.md` |
| Security | `research-agent` | Changed files, `vc-security` skill context |
| API contracts | `code-reviewer` | Plan's public contracts section |

**Per-agent output:** structured review with severity-rated findings.

**Synthesis:** orchestrator merges into one review summary. Critical findings block closeout.

## Synthesis Protocol

### Per-Agent Output Format

Each parallel agent must produce a structured summary:

```
Dimension: [name]
Status: PASS | CONCERN | FAIL
Findings:
- [finding 1]
- [finding 2]
Confidence: HIGH | MEDIUM | LOW
Notes: [optional context]
```

Agents should not produce free-form essays. Structured output is required for merge.

### Orchestrator Merge Rules

1. Collect all outputs.
2. Present agreements first, then contradictions and concerns.
3. Any "FAIL" finding from any agent must be surfaced to the user.
4. Contradictions between agents get noted explicitly -- the orchestrator does not resolve them silently.
5. Merged output is ephemeral (stays in conversation) unless the user asks for a durable report.

### Partial-Failure Handling

If a parallel agent returns BLOCKED or times out, the orchestrator proceeds with available results
and notes the gap. The gap note should name the missing dimension so the user can decide whether
to retry or proceed without it.

Example: "Security dimension agent timed out. Proceeding with code quality, test gaps, and API
contract results. Re-run security review? [Y/N]"

## Escalation Criteria

Use vc-team instead of lightweight subagents when:

- Parallel agents need to read each other's outputs before finishing
- The work involves adversarial debate (one agent argues for, another argues against)
- Cross-layer implementation where multiple agents touch overlapping files
- The user explicitly requests "team" or "debate" or "adversarial"

If none of these apply, use lightweight subagents. Start lightweight and escalate only when the
first round reveals inter-dependencies.

Cross-reference: see the "When to Use Agent Teams vs Subagents" table in
`.claude/skills/vc-team/SKILL.md` for the complementary decision matrix.
