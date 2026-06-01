# Phase Programs

## Purpose

Use this protocol for large, multi-phase efforts where one normal RIPER cycle is not enough.

Examples:

- test-infrastructure overhauls
- large migrations
- repo-wide platform hardening
- multi-surface feature programs
- architecture work that needs repeated validation and durable reporting

This protocol standardizes the stronger flow used in the Autonomous Testing Foundation:

1. design the overall program
2. split it into explicit phase plans
3. run a mini execution loop inside each phase
4. preserve learnings after every phase so progress survives compaction

## Kickoff Prompt

Agent behavior should already default to recommendation-first for large programs.

Use this prompt only when you want to make that expectation extra explicit at kickoff, or when you
want a reusable handoff prompt for another agent/session.

Important: kickoff should not jump straight into file creation. It should first recommend:

- whether this really should be a phase program
- the proposed feature folder
- the proposed umbrella plan
- the recommended phase sequence
- the recommended immediate next action

Only after that recommendation is reviewed should the agent create the actual plan artifacts.

```text
Build [PROJECT OR PROGRAM NAME] end-to-end using the repo's phase-program workflow.

Goal:
- [state the real end goal in one or two sentences]

Scope:
- Start by reading `process/context/all-context.md`
- Use `process/development-protocols/phase-programs.md`
- Treat this as a large multi-phase program, not a normal single-plan task
- First do the necessary research to understand the whole problem space
- First recommend:
  - whether this should be a standard complex plan or a phase program
  - the proposed feature folder
  - the umbrella/orchestration plan shape
  - the proposed phase sequence
  - the recommended immediate next action
- Present that recommendation clearly and stop for approval
- Only after approval, create or confirm:
  - one feature folder
  - one umbrella/orchestration plan
  - one direct phase plan per phase
- Make the phase boundaries explicit
- Define what each phase green check proves
- Separate foundation proof from later expansion if they are different scopes

Execution rule:
- Do not execute the whole program at once
- For each phase, follow the required 10-step loop:
  research -> approval -> execute -> validate -> regression check -> durable capture -> commit -> inter-phase UPDATE PROCESS -> move-on
- Re-research at the start of every phase before implementation
- After validation, run regression checks against previously verified surfaces that overlap with this phase's blast radius
- Commit execution changes via vc-git-manager before moving to the next phase
- Run inter-phase UPDATE PROCESS to archive the completed phase and capture learnings
- Do not mark a phase `✅ VERIFIED` without both phase evidence and regression evidence
- If blocked, document the blocker, safest next action, and update later phase plans/reports so the work survives compaction

Deliverables:
- initial recommendation on plan shape, sequencing, and next actions
- feature folder under `process/features/{feature}/`
- umbrella/orchestration plan
- phase plans
- durable reports and references as phases execute
- context updates when durable operational knowledge changes

Working instruction:
- Proceed phase by phase
- Do not stop at analysis if the selected phase is approved and unblocked
- Do not silently widen scope across phases
- Keep status honest and keep future work split cleanly
```

Use this as a starting point, then replace the placeholders with the real project, acceptance
boundary, and safety constraints.

### Practical Operator Kickoff

Shorter version for day-to-day reuse when the full template is overkill:

```text
Build [NAME] as a phase program per process/development-protocols/phase-programs.md.

Goal: [1-2 sentences]

First: recommend structure (feature folder, phases, immediate next action). Stop for approval.
Then: advance one phase at a time using the 10-step loop (research -> approval -> execute -> validate -> regression -> capture -> commit -> UPDATE PROCESS -> move-on).
```

## Kickoff Recommendation Format

Before creating any plan files for a new large program, present a short recommendation with:

1. **Program fit**
   - should this be `standard complex` or a `phase program`
   - why

2. **Recommended structure**
   - feature folder name
   - umbrella plan name
   - proposed phase list in order

3. **Recommended immediate next action**
   - what should happen now
   - what should wait until later

4. **Approval checkpoint**
   - ask whether to proceed with creating the plan artifacts

