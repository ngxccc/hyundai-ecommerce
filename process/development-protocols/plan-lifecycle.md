# Plan Lifecycle

## Canonical Plan Surface

Default active-plan locations:

- `process/general-plans/active/`
- `process/features/{feature}/active/`

Default naming for new direct plan files:

- `[feature]_PLAN_[dd-mm-yy].md`

The active inventory is intentionally mixed right now. Treat these as compatibility shapes during scans and resume flows:

- direct `*_PLAN_*.md` files
- legacy `PLAN.md`
- legacy `plan.md`
- legacy `phase-*.md` siblings or plan folders

New work should prefer direct `*_PLAN_*.md` files unless there is a deliberate reason to continue an existing legacy structure.

## Feature Folder Routing

Use `process/features/{feature}/` when:

- the feature folder already exists
- the topic clearly belongs to an existing feature
- the work is a new multi-phase project
- the user frames it as a substantial product area

Otherwise use `process/general-plans/`.

If the work is a large multi-phase program, also apply `phase-programs.md`:

- create one umbrella orchestration plan
- create one explicit plan file per phase
- expect each phase to have its own report and validation checkpoint

Feature folder structure:

- `active/`
- `completed/`
- `backlog/`
- `reports/`
- `references/`

### Closed Feature State

Some mature feature folders may intentionally stop carrying live `active/` work for a period.

- This is allowed when the feature is effectively complete or intentionally frozen.
- The folder should still keep `completed/`, `backlog/`, `reports/`, and `references/` as needed.
- Document the closed/no-active state in a local status file such as `README.md` when doing so avoids routing confusion.
- Orchestrators must not assume every existing feature folder currently has active plan files.

## Resume and Execute Handoff

- Always scan both active-plan surfaces before creating a new plan.
- If overlapping active plans exist, update or resume them instead of duplicating work.
- Before EXECUTE, confirm exactly one selected plan file path.
- Pass that exact plan file path into the execute handoff.
- Never rely on ambient active-plan state alone when multiple active plan artifacts exist.

### Legacy Multi-File Handoff Rule

When the active work uses a legacy structure such as `PLAN.md` plus `phase-*.md` files:

- choose one primary plan file path as the execute anchor
- pass supporting phase files explicitly as additional context
- do not tell the worker to infer the plan from a folder name alone
- prefer normalizing to a direct `*_PLAN_*.md` file only when the user has approved cleanup or the ongoing work naturally justifies it
- treat missing execute-anchor or supporting-file notes as compatibility warnings first, not blockers, unless a later stricter migration is explicitly approved

## Stronger Direct-Plan Contract

For new or newly touched direct `*_PLAN_*.md` files, include:

- `Touchpoints`
- `Public Contracts`
- `Blast Radius`
- `Verification Evidence`
- `Resume and Execution Handoff`

Use Markdown-structured sections, not a second machine-only schema.

## Reports and References

- Cross-cutting reports go in `process/general-plans/reports/`.
- Cross-cutting research goes in `process/general-plans/references/`.
- Feature-specific reports and references belong in the feature folder.

## Backlog

- Cross-cutting deferred work belongs in `process/general-plans/backlog/`.
- Feature-specific deferred work belongs in `process/features/{feature}/backlog/`.
- Use backlog for actionable follow-up work, not finished reports or durable reference material.
- Use references for research outputs that inform future decisions.
- Move an item from `active/` to backlog when it is intentionally deferred but still actionable.

## Archiving

- Completed general plans move to `process/general-plans/completed/`.
- Completed feature plans move to `process/features/{feature}/completed/`.
- Preserve historical artifacts unless the user explicitly asks for normalization or cleanup.

### Archive-Readiness Semantics

Do not treat every successful code change as immediately archive-ready.

Use these states:

- **Ready to archive**
  - the selected plan path still matches the implemented work
  - required verification evidence exists
  - no material deviations remain unresolved
  - the user has confirmed or approved cleanup
- **Keep in active / testing**
  - implementation is substantially complete
  - but testing, manual verification, or explicit user confirmation is still pending
- **Needs reconciliation before archival**
  - material deviations from the selected plan were required
  - context/process updates are needed before the plan can be archived
  - the work should route through UPDATE PROCESS or back to PLAN first

For non-trivial work, prefer routing archive decisions through UPDATE PROCESS so context updates, lessons learned, and selected-plan archival happen together.

## Closeout Packet And Move-On Rule

For non-trivial work, a selected plan should not end with only "done" or "still testing."

The closeout summary should always state:

- the selected plan path
- archive-readiness classification
- what cleanup/context capture is still required
- the next valid state

Allowed next valid states:

- `ENTER UPDATE PROCESS MODE` for archival or durable reconciliation when the selected plan is archive-ready or context capture is the next safe step
- keep the selected plan in `active/` for more validation
- return to PLAN because implementation and plan reality diverged
- move to the next explicit phase or follow-up plan after cleanup is complete

For validated phase work, also classify the commit checkpoint explicitly:

- **Execution commit recommended before UPDATE PROCESS**
  - implementation or test changes from the selected phase are well-tested and ready for a logical code/test commit
  - later UPDATE PROCESS edits are expected to touch `process/`, `.claude/`, `.codex/`, or `AGENTS.md` separately
- **Process commit belongs after UPDATE PROCESS**
  - the remaining changes are primarily plan, report, context, or harness-governance artifacts
  - splitting execution and process commits will keep the history easier to review and resume

When a selected phase exposes a concrete missing downstream lane, UPDATE PROCESS should create or route the follow-up artifact explicitly:

- create a new direct phase plan when the next lane is now well-defined and belongs in the same phase program
- create a new follow-up feature folder or backlog artifact when the new lane is out of scope for the current feature goal
- update the umbrella or parent plan so the next plan path is discoverable without manual chat context

When the next phase is already known from an umbrella plan or program sequence, say so explicitly.
This reduces handoff drift and avoids reopening solved routing questions.

Do not silently move files between `active/`, `completed/`, and `backlog/` outside a user-visible
cleanup/update step. The system should feel automatic in recommendation quality, not hidden in mode
transitions or file mutation.
