# Orchestration Protocol

## Delegation Context

When spawning subagents, always include:

1. Work context path: the git root for the primary files being touched
2. Reports path: `{work_context}/process/general-plans/reports/`
3. Plans path: `{work_context}/process/general-plans/active/`
4. Feature: optional, but required when the work belongs to a feature-scoped folder

Feature override paths:

- Reports: `{work_context}/process/features/{feature}/reports/`
- Plans: `{work_context}/process/features/{feature}/active/`

Rule: if the current shell CWD differs from the real work context, pass the work-context paths, not the shell CWD.

## Feature Scope Detection

Before setting `Feature:` in a subagent prompt:

1. Check whether `process/features/{topic}/` already exists.
2. Check whether the request clearly belongs to an existing feature.
3. If the request is a new multi-phase product area or the user frames it as a substantial feature, create a feature folder first.
4. Otherwise default to `process/general-plans/active/`.

When creating a new feature folder:

```bash
mkdir -p process/features/{name}/{active,completed,backlog,reports,references}
```

Then update both `AGENTS.md` and `CLAUDE.md` so the current-features list stays in sync.

## Subagent Status Protocol

Subagents must end with one of:

- `DONE`
- `DONE_WITH_CONCERNS`
- `BLOCKED`
- `NEEDS_CONTEXT`

Controller handling:

- Never ignore `BLOCKED` or `NEEDS_CONTEXT`.
- Never retry the exact same blocked approach three times.
- Treat correctness concerns as action items before moving on.
- Treat observational concerns as notes unless they create real scope or correctness risk.

Recommended footer:

```md
**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
**Summary:** [1-2 sentence summary]
**Concerns/Blockers:** [if applicable]
```

## Context Isolation

Subagents receive only the context they need.

Rules:

1. Provide a fresh task summary, not raw chat history.
2. List exact files to read or modify.
3. If following a plan, pass the exact selected plan file path and relevant phase excerpt.
4. Keep orchestration and coordination state in the main session.
5. Mention relevant shared skills when they match the task.
6. Team/orchestration helpers such as `team` or FAST-mode flows may not bypass the same human approval gates required by the canonical RIPER workflow.
7. **Context routing depth:** `all-*.md` entrypoints are routers, not the full knowledge. Subagents MUST follow the routing tables in `all-*.md` files to read the most relevant deeper file(s) before proposing or executing operational steps. Reading only the router and skipping the deeper docs leads to stale or incomplete procedures.

Prompt template:

```text
Task: [specific task description]
Files to modify: [list]
Files to read for context: [list]
Acceptance criteria: [list]
Constraints: [list]
Plan reference: [exact plan file path or phase path]

Work context: [project path]
Feature: [feature-name]
Reports: [reports path]
Plans: [plans path]
Relevant skills: [comma-separated skill names]
```

## Sequential vs Parallel Use

Chain subagents when work depends on prior outputs:

- Research -> design -> plan
- Plan -> implementation -> testing -> review

Run in parallel only when scopes are independent and integration boundaries are clear.

## Large Project Phase Programs

When a task is a large program rather than a normal single-plan feature, use
`process/development-protocols/phase-programs.md`.

Signals:

- 3 or more dependent phases
- repeated validation gates between milestones
- multi-package or multi-runtime scope
- the user explicitly wants durable phase-by-phase progress that survives compaction

Controller rules for phase programs:

1. keep one umbrella plan plus one selected current phase
2. do not run the whole program as one giant EXECUTE pass
3. for each phase, require the 10-step loop:
   - research subagent
   - execution approval checkpoint
   - execute subagent
   - validate subagent
   - regression checkpoint (against previously verified overlapping surfaces)
   - regression-found workflow (conditional, if regression detected)
   - durable report/context update
   - commit checkpoint (vc-git-manager for execution changes)
   - inter-phase UPDATE PROCESS (archive phase, capture learnings)
   - move-on recommendation
4. after each phase, update reports and downstream phase plans before advancing
5. if the original program reaches a narrower scoped goal than the user's larger vision, split the
   remaining work into follow-up feature folders instead of stretching one project forever

## Intent Clarification

Before routing a new user request to a subagent, consult
`process/development-protocols/intent-clarification.md` for the tiered
clarification protocol.

The orchestrator scores the request's ambiguity (0-4 signals), selects a tier
(silent auto-route, inline summary, or full checkpoint), and resolves intent
in the main thread before delegating.

Auto-skip conditions (continuation phrases, mid-program, trivial fixes, explicit
mode commands, plan resumption) bypass clarification entirely.

## Parallel Fan-Out Checkpoints

At these phase transitions, consult `process/development-protocols/parallel-fan-out.md`:

1. After initial research identifies multiple directions
2. After innovate surfaces 4+ architectural approaches
3. After plan creation, before EXECUTE approval
4. After phase-program plan set creation
5. After non-trivial EXECUTE completion, before closeout

The fan-out protocol uses the same signal-count scoring as drift scoring. It recommends
parallel subagents when coverage benefit justifies the token cost, and escalates to vc-team
only when agents need inter-communication.

## Approval Gates Still Apply in Parallel

- `ENTER EXECUTE MODE` remains mandatory before substantial implementation work, even when `team` or FAST mode is used.
- A helper/orchestration skill may coordinate the work, but it does not become an alternate workflow owner.
- If the selected plan is a legacy multi-file structure, the orchestrator must still choose one primary plan file path and pass any supporting phase files explicitly.