5. **Compressed session-goal block (printed in chat)**
   - once the umbrella plan and its Program Goal Charter exist, emit a compressed, copy-pasteable
     "session goal" block directly in chat (do NOT write it to a file)
   - this is the launch packet a user pastes to start an unattended, long-running session
   - keep it to roughly 8-12 lines with this shape:

   ```text
   SESSION GOAL: [PROGRAM NAME]
   Charter + umbrella plan: process/features/{feature}/active/{umbrella-plan}.md
   Autonomy: Run autonomously under this persistent goal. Execute phases on your own
   recommendation via the 10-step loop in phase-programs.md; report conflicts, errors, and
   learnings in the phase report (the report is the communication channel, not a question).
   Only pause for outward-facing / irreversible / costful / destructive actions
   (see feedback_autonomous_phase_execution.md).
   Hard stop conditions / safety constraints:
   - [hard safety constraint 1 from the charter]
   - [hard safety constraint 2 from the charter]
   Next phase: process/features/{feature}/active/{next-phase-plan}.md
   ```

   - the block must name the charter/umbrella plan path, state the autonomy rule (citing
     `feedback_autonomous_phase_execution.md`: execute phases on own recommendation under a
     persistent goal; only pause for outward-facing/irreversible/costful actions), and list the
     charter's hard stop-conditions/safety constraints verbatim
   - **Hard rule:** the session-goal block MUST be under 4000 characters total — it is pasted into a
     persistent `/goal` whose ceiling is ~4000 chars. If the program's safety constraints +
     definition-of-done won't compress under 4000 chars, summarize and reference the charter's plan
     path for the full detail rather than inlining everything.

### Autonomous Session-Goal Variant

This is an explicit opt-in variant. It does NOT weaken the default supervised loop; it only applies
when the user sets a persistent autonomous session-goal (e.g. a standing `/goal`).

When the user sets a persistent autonomous session-goal:

- the per-phase Execution Approval Checkpoint (10-step loop step 2) is treated as STANDING-GRANTED.
  The agent does not pause for approval between phases.
- the agent self-decides, executes, and reports learnings after each phase. On failure it diagnoses,
  writes a new plan/fix, and continues.
- the safety boundary REPLACES the approval gate: never take irreversible or costful actions
  (deploys, live/costful provider gates, billing, destructive schema/data ops). These are DEFERRED
  AND REPORTED — never executed and never paused-on.
- every step must stay rollback-able: commit each phase before the next, keep process/plan commits
  separate from execution commits, and prefer disposable targets.
- all other loop steps still apply unchanged: re-research at phase entry, validate, regression check,
  durable capture, commit, inter-phase UPDATE PROCESS, and honest phase status.

**Shared-runtime 2-tier policy:** direct interaction with the shared E2E container — including
rebuilding the image and recreating/restarting it via the project's dedicated managed script —
is normal, autonomous test work. It is NOT forbidden. Only irrecoverable persistent-state loss,
prod-state mutation, production image push/deploy, and live/costful gates are deferred-and-reported.
See your project's container/test context docs for the exact sanctioned commands. Do not re-list
those commands here.

- **🟢 GREEN — fully autonomous (the default):** direct shared-container interaction — exec,
  read logs, send messages, edit/write files, push secrets, probe health; run any documented
  script in your project's test context docs; rebuild the image and recreate/restart the shared
  container via the project's managed script to apply changes (named volume preserved);
  create/rebuild/recreate/remove E2E-owned disposable targets freely; reversible
  stop/start parking of the shared container, restored and verified leave-as-found.
- **🔴 RED — defer-and-report (never autonomous):** wipe/delete the shared container's named
  volume (irrecoverable data loss) or otherwise destroy persistent state without recovery;
  mutate production DB/storage/streaming state; push production images or deploy; run
  live/costful/provider-backed gates without per-lane approval.

This keeps the agent in an advisory role first, instead of prematurely locking the structure.

## When To Use A Phase Program

