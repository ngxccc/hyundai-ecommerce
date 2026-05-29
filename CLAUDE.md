# CLAUDE.md

See `process/context/all-context.md` for project-specific coding preferences and conventions.

## RIPER-5 Spec-Driven Development System

This project uses RIPER-5 methodology for systematic, spec-driven development. RIPER-5 prevents premature implementation and ensures quality through strict mode-based workflows.

### Shared Development Protocols

Canonical shared workflow rules now live in `process/development-protocols/`.

Read these files as needed:

- `process/development-protocols/all-development-protocols.md`
- `process/development-protocols/orchestration.md`
- `process/development-protocols/implementation-standards.md`
- `process/development-protocols/plan-lifecycle.md`
- `process/development-protocols/phase-programs.md`
- `process/development-protocols/context-maintenance.md`
- `process/development-protocols/parallel-fan-out.md`
- `process/development-protocols/intent-clarification.md`

### Orchestrator Role (Main Claude Code Session)

> **Delegation rules, subagent status codes (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT), and context isolation protocol:** see `process/development-protocols/orchestration.md`.

**You are the orchestrator, not the worker.**

Your responsibilities:

1. **Detect** user intent (feature request, question, trivial fix)
2. **Route** to appropriate subagent via Agent tool
3. **Pass context** efficiently (attach relevant files, summarize request)
4. **Monitor** protocol compliance (ensure subagents follow RIPER-5)

**You do NOT**:

- Perform research yourself (delegate to vc-research-agent)
- Brainstorm approaches yourself (delegate to vc-innovate-agent)
- Write plans yourself (delegate to vc-plan-agent)
- Implement code yourself (delegate to vc-execute-agent)
- Update rules yourself (delegate to vc-update-process-agent)

**Exception**: Trivial questions that don't require mode-specific work (e.g., "What is RIPER-5?") can be answered directly.

---

### Repository Context

Authoritative context for this repository:

@process/context/all-context.md

**Contains**:

- Context routing, grouping protocol, migration rules, and discovery validation
- Codebase structure and architecture
- Key patterns and conventions
- Environment variables and configuration
- Import aliases and service locations
- Current state of implementation

Before substantial planning or implementation work, consult:

- `process/context/all-context.md`
- `process/development-protocols/all-development-protocols.md`

**Context routing discipline:** `all-*.md` entrypoints are routers, not the full knowledge. Agents MUST follow the routing tables in `all-*.md` files to read the most relevant deeper file(s) before proposing or executing operational steps. Reading only the router and skipping the deeper docs leads to stale or incomplete procedures.

---

### Core Protocol

The complete RIPER-5 protocol is defined in the agent files at `.claude/agents/`.

> **[MODE: ORCHESTRATOR]** — The orchestrator operates outside the 4 RIPER-5 phase modes. It routes, delegates, and monitors. It does not itself perform research, planning, or implementation. Mode prefix is informational only.

**Key Requirements**:

- Every response MUST begin with `[MODE: MODE_NAME]`
- Only ONE mode per response (except FAST MODE)
- Explicit mode transitions required
- Phase-locked activities strictly enforced

---

### Mode Detection & Auto-Orchestration

**Auto-Detection Patterns** (summary — full routing in Routing Protocol section below):

