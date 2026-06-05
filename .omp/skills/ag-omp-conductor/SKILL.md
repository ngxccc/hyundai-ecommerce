---
name: ag-omp-conductor
description: "OMP-specific multi-agent orchestration and tool coordination. Use when running parallel subagents, managing IRC messages, or utilizing OMP-specific tools (IRC, task, browser, DAP, etc.)."
license: MIT
argument-hint: "[task-description or plan-path]"
metadata:
  author: Team
  version: "1.0.0"
---

# OMP Conductor - Main Agent Multi-Subagent Orchestration

This skill is designed **exclusively for the OMP (oh-my-pi) harness**. It defines the role of the Main Agent (`0-Main`) as the central orchestrator, executing commands across all 22 OMP-specific tools to coordinate, communicate with, and validate parallel subagents.

## When to Apply

Use this skill when:

- Orchestrating multiple parallel subagents in the OMP environment.
- Setting up inter-agent communication via the `irc` tool.
- Validating the merged output of subagents using LSP or AST tools.
- Driving browser-based E2E tests or vision-based QA in the workspace.

---

## 1. Tool Matrix Reference

The Conductor has full access to the OMP tool surface, categorized into 6 primary operational groups:

| Category                    | Tool                                                       | Function / Application inside Conductor                                               |
| :-------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Read & Search**           | `read`, `find`, `search`                                   | Read files/DB/URLs, locate files by glob, grep regex across workspace.                |
| **Editing & Resolution**    | `write`, `edit`, `ast_edit`, `resolve`                     | Write files, patch lines, perform structural refactors, resolve preview state.        |
| **System & Code**           | `bash`, `eval`, `recipe`, `lsp`                            | Run shell commands, execute JS/Python cells, invoke compiler/Make, query LSP.         |
| **Web & Graphics**          | `browser`, `web_search`, `generate_image`, `inspect_image` | Automate Chromium via Puppeteer, query search engines, generate/inspect visual specs. |
| **Concurrency & Debugging** | `task`, `irc`, `job`, `debug`                              | Spawn parallel subagents, send IRC DMs, manage background jobs, run DAP debugger.     |
| **Management & QA**         | `todo_write`, `github`, `report_tool_issue`                | Live TUI task list tracking, GitHub API integration, report tool bugs.                |

---

## 2. Detailed Tool-by-Tool Usage Guide

Here is the exhaustive parameter and syntax reference for all 22 OMP-specific tools:

### Group 1: Read & Search

#### `read`

- **Purpose**: Opens and reads disk files, directories, archives, SQLite databases, PDFs, Jupyter notebooks, images, web URLs, and virtual schemes (`skill://`, `pr://`, `issue://`, `agent://`, `artifact://`, `memory://`, `mcp://`, `local://`, `conflict://`, `jobs://`).
- **Key Selectors**:
  - `:50-200` — Line range (inclusive).
  - `:50+150` — Count form (150 lines starting at line 50).
  - `:raw` — Verbatim text (no anchors, no signatures summarization).
  - `:conflicts` — Enumerates git merge conflicts.
- **Examples**:
  ```bash
  # Line range from app.ts inside a tarball
  read "build/bundle.tar.gz:src/app.ts:120-180"
  # Verbatim read of parser config
  read "src/parser.ts:1-40:raw"
  # Load PR details (automatically cached)
  read pr://1234
  ```

#### `find`

- **Purpose**: Fast file-name lookup by glob. Sorted by modification time (mtime, newest first), relative to CWD. Honors `.gitignore` by default.
- **Examples**:
  ```json
  find paths=["src/routes/**/*.tsx"]
  find paths=["apps/**/package.json", "packages/**/package.json"]
  ```

#### `search`

- **Purpose**: Rust regex lookup across files, directories, globs, or internal URLs. Context lines start with a space; matches start with `*LINE|`. Paginated via `skip`. Cross-line patterns auto-enable when the regex contains a literal `\n`.
- **Examples**:
  ```json
  search pattern="TODO\\(\\w+\\)" paths=["src/"] i=true
  search pattern="function \\w+\\([^)]*\\)\\s*\\{\\n\\s*\\}" paths=["src/"]
  ```