Prefer a phase program when any of these are true:

- the work naturally breaks into 3 or more dependent phases
- each phase needs its own validation gate before the next phase starts
- the work spans multiple packages, services, or runtime surfaces
- the user wants high-confidence progress with durable checkpoints
- repeated research is needed because new facts will emerge during execution

Do not use this protocol for a simple one-session feature or a small bug fix. Use the normal RIPER
flow instead.

## Core Model

Treat the large effort as two layers:

- **Program layer**: one umbrella project goal plus one orchestration plan
- **Phase layer**: many smaller plans, each with its own read -> execute -> validate -> report loop

The orchestrator does not run the whole program as one giant EXECUTE phase. It advances one phase at
a time.

## Required Artifacts

For a phase program, create or confirm:

1. a feature folder under `process/features/{feature}/`
2. one umbrella orchestration plan in that feature's `active/` folder, which **must include a
   Program Goal Charter** (see "Program Goal Charter" above)
3. one plan file per phase in that feature's `active/` folder
4. a `reports/` file for every executed phase
5. `references/` files for research that should survive future sessions

Recommended folder layout:

```text
process/features/{feature}/
  active/
    phase-00-..._PLAN_...
    phase-01-..._PLAN_...
    phase-02-..._PLAN_...
  reports/
    phase-01-..._REPORT_...
    phase-02-..._REPORT_...
  references/
    ...
  completed/
  backlog/
```

## Program Goal Charter

Every phase program must carry a **Program Goal Charter** as part of its umbrella orchestration plan.
The charter is the durable "north star" the user would otherwise hand-paste at the start of every
run. Generate it automatically when building the umbrella plan, fill in only program-specific content,
and keep it tight.

Required charter structure (placeholders are program-specific only):

```text
# [PROGRAM NAME] — Program Goal Charter

North star:
- [one sentence stating the real end goal]

Definition of done:
- [the concrete capabilities an unattended agent must be able to perform when the program is complete]

What "verified" means (program level):
- [the exact bar for promoting work to ✅ VERIFIED for this program — gate surface, evidence, coverage]

Scope tiers → phase mapping:
- Tier 1 [name] → Phases [n, n, ...]
- Tier 2 [name] → Phases [n, n, ...]
- Tier 3 [name] → Phases [n, n, ...]
- This program retires Tiers [1-N].

Explicitly out of scope (deferred tier):
- [the tier and items intentionally not addressed by this program]

Hard safety constraints (non-negotiable, per phase):
- [program-specific irreversible/destructive boundaries, e.g. "never mutate prod X"]
```

Important: execution discipline (the required 10-step per-phase loop, re-research at phase entry, and
honest phase status) is already governed by this protocol's existing sections. Do NOT re-paste that
prose into the charter — the charter is program-specific intent and safety only, not workflow rules.

A blank template plus a filled-in reference example live at
`process/development-protocols/references/program-goal-charter-template.md`.

## Program Setup Sequence

Before execution begins:

1. run research to understand the full problem space
2. create the umbrella plan
3. split the work into phase plans with explicit dependencies
4. define what each phase green check proves
5. define what remains out of scope even if the phase passes

Every phase plan should include:

- objective
- dependencies
- exact validation gates
- durable report target
- blockers that would justify `BLOCKED`
- explicit line between "foundation proof" and "future follow-up" when relevant

## The Required Per-Phase Loop

For every phase, run this loop:

1. **Research subagent**
   - reread the selected phase plan
   - reread the latest relevant reports, references, and context docs
   - inspect codebase drift since the plan was written
   - supplement the phase plan or create a research report if new facts matter

2. **Execution approval checkpoint**
   - summarize what changed since planning
   - identify risks, scope adjustments, and exact gates
   - get user approval before substantial implementation

3. **Execute subagent**
   - implement only the selected phase scope
   - stop if the work no longer matches the approved plan

4. **Validate subagent**
   - run the exact phase gates
   - inspect artifacts, logs, DB state, screenshots, traces, or runtime evidence as required
   - decide whether the phase is genuinely green, blocked, or only partially proven

