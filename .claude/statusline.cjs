#!/usr/bin/env node
"use strict";

const _fs = require("node:fs");
const _path = require("node:path");
const _os = require("node:os");

const {
  loadConfig,
  readSessionState,
} = require("./hooks/lib/ag-config-utils.cjs");
const { getGitInfo } = require("./hooks/lib/git-info-cache.cjs");
const { parseTranscript } = require("./hooks/lib/transcript-parser.cjs");
const { setColorEnabled } = require("./hooks/lib/colors.cjs");
const {
  resolveQuotaDisplayEligibility,
  readUsageCache,
  getUsageCachePath,
  normalizeUtilization,
} = require("./hooks/lib/usage-limits-cache.cjs");
const {
  resolveLayout,
} = require("./hooks/lib/statusline-section-registry.cjs");
const {
  render,
  renderCompact,
  renderMinimal,
} = require("./hooks/lib/statusline-render-modes.cjs");

function formatResetTime(resetsAt, now = Date.now()) {
  if (!resetsAt) return "";
  const diffMs = new Date(resetsAt).getTime() - now;
  if (diffMs <= 0) return "";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay}d`;
  }
  if (diffHour > 0) {
    const remainingMins = diffMin % 60;
    return `${diffHour}h${remainingMins}m`;
  }
  return `${diffMin}m`;
}

async function main() {
  const timeoutMs = process.env.CK_STATUSLINE_STDIN_TIMEOUT_MS
    ? parseInt(process.env.CK_STATUSLINE_STDIN_TIMEOUT_MS, 10)
    : 0;

  const inputPromise = new Promise((resolve) => {
    let data = "";
    let timeout = null;
    if (timeoutMs > 0) {
      timeout = setTimeout(() => {
        resolve(data);
      }, timeoutMs);
    }
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      if (timeout) clearTimeout(timeout);
      resolve(data);
    });
    process.stdin.on("error", () => {
      if (timeout) clearTimeout(timeout);
      resolve(data);
    });
  });

  const input = await inputPromise;

  let payload;
  if (!input.trim()) {
    payload = {
      model: { display_name: "Claude" },
      workspace: { current_dir: process.cwd() },
    };
  } else {
    try {
      payload = JSON.parse(input);
    } catch (_err) {
      payload = {
        model: { display_name: "Claude" },
        workspace: { current_dir: process.cwd() },
      };
    }
  }

  const config = loadConfig({ includeProject: true });
  setColorEnabled(config.statuslineColors);

  const statuslineLayout =
    config.plan?.statuslineLayout || config.statuslineLayout;
  const layout = resolveLayout(statuslineLayout);

  const ctx = {
    modelName: payload.model?.display_name || "",
    currentDir: payload.workspace?.current_dir || "",
    contextPercent: 0,
    usageWindows: [],
    gitBranch: null,
    gitUnstaged: 0,
    gitStaged: 0,
    gitAhead: 0,
    gitBehind: 0,
    costText: "",
    linesAdded: 0,
    linesRemoved: 0,
    transcript: [],
  };

  // Context window size & usage
  if (payload.context_window) {
    const size = payload.context_window.context_window_size || 0;
    const usage = payload.context_window.current_usage?.input_tokens || 0;
    if (size > 0) {
      ctx.contextPercent = Math.round((usage / size) * 100);
    }
  }

  // Quota display eligibility and cache
  const showQuota = config.statuslineQuota !== false;
  const eligibility = resolveQuotaDisplayEligibility({
    env: process.env,
    useCache: true,
  });

  if (showQuota && eligibility.eligible) {
    const cachePath = getUsageCachePath();
    const cache = readUsageCache(cachePath);
    if (
      cache &&
      cache.status === "available" &&
      Date.now() - cache.timestamp < 300000
    ) {
      const data = cache.data || {};
      const snapshot = cache.snapshot || {
        fiveHourPercent: normalizeUtilization(data.five_hour?.utilization),
        weekPercent: normalizeUtilization(data.seven_day?.utilization),
      };

      if (typeof snapshot.fiveHourPercent === "number") {
        let chip = `5h ${snapshot.fiveHourPercent}%`;
        const resetsAt = data.five_hour?.resets_at;
        if (resetsAt) {
          const resetTime = formatResetTime(resetsAt);
          if (resetTime) {
            chip += ` (${resetTime})`;
          }
        }
        ctx.usageWindows.push(chip);
      }

      if (typeof snapshot.weekPercent === "number") {
        let chip = `wk ${snapshot.weekPercent}%`;
        const resetsAt = data.seven_day?.resets_at;
        if (resetsAt) {
          const resetTime = formatResetTime(resetsAt);
          if (resetTime) {
            chip += ` (${resetTime})`;
          }
        }
        ctx.usageWindows.push(chip);
      }
    }
  }

  // Git info
  if (payload.workspace?.current_dir) {
    const gitInfo = getGitInfo(payload.workspace.current_dir);
    if (gitInfo) {
      ctx.gitBranch = gitInfo.branch;
      ctx.gitUnstaged = gitInfo.unstaged;
      ctx.gitStaged = gitInfo.staged;
      ctx.gitAhead = gitInfo.ahead;
      ctx.gitBehind = gitInfo.behind;
    }
  }

  // Cost & Changes
  if (payload.cost) {
    const usd = payload.cost.total_cost_usd;
    if (usd !== undefined && usd !== null) {
      ctx.costText = `$${usd}`;
    }
    ctx.linesAdded = payload.cost.total_lines_added || 0;
    ctx.linesRemoved = payload.cost.total_lines_removed || 0;
  }

  // Transcript
  if (payload.transcript_path) {
    ctx.transcript = await parseTranscript(payload.transcript_path);
  } else if (payload.session_id) {
    // If no transcript_path is supplied but session_id is, try to load cached statusline activity
    const sessionState = readSessionState(payload.session_id);
    if (sessionState?.statusline) {
      ctx.transcript = {
        sessionStart:
          sessionState.statusline.sessionStart || new Date().toISOString(),
        agents: sessionState.statusline.agents || [],
        todos: sessionState.statusline.todos || [],
      };
    }
  }

  // Render based on mode
  if (config.statusline === "none") {
    // Exit silently
  } else if (config.statusline === "minimal") {
    renderMinimal(ctx, layout);
  } else if (config.statusline === "compact") {
    renderCompact(ctx, layout);
  } else {
    render(ctx, layout, false);
  }
}

main().catch(() => {
  process.exit(0);
});