---

### Group 2: Editing & Resolution

#### `write`

- **Purpose**: Creates or overwrites a file, archive entry, or SQLite row. Runs format-on-save automatically.
- **Examples**:
  ```json
  write path="src/routes/health.ts" content="export const ok = () => 'ok';\n"
  ```

#### `edit`

- **Purpose**: Applies a line-anchored patch against the per-session read cache using two-character line hashes (`hashline` mode). Prevents conflicting updates.
- **Syntax**:
  - `+ ANCHOR` — Insert after anchored line.
  - `< ANCHOR` — Insert before anchored line.
  - `- A..B` — Delete inclusive range.
  - `= A..B` — Replace inclusive range.
- **Examples**:
  ```json
  edit input="@@ src/auth.ts\n= 87qa..87qa\n~  return await loadUser(id);\n"
  ```

#### `ast_edit`

- **Purpose**: Structural rewrite using ast-grep patterns. Ignores whitespace and comments. Captures nodes like `$A`, captures zero-or-more like `$$$ARGS`. Staged as a preview.
- **Examples**:
  ```json
  ast_edit ops=[{ "pat": "legacyFn($$$ARGS)", "out": "newFn($$$ARGS)" }] paths=["src/**/*.ts"]
  ast_edit ops=[{ "pat": "console.log($$$)", "out": "" }] paths=["src/"]
  ```

#### `resolve`

- **Purpose**: Applies or discards a pending preview action staged by `ast_edit` or plan approvals.
- **Examples**:
  ```json
  resolve action="apply" reason="clean up debugging logs"
  resolve action="discard" reason="keep logs until hotfix verification"
  ```

---

### Group 3: System & Code Intelligence

#### `bash`

- **Purpose**: Executes shell commands in a persistent session. Supports `cwd`, `env` variables, and PTY mode.
- **Examples**:
  ```json
  bash command="git status"
  ```

#### `eval`

- **Purpose**: Runs Python (`py`) or JavaScript (`js`) cells in a persistent, stateful kernel environment.
- **Examples**:
  ```json
  eval language="py" code="import math\nprint(math.sqrt(64))"
  eval language="js" code="const fs = require('fs'); display(fs.readdirSync('.'));"
  ```

#### `recipe`

- **Purpose**: Runs a target task from the project's task runner (e.g. Bun, Make, Cargo, Just).
- **Examples**:
  ```json
  recipe target="test"
  ```

#### `lsp`

- **Purpose**: Language server client wrapper for code navigation, outline, diagnostics, quick-fixes, and symbol renames.
- **Key Actions**: `definition`, `type_definition`, `implementation`, `references`, `hover`, `symbols`, `diagnostics`, `code_actions`, `rename`, `rename_file`, `status`, `capabilities`, `reload`, `request`.
- **Examples**:
  ```json
  lsp action="references" file="src/server/auth.ts" line=42 symbol="issueToken"
  lsp action="rename" file="src/auth/jwt.ts" line=14 symbol="issueToken" new_name="mintToken"
  lsp action="diagnostics" file="*"
  ```

---

### Group 4: Web & Graphics

#### `web_search`

- **Purpose**: Submits queries through the Brave/Tavily/Kagi search engine chain.
- **Examples**:
  ```json
  web_search query="bun workspaces hoisting behaviour" recency="month"
  ```

#### `browser`

- **Purpose**: Real Chromium browser tab driven through Puppeteer. Actions include `open`, `run` (executes async JS with `tab` and `page` in scope), and `close`.
- **Examples**:
  ```json
  browser open name="main" url="https://example.com/login"
  browser run name="main" code="const obs = await tab.observe(); const btn = obs.elements.find(e => e.role === 'button'); await (await tab.id(btn.id)).click();"
  browser close name="main"
  ```

#### `generate_image`

- **Purpose**: Structured image generation.
- **Examples**:
  ```json
  generate_image subject="wireframe diagram" scene="web app dashboard" style="flat minimalist"
  ```

