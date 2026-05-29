# Intent Clarification Protocol

The orchestrator consults this protocol before routing a new user request to any
subagent. It scores the request's ambiguity using four binary signals, selects one
of three tiers (silent auto-route, inline summary, or full checkpoint), and resolves
intent in the main thread before delegating. The goal is to ask the right questions
at the right time without adding friction to clear requests.

## Signal Scoring

Each signal is worth +1. Sum them to get the ambiguity score.

| Signal | Description |
|--------|-------------|
| Ambiguous scope | Request touches multiple features or packages without naming one |
| No explicit path | No file, package, or feature name mentioned |
| Multiple intents | Request could be a bug fix, feature, refactor, or question |
| First interaction | No established workflow context in current session |

Score thresholds:

| Score | Tier | Action |
|-------|------|--------|
| 0-1 | Tier 0 | Auto-route silently (current behavior) |
| 2 | Tier 1 | Show routing summary, wait for confirmation before routing |
| 3+ | Tier 2 | Full clarification checkpoint with multiple-choice questions |

### Worked Examples

**Example A**: "Fix the login bug on the auth page"

- Ambiguous scope: No (+0) -- "auth page" is a specific scope
- No explicit path: Yes (+1) -- no file named, but scope is narrow
- Multiple intents: No (+0) -- single intent (fix)
- First interaction: No (+0) -- assume mid-session

Score: 1. Result: Tier 0, auto-route to debugger/execute.

**Example B**: "Make the app faster"

- Ambiguous scope: Yes (+1) -- could be bundle size, API perf, rendering, caching
- No explicit path: Yes (+1) -- no file or package named
- Multiple intents: Yes (+1) -- could be refactor, config change, infra work, or research
- First interaction: depends on session context

Score: 3+ (even without first-interaction signal). Result: Tier 2, ask clarification questions.

## Auto-Skip Conditions

These conditions force Tier 0 regardless of the ambiguity score:

- User said "go", "continue", "just do it", or similar continuation phrases
- Mid-phase-program execution (active phase plan is selected and approved)
- Trivial fix detection (single-file, under 15 lines, no schema/API/auth changes)
- Explicit mode command ("ENTER EXECUTE MODE", "ENTER RESEARCH MODE", etc.)
- Resuming an existing active plan
- Pure information questions ("What is X?", "How does Y work?") that map to a single obvious routing target

When an auto-skip condition matches, the orchestrator routes immediately per the
existing routing protocol in `CLAUDE.md` and `process/development-protocols/orchestration.md`.

## Tier 0: Silent Auto-Route

Current behavior. No user interaction added. Score 0-1 or auto-skip triggered.

The orchestrator routes to the detected agent per the existing routing protocol.
No routing summary is shown and no confirmation is requested.

## Tier 1: Routing Summary with Confirmation Pause

The orchestrator performs a light research pass (see section below), then presents:

```
Routing: [detected intent] -> [target agent]
Scope: [what I think you want changed]
Plan: [existing plan if found, or "new work"]
```

The orchestrator WAITS for the user's next message before routing. It does NOT
route in the same response and does NOT say "I'll proceed unless you correct me."

No questions are asked (unlike Tier 2), but the user gets a chance to correct
the routing before any subagent is spawned.

- If the user confirms ("yes", "looks right", "go") or sends a forward-continuing
  message, the routing proceeds.
- If the user corrects ("no, I meant X"), re-score with the new information and
  re-route accordingly.

## Tier 2: Full Clarification Checkpoint

The orchestrator performs a light research pass, then picks 2-4 questions from the
category menu below. Questions use multiple-choice format for easy answering.
The orchestrator waits for answers before routing.

### Question Category Menu

The orchestrator selects the most relevant 2-4 categories. If only one category
is ambiguous, ask one question -- do not pad to 2-4.

| Category | Template |
|----------|----------|
| Scope | "Which areas? [A] just {X} [B] {X} and {Y} [C] the whole {feature}" |
| Direction | "Approach? [A] quick fix [B] proper refactor [C] you decide" |
| Constraints | "Constraints? [A] must not touch {Z} [B] backward compat required [C] none" |
| Acceptance | "Done looks like? [A] tests pass [B] deployed [C] code-reviewed" |
| Context | "Related to existing work? [A] yes, {plan X} [B] no, fresh [C] not sure" |
| Priority | "Priority? [A] do it now [B] plan it for later [C] just research" |

The orchestrator fills in `{X}`, `{Y}`, `{Z}`, and `{plan X}` from the light
research pass. Placeholder values come from active plans, context routing keywords,
and recent git state.

## Autonomy Mode

### What Grants Autonomy

- Explicit autonomy phrases: "you decide", "just do it", "full autonomy", "don't ask"
- Mid-phase-program context where the current phase plan is selected and approved
- User has answered Tier 2 questions and said "go" (autonomy for the current task chain)

### Phrase Matching Rule

Autonomy phrases must be standalone statements or sentence-initial. They do NOT
match when embedded in descriptive text.

- "just do it" as a standalone instruction -> autonomy granted
- "just do the simple version" -> NOT autonomy (descriptive use, the user is specifying scope)
- "you decide how to implement it" -> autonomy granted (sentence-initial)

### What Autonomy Means

- All tiers collapse to Tier 0 for the current task chain
- Clarification questions are skipped
- Routing summaries are skipped

### What Autonomy Does NOT Override

- EXECUTE approval gate ("ENTER EXECUTE MODE" still required)
- Plan review checkpoint
- Phase-program phase boundaries
- High-risk execution handoff gates (see `orchestration.md`)

## Light Research Pass

Performed by the orchestrator in the main thread, not as a subagent delegation.

Budget: 3-5 file reads max. Should complete in under 30 seconds.

What it checks:

1. Active plan inventory scan (`process/general-plans/active/` and `process/features/*/active/`)
2. Context routing table in `process/context/all-context.md` (match keywords to domain)
3. Recent git status (are there uncommitted changes related to the request?)
4. If a specific package or file is named, one quick read of that file

Purpose: populate Tier 1 summary fields and Tier 2 question placeholders with
concrete values instead of generic text.

This is NOT a full research-agent delegation. If deeper investigation is needed,
route to the research-agent after clarification is resolved.

## Intent Revalidation After Research

After the research-agent completes, the orchestrator checks whether the original
intent still holds.

If research reveals the request is fundamentally different from what was assumed:

- Re-present a Tier 1 routing summary with updated understanding.
- Example: user said "fix the login bug" but research found it is actually an
  auth architecture issue requiring a multi-step refactor.

If research confirms the original intent, proceed to INNOVATE or PLAN without
re-asking. Do not repeat clarification that was already resolved.

## FAST Mode Integration

FAST mode runs RESEARCH -> INNOVATE -> PLAN -> PAUSE -> EXECUTE in one agent.

Intent clarification fires BEFORE the fast-mode agent is spawned. The orchestrator
scores and clarifies in the main thread, then hands the clarified intent to
the fast-mode-agent prompt.

Inside the fast-mode-agent, no additional clarification is needed because the
intent is already resolved. The fast-mode-agent focuses on execution, not
re-asking questions the orchestrator already answered.

## Fallback: Still Ambiguous After Tier 2

If the user answers Tier 2 questions but the orchestrator still cannot determine
a single routing path:

1. State what remains unclear in one sentence.
2. Ask one final direct question (not multiple-choice, just a plain question).
3. If still unresolvable after that, default to the research-agent with the
   narrowest reasonable scope.

Never loop clarification more than twice. Two rounds max, then route to research.

Definition: one round = one set of orchestrator questions + one set of user answers.
