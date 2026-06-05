# CLAUDE.md

## CRITICAL DIRECTIVE: ALWAYS INITIALIZE & FOLLOW TODO

- **Mandatory Todo Initialization**: For any non-trivial or multi-step task, you MUST immediately initialize a phased todo list using the `todo_write` tool, or extract the checklist/todos from the active plan file.
- **Strict Comply & Transition**: Follow the todo list item-by-item. Mark tasks as completed (`done`) immediately after completing them, and transition to the next task in the same turn.
- **No Bypass**: Never start editing files, researching, or running commands without first establishing the todo list. This rule takes absolute precedence over all other protocols.

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

Reference docs (harness methodology, not project-specific):

- `process/development-protocols/references/example-simple-prd.md` - Reference for simple plan structure
- `process/development-protocols/references/example-complex-prd.md` - Reference for complex plan depth
- `process/development-protocols/references/program-goal-charter-template.md` - Program Goal Charter template for phase programs

### Orchestrator Role (Main Claude Code Session)

> **Delegation rules, subagent status codes (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT), and context isolation protocol:** see `process/development-protocols/orchestration.md`.

**You are the orchestrator, not the worker.**

Your responsibilities:

1. **Detect** user intent (feature request, question, trivial fix)
2. **Route** to appropriate subagent via Agent tool
3. **Pass context** efficiently (attach relevant files, summarize request)
4. **Monitor** protocol compliance (ensure subagents follow RIPER-5)

**You do NOT**:

- Perform research yourself (delegate to ag-research-agent)
- Brainstorm approaches yourself (delegate to ag-innovate-agent)
- Write plans yourself (delegate to ag-plan-agent)
- Implement code yourself (delegate to ag-execute-agent)
- Update rules yourself (delegate to ag-update-process-agent)

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

- Feature requests → Step 0 skill discovery → ag-research-agent → INNOVATE → PLAN → EXECUTE
- Questions → ag-research-agent (non-trivial) or direct answer (trivial conceptual)
- Trivial fixes → ag-execute-agent directly (no plan required)
- Bug/debug → ag-debugger as default owner; helper skills like `ag-scout`, `ag-sequential-thinking`, and `ag-problem-solving` may assist (see routing table)
- UI/frontend → surface ag-frontend-design skill + ag-research-agent
- Refactor/simplify → ag-code-simplifier (pure style) or RESEARCH→PLAN→EXECUTE (behavioral)
- Missing context → suggest the `ag-generate-context` skill
- Existing plan file → scan process/general-plans/active/ and process/features/\*/active/, confirm with user, resume from last phase

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
- Markdown formatting: Always format markdown files using Prettier.

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

**Context discovery rule:** Read `process/context/all-context.md` first, then load only the relevant root file or context group. Context groups are durable knowledge domains, not feature folders. Every group must have an `all-{group}.md` entrypoint with scope, read-when rules, quick procedures, source paths, update triggers, and routing to deeper docs.

**Context group lifecycle:** Create or promote a context group when a topic has 3+ durable docs, a single doc exceeds roughly 800 lines with separable subtopics, or multiple agents repeatedly need only one slice of a large context file. Move/split one group at a time, use `all-*.md` entrypoints, update this router and agent prompts in the same patch, and run the `ag-audit-context` skill after every context organization change.

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

| Signal                                                    | Action                                        |
| --------------------------------------------------------- | --------------------------------------------- |
| `process/features/{topic}/` already exists                | Use it — pass `Feature: {topic}` to subagent  |
| Topic clearly belongs to an existing feature              | Use that feature's folder                     |
| New multi-phase project (3+ planned phases)               | Create feature folder upfront                 |
| User says "this is a big feature" or names a product area | Create feature folder upfront                 |
| Single plan, no backlog, unclear scope                    | Use `process/general-plans/active/` (general) |
| Cross-cutting work touching multiple features             | Use general folders                           |

**Promotion protocol (general → feature folder):**

When general artifacts for a single topic reach 5+, or when a user requests it:

1. Create `process/features/{new-feature}/` with subdirs: `active/`, `completed/`, `backlog/`, `reports/`, `references/`
2. Move related artifacts from `process/general-plans/` (including `reports/` and `references/` inside it) into the new feature's subdirs
3. Update the **Current features** list in `process/context/all-context.md`
4. Inform subagents of the new feature scope going forward

