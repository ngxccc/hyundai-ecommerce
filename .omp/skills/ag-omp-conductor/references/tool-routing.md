# OMP Tool Routing & Subagent Management Guide

This guide details how the Conductor agent routes operations across the 22 OMP-specific tools to manage parallel subagents.

---

## 1. Subagent Lifecycle Control

### Spawning (The `task` tool)

When spawning subagents, define precise scopes:

```json
{
  "agent": "explore",
  "isolated": true,
  "tasks": [
    {
      "id": "DatabaseSetup",
      "assignment": "Scaffold migrations and models under src/db/."
    },
    {
      "id": "APIHandler",
      "assignment": "Create API routes under src/api/. Query DatabaseSetup for model structure."
    }
  ]
}
```

### Job Monitoring (The `job` tool)

If subagents are running in the background, check their status or wait for completion using:

```json
{
  "op": "wait",
  "jobId": "DatabaseSetup"
}
```

---

## 2. Real-Time Inter-Agent Messaging (The `irc` tool)

The `irc` tool allows live agents in the same process to talk.

- `op: "list"`: Retrieves slot IDs and names.
- `op: "send"`: Delivers a message to a slot (e.g. `1-DatabaseSetup`).

### The Handshake Sequence

1. `1-DatabaseSetup` finishes generating schemas, but does not exit (holds active turn).
2. `2-APIHandler` calls `irc` to request schema information from `1-DatabaseSetup`.
3. `1-DatabaseSetup` receives the request via its side-channel turn, replies with the JSON representation of the schema.
4. `2-APIHandler` continues coding, and `1-DatabaseSetup` exits cleanly.

---

## 3. Structural Validation (AST & LSP Tools)

After subagents merge their work, the Conductor must validate structural code integrity:

### LSP Diagnostics

```json
{
  "action": "diagnostics",
  "file": "*"
}
```

Checks for workspace-wide TypeScript errors.

### AST Grep Verification

To verify that all database calls use the correct transaction wrappers:

```json
{
  "pat": "db.transaction($$$)",
  "paths": ["src/**/*.ts"]
}
```

If any database mutation bypasses transactions, the Conductor flags a failure.

---

## 4. Visual QA (Browser & Image Tools)

If the subagents implemented UI changes, the Conductor uses `browser` to take screenshots and validates them:

```json
{
  "action": "run",
  "name": "main",
  "code": "await tab.goto('http://localhost:3000'); await tab.screenshot({ save: 'process/reports/ui-screenshot.png' });"
}
```

The Conductor can then feed the image to `inspect_image` or a vision model to verify alignment with UI specs.
