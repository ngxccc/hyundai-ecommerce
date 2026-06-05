// @ts-check
// @ts-expect-error

import { execSync } from "node:child_process";
import * as path from "node:path";
import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

const mapToolName = (ompName: string): string => {
  switch (ompName) {
    case "write":
      return "Write";
    case "edit":
      return "Edit";
    case "ast_edit":
      return "MultiEdit";
    default:
      return ompName;
  }
};

const runClaudePostHook = (hookScript: string, payload: any): void => {
  try {
    const scriptPath = path.resolve(`.claude/hooks/${hookScript}`);
    execSync(`node "${scriptPath}"`, {
      input: JSON.stringify(payload),
      encoding: "utf-8",
      stdio: ["pipe", "ignore", "ignore"],
    });
  } catch (_error) {
    // Post hooks are observational, ignore errors
  }
};

export default function (pi: HookAPI) {
  pi.on("tool_result", (event) => {
    const toolName = event.toolName;
    const targetTools = ["write", "edit", "ast_edit"];

    if (targetTools.includes(toolName)) {
      const payload = {
        session_id: event.sessionId || "default-session",
        hook_event_name: "PostToolUse",
        event: "PostToolUse",
        tool_name: mapToolName(toolName),
        tool_input: event.input || {},
        tool_result: event.content || {},
      };

      // 1. Run session-state
      runClaudePostHook("session-state.cjs", payload);

      // 2. Run post-edit-simplify-reminder
      runClaudePostHook("post-edit-simplify-reminder.cjs", payload);
    }
  });
}