5. **Regression checkpoint**
   - run the narrowest representative check against previously verified surfaces that overlap with this phase's blast radius
   - see "Regression Checkpoint Standard" below for scope selection and evidence format
   - if all regression checks pass, proceed to durable capture
   - if any regression is found, follow "Regression-Found Workflow" before advancing

6. **Regression-found workflow** (conditional)
   - only enters this step when step 5 finds a regression
   - classify, fix or route, revalidate, then return to step 5
   - see "Regression-Found Workflow" below for the full decision tree

7. **Durable capture**
   - update the phase report with commands, outcomes, deviations, and blockers
   - include regression check results (pass or fix-and-revalidate) in the report
   - update context docs if durable operational knowledge changed
   - update later phase plans if the new learning changes future work
   - if execution reveals a concrete missing downstream lane, create the new follow-up phase plan or backlog artifact instead of leaving the follow-up only in chat
   - keep the parent or umbrella plan in sync when follow-up routing or phase sequencing changes

8. **Commit checkpoint**
   - if the phase produced implementation changes, recommend `vc-git-manager` for a logical execution commit before continuing
   - keep process/plan/context artifact commits separate from execution commits
   - do not defer the commit to a later phase -- stale worktrees make regression checking unreliable

9. **Inter-phase UPDATE PROCESS**
   - route through UPDATE PROCESS to archive the completed phase plan and capture learnings
   - update context docs, reports, and downstream phase plans as needed
   - this step is mandatory between phases, not optional -- phase outputs must survive compaction

10. **Move-on recommendation**
    - name the exact next valid state after the phase closeout
    - if the next phase is already known, name the exact next phase plan path
    - if the current phase is not really green, keep the work on the same phase instead of pretending to advance

This loop is mandatory. Do not jump straight from phase plan to implementation without a fresh
research pass on large programs.

## Phase Status Rules

Use phase status honestly:

- `⏳ PLANNED` — not started
- `🔨 CODE DONE` — code exists but verification is incomplete
- `🧪 TESTING` — validation is actively in progress
- `✅ VERIFIED` — phase gates AND regression checks both pass with recorded evidence
- `🚧 BLOCKED` — progress is halted by a real blocker with a next action

A phase can only be `✅ VERIFIED` when both conditions are met:

1. the phase's own validation gates pass with the agreed evidence
2. regression checks against overlapping previously verified surfaces pass (or regressions were fixed and revalidated)

A phase can be `✅ VERIFIED` even when the overall program is not complete.

A program can be complete even when some future work was intentionally split into another feature
folder, as long as that boundary is documented clearly.

## Re-Research Rule

Large programs must re-research at phase entry.

Why:

- code drift may invalidate the old phase plan
- earlier phases often change later assumptions
- validation failures often expose better sequencing
- runtime and infra work can reveal hidden blockers

Minimum re-research inputs:

- selected phase plan
- latest phase report for the same phase, if any
- latest upstream phase reports that this phase depends on
- relevant `process/context/` docs
- recent git diff or commit history if the program spans many turns

## Durable Knowledge Rule

Do not let important learning live only in chat.

Write durable findings to:

- `reports/` for execution facts, commands, results, blockers, and decisions
- `references/` for research that should inform future phases
- `process/context/` for stable operational knowledge that all future agents should know

## Default Closeout Shape For Phase Programs

After each executed phase, the orchestrator should end with a short closeout packet:

1. selected phase plan path
2. phase status:
   - `✅ VERIFIED`
   - `Keep in active/testing`
   - `🚧 BLOCKED`
   - `Needs reconciliation`
3. what green actually proves
4. regression status: surfaces checked, results, any fixes applied
5. what remains outside this phase
6. whether UPDATE PROCESS is the next required step
7. the exact next phase or follow-up plan if known

This is how a phase program "moves on" without losing durable state or requiring the user to infer
the next step from a long transcript.