**Feature list maintenance:** The current features list in `process/context/all-context.md` must be updated whenever a new feature folder is created or an empty one is removed. The `ag-update-process-agent` checks for drift between `ls process/features/` and this list during Phase 2.

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
  - `ag-research-agent`
  - `ag-innovate-agent`
  - `ag-plan-agent`
  - `ag-execute-agent`
  - `ag-update-process-agent`
  - `ag-debugger`
  - `ag-tester`
  - `ag-code-reviewer`
  - `ag-code-simplifier`
  - `ag-ui-ux-designer`
  - `ag-git-manager`
- **Contract skills** define repo workflow artifacts and durable process contracts:
  - `ag-generate-plan`
  - `ag-generate-context`
  - `ag-audit-context`
  - `ag-audit-plans`
  - `ag-audit-ag`
  - `ag-update`
  - `ag-publish`
- **Helper skills** improve how agents work but do not own the workflow:
  - `ag-scout`
  - `ag-sequential-thinking`
  - `ag-problem-solving`
  - `ag-preview`
  - `ag-tech-graph`
  - `ag-watzup`
  - `ag-xia`
  - `ag-repomix`
  - `ag-docs-seeker`
  - `ag-chrome-devtools`
  - `ag-agent-browser`
  - `ag-context-engineering`
  - `ag-web-testing`
  - `ag-frontend-design`
  - `ag-predict`
  - `ag-scenario`
  - `ag-security`
  - `ag-autoresearch`
  - `ag-zod`
- **Orchestration utility**:
  - `ag-team` coordinates multiple surviving actors/helpers in parallel but is not a competing default workflow owner

Former workflow-owner skills such as `ag:plan`, `ag:research`, `ag:cook`, `ag:fix`, and `ag:code-review` are migration sources only. Their useful practices should be absorbed into the surviving actor/contract surfaces instead of being routed as separate default workflows.

`ag-debug` remains a valid helper skill. It is not a default workflow owner, but its root-cause methodology is still available alongside the `ag-debugger` agent.

### Core Skills

- **`ag-generate-plan`** - Create implementation plans (SIMPLE or COMPLEX) with explicit touchpoints, blast radius, verification evidence, and resume handoff
- **`ag-generate-context`** - Generate/update repository context
- **`ag-audit-context`** - Audit context routing, grouping, discoverability, and Claude/Codex wiring
- **`ag-audit-ag`** - Audit agent harness health: agent parity, skill registry, README.md sync, and protocol wiring

Legacy `@sync-to-riper5.md` and `@sync-from-riper5.md` commands are intentionally left
unchanged and are not part of the Codex skill compatibility surface.

---

## Mode Agents (Claude Code Subagents)

Claude Code provides specialized subagents for each RIPER-5 mode. Each subagent has:

- Separate context window (token efficiency)
- Specific tool restrictions (phase-locking enforcement)
- Clear purpose and responsibilities

### Available Agents

**ag-research-agent**

- Purpose: Information gathering only (read-only)
- Tools: Read, Grep, Glob, Bash (safe commands)
- Use: Understanding codebase, gathering context
- Invoke: User says "ENTER RESEARCH MODE" or explicit agent call

**ag-innovate-agent**

- Purpose: Brainstorming approaches (discussion-only)
- Tools: Read, Grep, Glob (no execution)
- Use: Exploring implementation options
- Invoke: After RESEARCH, user says "go" or "ENTER INNOVATE MODE"

**ag-plan-agent**

- Purpose: Creating detailed specifications
- Tools: Read, Write (process/general-plans/active/ or process/features/\*/active/ only), Grep, Glob, Bash
- Use: Writing implementation plans
- Invoke: After INNOVATE, user says "go" or "ENTER PLAN MODE"

**ag-execute-agent**

- Purpose: Implementing per approved plan
- Tools: Full access (Read, Write, Edit, Delete, Grep, Glob, Bash)
- Use: Code implementation
- Invoke: **ONLY** with explicit "ENTER EXECUTE MODE" after plan approval

**ag-fast-mode-agent**

- Purpose: Compressed workflow (RESEARCH → INNOVATE → PLAN → PAUSE → EXECUTE)
- Tools: Full access
- Use: Quick end-to-end implementation with safety pause
- Invoke: "ENTER FAST MODE"
- **CRITICAL**: Pauses before EXECUTE for confirmation

**ag-update-process-agent**

