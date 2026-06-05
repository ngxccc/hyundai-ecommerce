// @ts-check
// @ts-expect-error

import { execSync } from "node:child_process";
import * as path from "node:path";
import type { HookAPI } from "@oh-my-pi/pi-coding-agent/extensibility/hooks";

export default function (pi: HookAPI) {
  pi.on("session_start", (event) => {
    try {
      const payload = {
        session_id: event.sessionId || "default-session",
        hook_event_name: "SessionStart",
        event: "SessionStart",
      };

      const scriptPath = path.resolve(".claude/hooks/session-init.cjs");
      execSync(`node "${scriptPath}"`, {
        input: JSON.stringify(payload),
        encoding: "utf-8",
        stdio: ["pipe", "ignore", "ignore"],
      });
    } catch (_e) {
      // Session lifecycle errors are ignored
    }
  });

  pi.on("turn_start", (event) => {
    try {
      // Check if this is a subagent execution turn
      const isSubagent = (event as any).isSubagent || (event as any).subagentId;
      if (isSubagent) {
        const payload = {
          session_id: event.sessionId || "default-session",
          hook_event_name: "SubagentStart",
          event: "SubagentStart",
        };

        const scriptPath = path.resolve(".claude/hooks/subagent-init.cjs");
        execSync(`node "${scriptPath}"`, {
          input: JSON.stringify(payload),
          encoding: "utf-8",
          stdio: ["pipe", "ignore", "ignore"],
        });
      }
    } catch (_e) {
      // Ignore
    }
  });
}