If a future phase would fail without the new information, the current phase is not done until that
information is written somewhere durable.

## Blocker Handling

If a phase is blocked:

1. write the blocker into the phase report
2. state exactly what is blocked
3. state what evidence proved the block
4. state the safest next action
5. continue only with unblocked prerequisite or follow-up work that does not violate the phase boundary

Do not force a green status by widening scope or using unsafe local-only shortcuts.

## Regression Checkpoint Standard

After validating the current phase's own gates (step 4), check that previously verified work still holds.

**Scope selection:**

- identify previously verified surfaces that overlap with this phase's blast radius
- run the narrowest representative check for each overlapping surface
- if the phase touches shared infrastructure (DB, container, proxy, auth), include at least one check from each earlier phase that depends on that infrastructure
- if no earlier phases are verified yet, skip this step

**Evidence format:**

Record regression results in the phase report as:

```
Regression: [surface] — [PASS | FIXED | BLOCKED]
Command: [exact command or manual step]
Result: [1-line outcome]
```

**What counts as a representative check:**

- a single test command that exercises the core path of the earlier phase
- a manual verification step that confirms the earlier phase's key artifact still works
- do not re-run the full validation suite of every earlier phase -- pick the narrowest check that would catch breakage

## Regression-Found Workflow

When a regression is detected in step 5:

**Classify the regression:**

| Type | Definition | Example |
|---|---|---|
| product breakage | previously working product behavior is broken | API endpoint returns 500, container fails to start |
| test breakage | previously passing test now fails | Vitest suite red, Playwright spec timeout |
| harness drift | process/agent/skill artifacts are inconsistent | context doc references a deleted file |
| stale command drift | a previously recorded command no longer works | pnpm script renamed, env var removed |

**Decision tree:**

1. **Fix in place** when the regression is small, the fix is obvious, and it does not widen the current phase scope. Fix, revalidate both the regression surface and the current phase gates, then continue.
2. **Revalidate only** when the regression is a false alarm (e.g., flaky test, transient infra). Record the finding and move on.
3. **Route as BLOCKED** when the regression is real but fixing it would materially widen scope. Create a follow-up artifact (backlog plan or blocker note in the phase report), mark the current phase `🚧 BLOCKED`, and stop.

Never paper over a regression. Always classify it and record it in the phase report, even if the fix is trivial.

## Safety Defaults

When designing phase validation or runtime targets:

- prefer disposable runtime targets (fresh containers, temp DB, isolated ports) over shared state that earlier phases depend on
- keep costful or manual gates explicit -- do not automate them silently
- never overclaim what a green check proves -- state exactly what it covers and what it does not
- if a phase requires destructive operations (DB reset, container rebuild, config wipe), isolate them so they cannot regress earlier work

## Foundation Versus Expansion

Many large programs should separate:

- **foundation proof**
- **full expansion**

Foundation means the system is safe, honest, and extendable.
Expansion means broad coverage across all product surfaces.

If those are different goals, split them into separate feature folders or follow-up plans instead of
keeping one giant active project alive forever.

## Relationship To RIPER-5

This protocol does not replace RIPER-5. It nests inside it.

- RIPER still governs research, planning, execute approval, and update-process behavior
- the phase program adds structure for repeating those behaviors phase by phase
- UPDATE PROCESS is especially important here because phase outputs must survive compaction

Think of it like this:

- normal RIPER: one feature, one plan, one execution cycle
- phase program RIPER: one big feature, many plans, many controlled execution cycles

## Orchestrator Responsibilities In A Phase Program

The orchestrator must:

- keep one selected current phase
- avoid mixing multiple phases into one execution pass
- ensure each phase has a report path before implementation begins
- ensure validation happens before status promotion
- move completed phase plans out of `active/` when the program reaches a real milestone or closeout
- split future work into a new feature folder when the original program has achieved its scoped goal

The orchestrator must not:

- let a worker infer the current phase from folder state alone
- keep coding across phases without updating reports or plans
- mark the entire program complete just because one foundation slice is green