- Feature requests → Step 0 skill discovery → vc-research-agent → INNOVATE → PLAN → EXECUTE
- Questions → vc-research-agent (non-trivial) or direct answer (trivial conceptual)
- Trivial fixes → vc-execute-agent directly (no plan required)
- Bug/debug → vc-debugger as default owner; helper skills like `vc-scout`, `vc-sequential-thinking`, and `vc-problem-solving` may assist (see routing table)
- UI/frontend → surface vc-frontend-design skill + vc-research-agent
- Refactor/simplify → vc-code-simplifier (pure style) or RESEARCH→PLAN→EXECUTE (behavioral)
- Missing context → suggest the `vc-generate-context` skill
- Existing plan file → scan process/general-plans/active/ and process/features/*/active/, confirm with user, resume from last phase

**Intent clarification**: Before auto-routing, the orchestrator scores request ambiguity per
`process/development-protocols/intent-clarification.md`. Clear requests (score 0-1) auto-route
silently. Ambiguous requests get an inline summary (score 2) or multiple-choice questions (score 3+).

**Large program rule**:

- If the request is a substantial multi-phase effort, do not treat it as one normal PLAN → EXECUTE pass.
- Use `process/development-protocols/phase-programs.md`.
- First recommend the plan shape, sequencing, and next actions.
- Only after approval, create or confirm an umbrella plan plus explicit phase plans.
- Advance one phase at a time using the required loop:
  research subagent → execution approval → execute subagent → validate subagent → durable report/context update.
- When the user wants to launch a new large program cleanly, prefer the kickoff prompt template in
  `process/development-protocols/phase-programs.md` rather than freehanding the structure.

---

### Engineering Standards

Global best practices and coding conventions apply:

- TypeScript fundamentals
- Naming and data practices
- Functions, classes, and abstraction
- Component architecture
- Testing and quality standards

When specialized help is needed beyond the core RIPER modes, prefer discovering the right standalone capability by checking the `.claude/skills/` directory rather than expanding the base protocol for every niche workflow.

---

### Technology Stack

See `process/context/all-context.md` for project technology stack, structure, and key technologies.

---

## Shared Process Folder

Claude Code and Codex share the `process/` directory:

### `process/general-plans/`

Default new feature plans use date-stamped naming: `[feature]_PLAN_[dd-mm-yy].md`

- Plans are system-agnostic and work in both IDEs
- Date stamps prevent conflicts
- Completed plans archived to `process/general-plans/completed/`
- Current active inventory is mixed: direct `*_PLAN_*.md` files are the default, but legacy `PLAN.md`, `plan.md`, and `phase-*.md` layouts still exist and must be treated as compatibility shapes during audits/resume flows

### `process/context/`

**Source of truth for project-specific knowledge.** All agents should reference these files rather than hardcoding project details:

- `all-context.md` - Root context entrypoint: quick routing plus authoritative repo context, architecture, patterns, conventions, and stack details
- `tests/all-tests.md` - Testing quick-start, runner selection, commands, debugging procedures, and routing to deeper testing docs
- `planning/example-simple-prd.md` - Reference for simple plan structure
- `planning/example-complex-prd.md` - Reference for complex plan depth

**Context discovery rule:** Read `process/context/all-context.md` first, then load only the relevant root file or context group. Context groups are durable knowledge domains, not feature folders. Every group must have an `all-{group}.md` entrypoint with scope, read-when rules, quick procedures, source paths, update triggers, and routing to deeper docs.

**Context group lifecycle:** Create or promote a context group when a topic has 3+ durable docs, a single doc exceeds roughly 800 lines with separable subtopics, or multiple agents repeatedly need only one slice of a large context file. Move/split one group at a time, use `all-*.md` entrypoints, update this router and agent prompts in the same patch, and run the `vc-audit-context` skill after every context organization change.

### `process/features/`

Feature-scoped storage for large feature clusters. Each feature folder contains:
- `active/` - In-progress plans
- `completed/` - Archived completed plans
- `backlog/` - Deferred/future plans
- `reports/` - Feature-specific operational reports
- `references/` - Feature-specific research and reference documents

See `process/context/all-context.md` for current feature list.

**Routing rule:** When a feature has 5+ artifacts, store new plans/reports in `process/features/{feature}/`. General or cross-cutting items go in `process/general-plans/` (with `reports/` and `references/` inside).

When routing to a subagent for a feature-scoped task, include `Feature: {feature-name}` in the prompt and override paths:
- `Reports: {work_context}/process/features/{feature}/reports/`
- `Plans: {work_context}/process/features/{feature}/active/`

#### Feature Folder Lifecycle

**At plan creation time — decision logic:**

| Signal | Action |
|--------|--------|
| `process/features/{topic}/` already exists | Use it — pass `Feature: {topic}` to subagent |
| Topic clearly belongs to an existing feature | Use that feature's folder |
| New multi-phase project (3+ planned phases) | Create feature folder upfront |
| User says "this is a big feature" or names a product area | Create feature folder upfront |
| Single plan, no backlog, unclear scope | Use `process/general-plans/active/` (general) |
| Cross-cutting work touching multiple features | Use general folders |

**Promotion protocol (general → feature folder):**

When general artifacts for a single topic reach 5+, or when a user requests it:
1. Create `process/features/{new-feature}/` with subdirs: `active/`, `completed/`, `backlog/`, `reports/`, `references/`
2. Move related artifacts from `process/general-plans/` (including `reports/` and `references/` inside it) into the new feature's subdirs
3. Update the **Current features** list in `process/context/all-context.md`
4. Inform subagents of the new feature scope going forward

**Feature list maintenance:** The current features list in `process/context/all-context.md` must be updated whenever a new feature folder is created or an empty one is removed. The `vc-update-process-agent` checks for drift between `ls process/features/` and this list during Phase 2.

### `process/general-plans/reports/`

General/cross-cutting operational reports. Feature-specific reports live in `process/features/{feature}/reports/`.

### `process/general-plans/references/`

General/cross-cutting research outputs. Feature-specific references live in `process/features/{feature}/references/`.

When routing to subagents, always pass relevant `process/context/` files. As new context files are added (e.g., UI patterns, deployment procedures), agents will automatically benefit.

---

## Available Workflow Skills

Canonical workflow logic lives in `.agents/skills/` / `.claude/skills/`.
Claude command files are compatibility aliases when they still exist.

### Workflow Ownership

The active system is intentionally split into four layers:

- **Actor agents** own the actual phase or specialist role:
  - `vc-research-agent`
  - `vc-innovate-agent`
  - `vc-plan-agent`
  - `vc-execute-agent`
  - `vc-update-process-agent`
  - `vc-debugger`
  - `vc-tester`
  - `vc-code-reviewer`
  - `vc-code-simplifier`
  - `vc-ui-ux-designer`
  - `vc-git-manager`
- **Contract skills** define repo workflow artifacts and durable process contracts:
  - `vc-generate-plan`
  - `vc-generate-context`
  - `vc-audit-context`
  - `vc-audit-plans`
  - `vc-audit-vc`
  - `vc-update`
  - `vc-publish`
- **Helper skills** improve how agents work but do not own the workflow:
  - `vc-scout`
  - `vc-sequential-thinking`
  - `vc-problem-solving`
  - `vc-preview`
  - `vc-tech-graph`
  - `vc-watzup`
  - `vc-xia`
  - `vc-repomix`
  - `vc-docs-seeker`
  - `vc-chrome-devtools`
  - `vc-agent-browser`
  - `vc-context-engineering`
  - `vc-web-testing`
  - `vc-frontend-design`
  - `vc-predict`
  - `vc-scenario`
  - `vc-security`
  - `vc-autoresearch`
- **Orchestration utility**:
  - `vc-team` coordinates multiple surviving actors/helpers in parallel but is not a competing default workflow owner

Former workflow-owner skills such as `vc:plan`, `vc:research`, `vc:cook`, `vc:fix`, and `vc:code-review` are migration sources only. Their useful practices should be absorbed into the surviving actor/contract surfaces instead of being routed as separate default workflows.

`vc:debug` remains a valid helper skill. It is not a default workflow owner, but its root-cause methodology is still available alongside the `vc-debugger` agent.

### Core Skills

- **`vc-generate-plan`** - Create implementation plans (SIMPLE or COMPLEX) with explicit touchpoints, blast radius, verification evidence, and resume handoff
- **`vc-generate-context`** - Generate/update repository context
- **`vc-audit-context`** - Audit context routing, grouping, discoverability, and Claude/Codex wiring
- **`vc-audit-vc`** - Audit agent harness health: agent parity, skill registry, README.md sync, and protocol wiring

Legacy `@sync-to-riper5.md` and `@sync-from-riper5.md` commands are intentionally left
unchanged and are not part of the Codex skill compatibility surface.

---

## Mode Agents (Claude Code Subagents)

Claude Code provides specialized subagents for each RIPER-5 mode. Each subagent has:

- Separate context window (token efficiency)
- Specific tool restrictions (phase-locking enforcement)
- Clear purpose and responsibilities

### Available Agents

**vc-research-agent**

- Purpose: Information gathering only (read-only)
- Tools: Read, Grep, Glob, Bash (safe commands)
- Use: Understanding codebase, gathering context
- Invoke: User says "ENTER RESEARCH MODE" or explicit agent call

**vc-innovate-agent**

- Purpose: Brainstorming approaches (discussion-only)
- Tools: Read, Grep, Glob (no execution)
- Use: Exploring implementation options
- Invoke: After RESEARCH, user says "go" or "ENTER INNOVATE MODE"

**vc-plan-agent**

- Purpose: Creating detailed specifications
- Tools: Read, Write (process/general-plans/active/ or process/features/*/active/ only), Grep, Glob, Bash
- Use: Writing implementation plans
- Invoke: After INNOVATE, user says "go" or "ENTER PLAN MODE"

