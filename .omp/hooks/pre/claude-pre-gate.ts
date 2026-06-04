import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";
import { execSync } from "child_process";
import * as path from "path";

const mapToolName = (ompName: string): string => {
  switch (ompName) {
    case "write":
      return "Write";
    case "edit":
      return "Edit";
    case "ast_edit":
      return "MultiEdit";
    case "read":
      return "Read";
    case "search":
      return "Grep";
    case "find":
      return "Glob";
    case "bash":
      return "Bash";
    default:
      return ompName;
  }
};

const runClaudeHook = (
  hookScript: string,
  payload: any,
): { block: boolean; reason?: string } => {
  try {
    const scriptPath = path.resolve(`.claude/hooks/${hookScript}`);
    const output = execSync(`node "${scriptPath}"`, {
      input: JSON.stringify(payload),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (output) {
      try {
        const json = JSON.parse(output.trim());
        if (json.continue === false) {
          return { block: true, reason: json.error || "Blocked by hook" };
        }
      } catch (e) {
        // Output is not JSON, ignore
      }
    }
    return { block: false };
  } catch (error: any) {
    const stderr = error.stderr ? String(error.stderr).trim() : "";
    const stdout = error.stdout ? String(error.stdout).trim() : "";
    return {
      block: true,
      reason: stderr || stdout || error.message || "Blocked by hook",
    };
  }
};

export default function (pi: HookAPI) {
  pi.on("tool_call", (event) => {
    console.error(`[HOOK DEBUG] Tool call: ${event.toolName}`);
    const toolName = event.toolName;
    const input = event.input || {};

    const payload = {
      session_id: event.sessionId || "default-session",
      hook_event_name: "PreToolUse",
      event: "PreToolUse",
      tool_name: mapToolName(toolName),
      tool_input: input,
      cwd: process.cwd(),
    };

    const targetTools = [
      "write",
      "edit",
      "ast_edit",
      "read",
      "search",
      "find",
      "bash",
    ];

    if (targetTools.includes(toolName)) {
      // 1. Run scout-block
      const scoutRes = runClaudeHook("scout-block.cjs", payload);
      if (scoutRes.block) {
        return { block: true, reason: scoutRes.reason };
      }

      // 2. Run privacy-block
      const privacyRes = runClaudeHook("privacy-block.cjs", payload);
      if (privacyRes.block) {
        return { block: true, reason: privacyRes.reason };
      }
    }

    if (toolName === "write") {
      // 3. Run descriptive-name
      const nameRes = runClaudeHook("descriptive-name.cjs", payload);
      if (nameRes.block) {
        return { block: true, reason: nameRes.reason };
      }
    }
  });
}