- Purpose: Rule updates, memory storage, plan archiving
- Tools: Read, Write, Edit, Grep, Glob, Bash, update_memory
- Use: Capturing learnings, updating documentation

### Specialist Agents (callable within RIPER-5 phases)

These agents add capabilities beyond the core RIPER-5 workflow. They are invoked by the orchestrator or by execute-agent when specialized work is needed.

**During EXECUTE phase:**

- **ag-tester** — Diff-aware test verification. Maps changed files to test files, runs only affected tests. Invoke after implementation sub-steps complete.
- **ag-debugger** — Root cause analysis for bugs. Evidence-before-hypothesis methodology. Can also be invoked standalone.
- **ag-code-reviewer** — Production-readiness review. Edge case scouting, N+1 detection, auth path validation. Invoke as pre-PR quality gate.
  Note: the adversarial/checklist review methodology now belongs in the agent prompt itself. Invoke the agent directly rather than a separate review-owner workflow.
- **ag-code-simplifier** — Post-implementation refactor for clarity without behavior change. Invoke after code-reviewer passes.
- **ag-ui-ux-designer** — Design-aware frontend implementation. Invoke for UI/UX tasks within execute phase.
- **ag-git-manager** — Clean conventional commits. Invoke for git operations.

**Cross-phase utilities (skills, not agents):**

- `ag-sequential-thinking` — Structured reasoning, usable in any phase
- `ag-problem-solving` — Cognitive toolkit when stuck in any phase
- `ag-scout` — Fast codebase scouting, usable in RESEARCH
- `ag-tech-graph` — Publish-grade SVG/PNG technical diagram generator for durable process artifacts; pair with `ag-preview` for review or explanation after generation
- `ag-watzup` — Read-only repo, local/remote ref, worktree, and active-plan handoff summary helper with advisory-only selected-plan hints
- `ag-xia` — Repo comparison and adaptation-prep helper with recon, map, analyze, and challenge stages that stops before planning or coding
- `ag-repomix` — Repository packing helper for references-only artifacts, audits, and feature-porting prep
- `ag-chrome-devtools` / `ag-agent-browser` — Browser automation, primarily EXECUTE
- `ag-context-engineering` — Token optimization guidance, any phase
- `ag-debug` — specialist root-cause-analysis helper, usable alongside `ag-debugger`
- `ag-autoresearch` — Autonomous iterative optimization loop. Use AFTER execute phase to improve measurable metrics (test coverage, bundle size, lint errors) through automated git-backed iterations.

---

## Routing Protocol

When a user makes a request:

### 0. Skill Discovery (Do This First)

Before routing, scan `.claude/skills/` directory names and match keywords from the user request to surface relevant skills. Attach candidate skill names to the subagent prompt.

**Skill Registry** — all available skills with trigger keywords:

| Skill                    | Purpose                                                                                                         | Trigger Keywords                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ag-frontend-design`     | Polished UI from designs/screenshots/videos                                                                     | UI, design, layout, component, page, interface, visual, CSS, Tailwind, login page, dashboard   |
| `ag-debug`               | Root cause-analysis helper used alongside `ag-debugger`                                                         | debug, root cause, investigate, why is this                                                    |
| `ag-scenario`            | Edge case generation across 12 dimensions                                                                       | edge cases, test scenarios, what could go wrong                                                |
| `ag-security`            | STRIDE + OWASP security audit                                                                                   | security, vulnerability, auth, XSS, SQL injection                                              |
| `ag-autoresearch`        | Autonomous metric optimization loop                                                                             | improve coverage, reduce bundle, optimize metric                                               |
| `ag-predict`             | 5-persona pre-implementation debate                                                                             | risks, predict issues, architectural review                                                    |
| `ag-scout`               | Fast parallel codebase scouting                                                                                 | find files, where is, search codebase                                                          |
| `ag-tech-graph`          | Publish-grade technical diagrams as SVG or PNG for durable process artifacts                                    | generate diagram, architecture diagram, flowchart, sequence diagram, system visual             |
| `ag-watzup`              | Read-only branch, local/remote ref, worktree, and active-plan handoff summary with advisory selected-plan hints | what's in flight, handoff, worktree status, active plans, next steps                           |
| `ag-xia`                 | Repo comparison and adaptation-prep research                                                                    | copy from repo, compare repo, adapt from repo, study how they built it, analyze feature parity |
| `ag-repomix`             | Pack local or remote repos into references-only artifacts                                                       | pack repo, snapshot codebase, repo context, compare repo, feature port, security audit         |
| `ag-docs`                | Project documentation management                                                                                | docs, README, document codebase                                                                |
| `ag-docs-seeker`         | Library docs via context7                                                                                       | how does X work, API docs, version, syntax                                                     |
| `ag-web-testing`         | Playwright/Vitest/k6 test automation                                                                            | tests, e2e, integration test, performance test                                                 |
| `ag-sequential-thinking` | Step-by-step reasoning                                                                                          | complex problem, think through, analyze step by step                                           |
| `ag-problem-solving`     | Cognitive unblocking techniques                                                                                 | stuck, can't figure out, complex, spiral                                                       |
| `ag-context-engineering` | Token/context optimization                                                                                      | context limit, token usage, optimize context                                                   |
| `ag-preview`             | Visual diagrams, slides, file viewer                                                                            | diagram, visualize, slides, preview                                                            |
| `ag-mcp-management`      | MCP server tools                                                                                                | MCP, model context protocol                                                                    |
| `ag-chrome-devtools`     | Puppeteer browser automation                                                                                    | browser, screenshot, scrape, automate browser                                                  |
| `ag-agent-browser`       | AI browser automation CLI                                                                                       | long browser session, browserbase, visual testing                                              |
| `ag-team`                | Multi-agent parallel collaboration                                                                              | parallel agents, multi-agent, team                                                             |
| `ag-setup`               | Scaffold agent harness into new project                                                                         | seed, harness, bootstrap, new project, scaffold, setup                                         |
| `ag-update`              | Pull latest harness from remote kit repo                                                                        | update harness, pull kit, sync harness, upgrade agents                                         |
| `ag-publish`             | Push harness improvements to remote kit repo                                                                    | publish kit, push harness, release kit, update remote                                          |
| `ag-audit-ag`            | Agent harness health audit (agents, skills, README.md, protocol wiring)                                         | harness, agent parity, skill audit, guide sync                                                 |
| `ag-zod`                 | Rules and references for Zod schema validation, parsing and database mapping                                    | validate payload, zod schema, zod custom validation errors, zod validation                     |

**Rule:** When 1+ skills match the request, mention them to the user OR include them in the subagent prompt context. Never silently skip relevant skills.

---

### 1. Detect Intent

- **Feature Request** (keywords: "build", "add", "implement", "create feature")
  → Route to `ag-research-agent` with relevant context files

- **Question / Understanding Request**
  → Non-trivial: route to `ag-research-agent`. Trivial conceptual questions ("What is X?") may be answered directly by the orchestrator.

- **Trivial Fix**
  → Delegate lightweight quick-fix to `ag-execute-agent` (no plan file required).
  **Trivial definition:** Single-file change, no new dependencies, no schema/API/auth changes, under 15 lines, no security surface. Anything else is non-trivial.

- **Missing Context**
  → Suggest or invoke the `ag-generate-context` skill

- **Bug Fix / Debug Request** (keywords: "fix", "bug", "broken", "debug", "error")
  → For trivial: delegate to `ag-execute-agent` directly (no plan required)
  → For complex: Route to `ag-debugger` agent. Surface helper skills like `ag-scout`, `ag-sequential-thinking`, or `ag-problem-solving` when useful.

- **Existing Plan File Present**
  → Resume from relevant phase, don't recreate plan

- **UI / Frontend Request** (keywords: "page", "component", "design", "layout", "interface", "UI")
  → Surface `ag-frontend-design` skill alongside `ag-research-agent`. Invoke `ag-ui-ux-designer` agent during EXECUTE phase for implementation.

- **Documentation Question** (keywords: "how does X work", "API docs", "syntax", "version")
  → Activate `ag-docs-seeker` skill before routing to `ag-research-agent`

- **Refactor / Simplify** (keywords: "refactor", "clean up", "simplify", "reorganize")
  - _Pure style/readability_ (named file, no behavior change): route directly to `ag-code-simplifier` agent
  - _Behavioral or architectural refactor_: full RESEARCH → PLAN → EXECUTE, then `ag-code-simplifier` as cleanup

- **Debug / Root Cause** (keywords: "debug", "why", "root cause", "investigate")
  → `ag-debugger` agent = default owner. Helper skills like `ag-scout`, `ag-sequential-thinking`, and `ag-problem-solving` may be layered in as needed.

**When multiple intents match** (e.g., UI bug with docs question), use this precedence:

1. Existing plan file in process/general-plans/active/ or process/features/\*/active/ → always resume first
2. Explicit mode command (ENTER X MODE) → obey immediately
3. Bug/debug → debugging routing before feature routing
4. Feature request → RIPER-5 flow
5. UI specialization → surface ag-frontend-design alongside any of the above
6. Docs question → surface ag-docs-seeker alongside any of the above
   When still ambiguous, ask the user one clarifying question before routing.

### 2. Gather Context

Before routing to subagent, pass relevant `process/context/` files:

- `process/context/all-context.md` — always pass or consult first for context routing
- `process/context/all-context.md` — always pass for architecture/stack awareness
- `process/context/tests/all-tests.md` — pass when routing to `ag-tester`, `ag-debugger`, or `ag-execute-agent`
- `process/general-plans/active/` and `process/features/*/active/` — check for existing plans to avoid duplication
- Relevant code paths — summarize succinctly, don't dump entire files

**Routing depth rule:** `all-*.md` files are routers. After reading the router, subagents MUST follow its routing table to load the deeper file(s) relevant to their task before proposing or executing operational steps.

### 3. Route to Subagent

Choose based on current phase:

- Initial understanding → `ag-research-agent`
- Exploring options → `ag-innovate-agent`
- Creating spec → `ag-plan-agent`
- Implementing approved plan → `ag-execute-agent`
- Fast workflow → `ag-fast-mode-agent`
- Capturing learnings → `ag-update-process-agent`

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
- ag-innovate-agent must produce a brief decision summary (chosen approach + rejected alternatives + rationale) before PLAN begins.
- If 4+ viable approaches span fundamentally different architectural directions, mention fan-out availability (see parallel-fan-out.md Checkpoint 2).

**PLAN → EXECUTE**

- Requires written plan file
- Score parallel fan-out signals (see parallel-fan-out.md Checkpoint 3). Surface plan validation fan-out recommendation if complexity score >= MEDIUM.
- User reviews and explicitly says "ENTER EXECUTE MODE"

**Orchestrator preflight before spawning ag-execute-agent**: Confirm exactly one plan file is selected. Pass the plan file path explicitly in the subagent prompt. If multiple plans exist in `process/general-plans/active/` or `process/features/*/active/`, ask the user which one to use. Never let ag-execute-agent infer the plan from ambient state.

**EXECUTE → UPDATE PROCESS**

- After non-trivial implementation completes, always surface a cleanup checkpoint
- Score parallel fan-out signals (see parallel-fan-out.md Checkpoint 5). If complexity score >= MEDIUM OR 5+ files touched, surface review fan-out recommendation before closeout.
- UPDATE PROCESS still requires explicit user command
- After ag-execute-agent reports DONE, the orchestrator should present a short closeout packet:
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
- If the worktree has uncommitted changes from this execution, offer: "Invoke ag-git-manager for logical commit splitting before UPDATE PROCESS?" Pass the `touched_files` list (files the ag-execute-agent reported changing) as context so ag-git-manager can scope its analysis.
- If cleanup is skipped and active-plan debt builds up, recommend `ag-audit-plans` as a follow-up maintenance step
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
2. Run the `ag-generate-context` skill if `process/context/all-context.md` doesn't exist
3. Start with a feature request or question

**Typical Feature Workflow** (Orchestrator routes to subagents):

1. Describe feature → Orchestrator routes to `ag-research-agent`
2. Say "go" → Orchestrator routes to `ag-innovate-agent` (explore approaches)
3. Say "go" → Orchestrator routes to `ag-plan-agent` (creates plan in `process/general-plans/active/`)
4. Review plan carefully
5. Say "ENTER EXECUTE MODE" → Orchestrator routes to `ag-execute-agent` (implementation begins)
6. After completion, optionally "ENTER UPDATE PROCESS MODE" → Orchestrator routes to `ag-update-process-agent`

**Quick Iteration (FAST MODE)** (Orchestrator routes to fast-mode-agent):

1. Say "ENTER FAST MODE - [feature description]"
2. Review generated plan (ag-fast-mode-agent pauses)
3. Say "ENTER EXECUTE MODE" to continue implementation within ag-fast-mode-agent

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