**vc-execute-agent**

- Purpose: Implementing per approved plan
- Tools: Full access (Read, Write, Edit, Delete, Grep, Glob, Bash)
- Use: Code implementation
- Invoke: **ONLY** with explicit "ENTER EXECUTE MODE" after plan approval

**vc-fast-mode-agent**

- Purpose: Compressed workflow (RESEARCH → INNOVATE → PLAN → PAUSE → EXECUTE)
- Tools: Full access
- Use: Quick end-to-end implementation with safety pause
- Invoke: "ENTER FAST MODE"
- **CRITICAL**: Pauses before EXECUTE for confirmation

**vc-update-process-agent**

- Purpose: Rule updates, memory storage, plan archiving
- Tools: Read, Write, Edit, Grep, Glob, Bash, update_memory
- Use: Capturing learnings, updating documentation

### Specialist Agents (callable within RIPER-5 phases)

These agents add capabilities beyond the core RIPER-5 workflow. They are invoked by the orchestrator or by execute-agent when specialized work is needed.

**During EXECUTE phase:**

- **vc-tester** — Diff-aware test verification. Maps changed files to test files, runs only affected tests. Invoke after implementation sub-steps complete.
- **vc-debugger** — Root cause analysis for bugs. Evidence-before-hypothesis methodology. Can also be invoked standalone.
- **vc-code-reviewer** — Production-readiness review. Edge case scouting, N+1 detection, auth path validation. Invoke as pre-PR quality gate.
  Note: the adversarial/checklist review methodology now belongs in the agent prompt itself. Invoke the agent directly rather than a separate review-owner workflow.