#### `inspect_image`

- **Purpose**: Vision model analysis of a local image.
- **Examples**:
  ```json
  inspect_image path="reports/ui-diff.png" prompt="Is the logo aligned correctly with the menu items?"
  ```

---

### Group 5: Concurrency & Debugging

#### `task`

- **Purpose**: Spawns parallel subagent slots. Passing `isolated: true` configures git worktrees/overlays to isolate concurrent edits.
- **Examples**:
  ```json
  task agent="explore" tasks=[{ "id": "Audit", "assignment": "Check config files" }]
  ```

#### `irc`

- **Purpose**: Short synchronous prose messages between live slots (e.g. `0-Main` and `1-Subagent`).
- **Examples**:
  ```json
  irc op="list"
  irc op="send" to="1-DatabaseSetup" message="What columns exist in the User table?"
  ```

#### `job`

- **Purpose**: Wait on or cancel background processes or subagents.
- **Examples**:
  ```json
  job op="wait" jobId="DatabaseSetup"
  ```

#### `debug`

- **Purpose**: DAP-driven debugger execution. Off by default. Supports conditional breakpoints, stepping, variables, frames, and expressions.
- **Examples**:
  ```json
  debug action="launch" adapter="debugpy" program="transform.py"
  debug action="set_breakpoint" file="transform.py" line=58 condition="i == 3"
  debug action="stack_trace" levels=5
  debug action="evaluate" frame_id=0 expression="sum(totals)" context="repl"
  ```

---

### Group 6: Management & QA

#### `todo_write`

- **Purpose**: Updates the live phased todo registry shown in the session TUI.
- **Examples**:
  ```json
  todo_write phase="Verification" items=["Run cargo test", "Verify lsp"]
  ```

#### `github`

- **Purpose**: GitHub CLI wrapper. Actions: `repo_view`, `pr_create`, `pr_checkout`, `pr_push`, `search_issues`, `search_prs`, `search_code`, `search_commits`, `search_repos`, `run_watch`.
- **Examples**:
  ```json
  github op="pr_checkout" pr=1234
  github op="pr_create" fill=true draft=true
  github op="run_watch"
  ```

#### `report_tool_issue`

- **Purpose**: Flags unexpected tool behavior for automated QA tracking.
- **Examples**:
  ```json
  report_tool_issue tool="lsp" description="LSP crash during workspace diagnostics"
  ```

---

## 3. Multi-Agent Orchestration Protocol

When a large or multi-subsystem task is initiated, the Conductor must follow this sequence:

### Step 1: Research & Scope Definition

- Use `find` and `search` to map the files.
- Call `lsp diagnostics` or check TS types to understand dependencies.
- _OMP Tool used_: `read`, `find`, `search`, `lsp`

### Step 2: Formulate the Assignment

- Draft a clear multi-task parallel execution plan.
- Create a live TUI task list using `todo_write` to keep the user informed.
- _OMP Tool used_: `todo_write`

### Step 3: Fan out via Task Spawning

- Call the `task` tool to spawn subagents. Ensure tasks with potential conflicts are isolated using `isolated: true` (worktrees).
- _OMP Tool used_: `task`

### Step 4: IRC Coordination & Monitoring

- Monitor progress. If a subagent needs to request data from another subagent, coordinate the communication over `irc`.
- If background jobs or long-running tasks are started, manage them using `job`.
- _OMP Tool used_: `irc`, `job`

### Step 5: Merge & Verification

- If subagents were isolated, merge their branches back.
- Run validation test suites using `recipe`.
- Use `lsp references` or `lsp definition` to verify that no imports are broken.
- _OMP Tool used_: `recipe`, `lsp`

---

## How to Use

This skill is local to `.omp/skills/` and is automatically loaded by the OMP session because it is registered in `ag-manifest.json` under `.omp/**`.

To run the conductor simulation showing how a complex parallel workflow is managed:

```bash
bun run .omp/skills/ag-omp-conductor/scripts/simulate-conductor.mjs
```

## References

- [OMP Tool Routing & Subagent Management Guide](references/tool-routing.md)