## Post-EXECUTE Cleanup Checkpoint

After any non-trivial EXECUTE completion, the orchestrator must surface an explicit cleanup checkpoint before simply moving on.

The checkpoint should not be a vague "want cleanup?" prompt. It should include a short closeout
packet so the user can approve the next move quickly.

Required closeout packet:

1. selected plan path
2. closeout classification:
   - `Ready for UPDATE PROCESS archival`
   - `Keep in active/testing`
   - `Needs PLAN/UPDATE PROCESS reconciliation`
3. what was actually finished
4. what was verified and what remains unverified
5. what cleanup is already done versus still needed
6. the single best next valid state
   - `ENTER UPDATE PROCESS MODE`
   - keep current plan active for more validation
   - return to PLAN
   - move to the next explicit phase/follow-up after cleanup
7. commit-checkpoint recommendation
   - if the selected phase is validated and execution changes are present, explicitly recommend whether to invoke `vc-git-manager` before UPDATE PROCESS
   - if only process/plan/context artifacts remain, say that the commit checkpoint belongs after UPDATE PROCESS instead of before it
8. regression status (phase programs only)
   - list which previously verified surfaces were checked for regression
   - state whether all passed, or whether fixes were applied
   - if regression checking was skipped (e.g., first phase), state why

Required closeout choices:

1. `ENTER UPDATE PROCESS MODE` when the selected plan is explicitly classified `Ready for UPDATE PROCESS archival` or when context/process reconciliation is needed.
2. Keep the selected plan in `active/` when implementation is code-complete but testing, manual verification, or user confirmation is still pending.
3. Return to PLAN when material deviations mean the selected plan no longer matches the implemented reality.

Rules:

- Keep the selected plan file path explicit in the closeout summary.
- Do not auto-transition into UPDATE PROCESS.
- Do not auto-archive a plan without a user-visible action.
- Do automatically recommend the next valid state when it is clear from the selected plan and latest verification.
- Do explicitly recommend a commit checkpoint when a selected phase is well-tested and validated.
- If cleanup/context capture is the only remaining safe action, say that directly instead of ending with a generic summary.
- If cleanup was skipped and active-plan debt accumulates, recommend `vc-audit-plans` as a maintenance follow-up.

### Drift Signal Scoring

After building the closeout packet, score the UPDATE PROCESS urgency:

- Count: (a) total files touched, (b) any `.claude/`, `.codex/`, `README.md`, `AGENTS.md`, or `process/development-protocols/` changes, (c) session involved 3+ memory-worthy observations
- LOW (0-1 signals): include "UPDATE PROCESS available if you want." in closeout
- MEDIUM (2 signals): include "Recommend UPDATE PROCESS -- significant changes detected."
- HIGH (3+ signals): include "Strongly recommend UPDATE PROCESS -- harness/protocol files touched."

### Move-On Semantics

"Move on" does not include an automatic transition into UPDATE PROCESS. It still must not silently
archive work or widen scope.

It means the orchestrator should:

1. finish the closeout packet
2. recommend the next valid state explicitly
3. name the exact next plan or phase when one clear successor exists
4. avoid reopening broad research when the next step is already known from the current program structure

Examples:

- If the selected plan is verified and the next phase is explicit, recommend:
  `ENTER UPDATE PROCESS MODE, then continue with process/features/.../next-phase_PLAN_...md`
- If the selected plan is verified and implementation changes are still uncommitted, recommend:
  `Invoke vc-git-manager for a logical execution commit, then ENTER UPDATE PROCESS MODE for plan/context reconciliation`
- If the selected plan is code-complete but still testing, recommend:
  `Keep the plan active and continue validation on the same selected plan`
- If the selected plan exposed follow-up work outside its boundary, recommend:
  `ENTER UPDATE PROCESS MODE to capture the split and route the follow-up into its own plan`

## High-Risk Execution Handoff

When substantial implementation touches a high-risk class, the orchestrator should require a manual-first evidence handoff before treating the work as ready for finalize or review closure.

High-risk classes:

- auth or identity
- billing or credits
- schema/data migration or destructive data mutation
- public API contract changes
- deploy/runtime/container/proxy/gateway changes
- permission, secret, or trust-boundary logic

Controller rules:

1. Note the risk class in the task summary or selected plan context.
2. Route debugger/tester/code-reviewer with the same risk context when those roles are used.
3. Expect a reports `harness/` pack for high-risk work:
   - `risk-gate.json`
   - `context-snippets.json`
   - `verification.json`
   - `review-decision.json`
   - `adversarial-validation.json` when the path is high-risk or attack-sensitive
4. If the risk gate says `mustStopBeforeFinalize: true`, do not imply the work is fully proven until the pack exists and the reviewer decision is present.
5. Keep this manual-first. Do not invent a blocking hook or alternate workflow owner.

## Research First for Service-Shaped Features

When a user proposes a new server, daemon, sidecar, agent, worker, or background process, route to research first before innovate or plan.

Research must check:

- existing analogous services in `packages/api/src/infra/` or `apps/`
- current deploy and bundling patterns
- current env and secret wiring patterns

For VPS host or per-instance Docker operations specifically, inspect `WorkerNode` methods in `packages/api/src/infra/index.ts` before proposing a new host-side service. If a `WorkerNode` method already covers the operation, adding a new sidecar or host service is probably the wrong design.