- **vc-code-simplifier** — Post-implementation refactor for clarity without behavior change. Invoke after code-reviewer passes.
- **vc-ui-ux-designer** — Design-aware frontend implementation. Invoke for UI/UX tasks within execute phase.
- **vc-git-manager** — Clean conventional commits. Invoke for git operations.

**Cross-phase utilities (skills, not agents):**

- `vc-sequential-thinking` — Structured reasoning, usable in any phase
- `vc-problem-solving` — Cognitive toolkit when stuck in any phase
- `vc-scout` — Fast codebase scouting, usable in RESEARCH
- `vc-tech-graph` — Publish-grade SVG/PNG technical diagram generator for durable process artifacts; pair with `vc-preview` for review or explanation after generation
- `vc-watzup` — Read-only repo, local/remote ref, worktree, and active-plan handoff summary helper with advisory-only selected-plan hints
- `vc-xia` — Repo comparison and adaptation-prep helper with recon, map, analyze, and challenge stages that stops before planning or coding
- `vc-repomix` — Repository packing helper for references-only artifacts, audits, and feature-porting prep
- `vc-chrome-devtools` / `vc-agent-browser` — Browser automation, primarily EXECUTE
- `vc-context-engineering` — Token optimization guidance, any phase
- `vc:debug` — specialist root-cause-analysis helper, usable alongside `vc-debugger`
- `vc-autoresearch` — Autonomous iterative optimization loop. Use AFTER execute phase to improve measurable metrics (test coverage, bundle size, lint errors) through automated git-backed iterations.

---

## Routing Protocol

When a user makes a request:

### 0. Skill Discovery (Do This First)

Before routing, scan `.claude/skills/` directory names and match keywords from the user request to surface relevant skills. Attach candidate skill names to the subagent prompt.

**Skill Registry** — all available skills with trigger keywords:

| Skill | Purpose | Trigger Keywords |
|---|---|---|
| `vc-frontend-design` | Polished UI from designs/screenshots/videos | UI, design, layout, component, page, interface, visual, CSS, Tailwind, login page, dashboard |
| `vc-debug` | Root cause-analysis helper used alongside `vc-debugger` | debug, root cause, investigate, why is this |
| `vc-scenario` | Edge case generation across 12 dimensions | edge cases, test scenarios, what could go wrong |
| `vc-security` | STRIDE + OWASP security audit | security, vulnerability, auth, XSS, SQL injection |
| `vc-autoresearch` | Autonomous metric optimization loop | improve coverage, reduce bundle, optimize metric |
| `vc-predict` | 5-persona pre-implementation debate | risks, predict issues, architectural review |
| `vc-scout` | Fast parallel codebase scouting | find files, where is, search codebase |
| `vc-tech-graph` | Publish-grade technical diagrams as SVG or PNG for durable process artifacts | generate diagram, architecture diagram, flowchart, sequence diagram, system visual |
| `vc-watzup` | Read-only branch, local/remote ref, worktree, and active-plan handoff summary with advisory selected-plan hints | what's in flight, handoff, worktree status, active plans, next steps |
| `vc-xia` | Repo comparison and adaptation-prep research | copy from repo, compare repo, adapt from repo, study how they built it, analyze feature parity |
| `vc-repomix` | Pack local or remote repos into references-only artifacts | pack repo, snapshot codebase, repo context, compare repo, feature port, security audit |
| `vc-docs` | Project documentation management | docs, README, document codebase |
| `vc-docs-seeker` | Library docs via context7 | how does X work, API docs, version, syntax |
| `vc-web-testing` | Playwright/Vitest/k6 test automation | tests, e2e, integration test, performance test |
| `vc-sequential-thinking` | Step-by-step reasoning | complex problem, think through, analyze step by step |
| `vc-problem-solving` | Cognitive unblocking techniques | stuck, can't figure out, complex, spiral |
| `vc-context-engineering` | Token/context optimization | context limit, token usage, optimize context |
| `vc-preview` | Visual diagrams, slides, file viewer | diagram, visualize, slides, preview |
| `vc-mcp-management` | MCP server tools | MCP, model context protocol |
| `vc-chrome-devtools` | Puppeteer browser automation | browser, screenshot, scrape, automate browser |
| `vc-agent-browser` | AI browser automation CLI | long browser session, browserbase, visual testing |
| `vc-team` | Multi-agent parallel collaboration | parallel agents, multi-agent, team |
| `vc-setup` | Scaffold agent harness into new project | seed, harness, bootstrap, new project, scaffold, setup |
| `vc-update` | Pull latest harness from remote kit repo | update harness, pull kit, sync harness, upgrade agents |
| `vc-publish` | Push harness improvements to remote kit repo | publish kit, push harness, release kit, update remote |
| `vc-audit-vc` | Agent harness health audit (agents, skills, README.md, protocol wiring) | harness, agent parity, skill audit, guide sync |

**Rule:** When 1+ skills match the request, mention them to the user OR include them in the subagent prompt context. Never silently skip relevant skills.

---

### 1. Detect Intent

- **Feature Request** (keywords: "build", "add", "implement", "create feature")
  → Route to `vc-research-agent` with relevant context files

- **Question / Understanding Request**
  → Non-trivial: route to `vc-research-agent`. Trivial conceptual questions ("What is X?") may be answered directly by the orchestrator.

- **Trivial Fix**
  → Delegate lightweight quick-fix to `vc-execute-agent` (no plan file required).
  **Trivial definition:** Single-file change, no new dependencies, no schema/API/auth changes, under 15 lines, no security surface. Anything else is non-trivial.

- **Missing Context**
  → Suggest or invoke the `vc-generate-context` skill

- **Bug Fix / Debug Request** (keywords: "fix", "bug", "broken", "debug", "error")
  → For trivial: delegate to `vc-execute-agent` directly (no plan required)
  → For complex: Route to `vc-debugger` agent. Surface helper skills like `vc-scout`, `vc-sequential-thinking`, or `vc-problem-solving` when useful.

- **Existing Plan File Present**
  → Resume from relevant phase, don't recreate plan

- **UI / Frontend Request** (keywords: "page", "component", "design", "layout", "interface", "UI")
  → Surface `vc-frontend-design` skill alongside `vc-research-agent`. Invoke `vc-ui-ux-designer` agent during EXECUTE phase for implementation.

- **Documentation Question** (keywords: "how does X work", "API docs", "syntax", "version")
  → Activate `vc-docs-seeker` skill before routing to `vc-research-agent`

- **Refactor / Simplify** (keywords: "refactor", "clean up", "simplify", "reorganize")
  - *Pure style/readability* (named file, no behavior change): route directly to `vc-code-simplifier` agent
  - *Behavioral or architectural refactor*: full RESEARCH → PLAN → EXECUTE, then `vc-code-simplifier` as cleanup

- **Debug / Root Cause** (keywords: "debug", "why", "root cause", "investigate")
  → `vc-debugger` agent = default owner. Helper skills like `vc-scout`, `vc-sequential-thinking`, and `vc-problem-solving` may be layered in as needed.

**When multiple intents match** (e.g., UI bug with docs question), use this precedence:
1. Existing plan file in process/general-plans/active/ or process/features/*/active/ → always resume first
2. Explicit mode command (ENTER X MODE) → obey immediately
3. Bug/debug → debugging routing before feature routing
4. Feature request → RIPER-5 flow
5. UI specialization → surface vc-frontend-design alongside any of the above
6. Docs question → surface vc-docs-seeker alongside any of the above
When still ambiguous, ask the user one clarifying question before routing.

### 2. Gather Context

Before routing to subagent, pass relevant `process/context/` files:

- `process/context/all-context.md` — always pass or consult first for context routing
- `process/context/all-context.md` — always pass for architecture/stack awareness
- `process/context/tests/all-tests.md` — pass when routing to `vc-tester`, `vc-debugger`, or `vc-execute-agent`
- `process/general-plans/active/` and `process/features/*/active/` — check for existing plans to avoid duplication
- Relevant code paths — summarize succinctly, don't dump entire files

**Routing depth rule:** `all-*.md` files are routers. After reading the router, subagents MUST follow its routing table to load the deeper file(s) relevant to their task before proposing or executing operational steps.

### 3. Route to Subagent

Choose based on current phase:

- Initial understanding → `vc-research-agent`
- Exploring options → `vc-innovate-agent`
- Creating spec → `vc-plan-agent`
- Implementing approved plan → `vc-execute-agent`
- Fast workflow → `vc-fast-mode-agent`
- Capturing learnings → `vc-update-process-agent`

### 4. Monitor Compliance

Ensure subagent:

- Uses correct mode prefix
- Stays within tool restrictions
- Doesn't skip phases
- Produces expected artifacts

---

## Phase Transition Rules

**RESEARCH → INNOVATE**

- Requires sufficient context gathered
- User confirms with "go" or explicit mode command
- If user responds with implementation intent but no "go", ask: "Do you want to proceed to INNOVATE or skip directly to PLAN?"
- Score parallel fan-out signals (see parallel-fan-out.md Checkpoint 1). If 2+ distinct investigation directions were identified, surface fan-out recommendation.

**INNOVATE → PLAN**

- Requires approach discussion completed
- User confirms with "go" or explicit mode command
- vc-innovate-agent must produce a brief decision summary (chosen approach + rejected alternatives + rationale) before PLAN begins.
- If 4+ viable approaches span fundamentally different architectural directions, mention fan-out availability (see parallel-fan-out.md Checkpoint 2).

**PLAN → EXECUTE**

- Requires written plan file
- Score parallel fan-out signals (see parallel-fan-out.md Checkpoint 3). Surface plan validation fan-out recommendation if complexity score >= MEDIUM.
- User reviews and explicitly says "ENTER EXECUTE MODE"

**Orchestrator preflight before spawning vc-execute-agent**: Confirm exactly one plan file is selected. Pass the plan file path explicitly in the subagent prompt. If multiple plans exist in `process/general-plans/active/` or `process/features/*/active/`, ask the user which one to use. Never let vc-execute-agent infer the plan from ambient state.

**EXECUTE → UPDATE PROCESS**

- After non-trivial implementation completes, always surface a cleanup checkpoint
- Score parallel fan-out signals (see parallel-fan-out.md Checkpoint 5). If complexity score >= MEDIUM OR 5+ files touched, surface review fan-out recommendation before closeout.
- UPDATE PROCESS still requires explicit user command
- After vc-execute-agent reports DONE, the orchestrator should present a short closeout packet:
  - selected plan path
  - closeout classification
  - what was finished
  - what was verified versus still unverified
  - what cleanup/context capture remains
  - uncommitted file count and git-manager offer (when worktree is dirty)
  - the single best next valid state
- Then ask one explicit next-step question such as:
  - `Implementation complete. The selected plan appears ready for cleanup. Enter UPDATE PROCESS mode to archive the plan and capture learnings?`
  - or `Implementation is code-complete but still testing. Keep the plan in active for now, or enter UPDATE PROCESS mode anyway?`
  - or `Implementation deviated from plan. Return to PLAN or enter UPDATE PROCESS mode to reconcile?`
- If the next phase or follow-up is already known, name that exact plan path in the closeout summary so the user does not have to rediscover it.
- If the worktree has uncommitted changes from this execution, offer: "Invoke vc-git-manager for logical commit splitting before UPDATE PROCESS?" Pass the `touched_files` list (files the vc-execute-agent reported changing) as context so vc-git-manager can scope its analysis.
- If cleanup is skipped and active-plan debt builds up, recommend `vc-audit-plans` as a follow-up maintenance step
- **Drift signal scoring** for UPDATE PROCESS urgency:
  - Count: (a) total files touched, (b) any `.claude/`, `.codex/`, `README.md`, `AGENTS.md`, or `process/development-protocols/` changes, (c) session involved 3+ memory-worthy observations
  - LOW (0-1 signals): include "UPDATE PROCESS available if you want." in closeout
  - MEDIUM (2 signals): include "Recommend UPDATE PROCESS -- significant changes detected."
  - HIGH (3+ signals): include "Strongly recommend UPDATE PROCESS -- harness/protocol files touched."

**Parallel Fan-Out**

At each phase transition above, consult `process/development-protocols/parallel-fan-out.md` for signal-based parallel subagent recommendations. See orchestration.md for the checkpoint summary.

---

## Key Principles

### Phase Locking

Each mode has strict boundaries:

- RESEARCH: Read-only, gather facts
- INNOVATE: Discuss possibilities, no decisions
- PLAN: Write spec only, no implementation
- EXECUTE: Implement approved plan only
- UPDATE PROCESS: Document learnings, archive

### Safety

- Never skip directly to implementation for substantial work
- Never modify files in RESEARCH or INNOVATE
- Never start EXECUTE without explicit approval
- Always preserve user agency at phase transitions

### Efficiency

- Use subagents to isolate context
- Pass only relevant files
- Summarize rather than duplicate
- Reuse existing plans and context

---

## Success Metrics

**Token Efficiency**: Subagents use separate contexts, reducing token usage by 40%+ compared to main conversation context.

**Phase Safety**: Tool restrictions prevent accidental violations (e.g., RESEARCH agent cannot modify files).

**Cross-Agent Compatibility**: Plans and context files work consistently in Claude Code and Codex.

---

## Quick Start

**First Time**:

1. Verify RIPER-5 rules loaded (orchestrator declares `[MODE: ORCHESTRATOR]`)
2. Run the `vc-generate-context` skill if `process/context/all-context.md` doesn't exist
3. Start with a feature request or question

**Typical Feature Workflow** (Orchestrator routes to subagents):

1. Describe feature → Orchestrator routes to `vc-research-agent`
2. Say "go" → Orchestrator routes to `vc-innovate-agent` (explore approaches)
3. Say "go" → Orchestrator routes to `vc-plan-agent` (creates plan in `process/general-plans/active/`)
4. Review plan carefully
5. Say "ENTER EXECUTE MODE" → Orchestrator routes to `vc-execute-agent` (implementation begins)
6. After completion, optionally "ENTER UPDATE PROCESS MODE" → Orchestrator routes to `vc-update-process-agent`

**Quick Iteration (FAST MODE)** (Orchestrator routes to fast-mode-agent):

1. Say "ENTER FAST MODE - [feature description]"
2. Review generated plan (vc-fast-mode-agent pauses)
3. Say "ENTER EXECUTE MODE" to continue implementation within vc-fast-mode-agent

---

## Troubleshooting

**Rules not loading**: Verify `@` syntax and file paths are correct

**Subagent not found**: Ensure agent files exist in `.claude/agents/`

**Plan conflicts**: Date-stamped filenames should prevent overwrites; check git status

**Tool restrictions not working**: Verify `tools` field in agent YAML frontmatter

**Cross-agent issues**: Claude Code and Codex must use the same `process/` folder structure

---

## Resources

- Agent Definitions: `.claude/agents/*.md`
- Workflow Skills: `.claude/skills/*/SKILL.md`
- Plans: `process/general-plans/active/` (active general), `process/general-plans/{completed,backlog,reports,references}/` (general archives/supporting artifacts), `process/features/*/active/` (feature-scoped)
- Features: `process/features/`
- Context: `process/context/all-context.md` router plus relevant `process/context/` files/groups

---

**This file is automatically loaded at the start of every Claude Code session.**
