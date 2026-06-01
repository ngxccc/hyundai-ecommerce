#!/usr/bin/env node
/**
 * PreToolUse hook: Enforces strict-paths.md rules directly
 *
 * Prevents AI from creating task.md, walkthrough.md, or implementation_plan.md
 * inside the internal appDataDir directories. Forces updates to the SSOT
 * plan files in process/general-plans/active/ instead.
 */

try {
  const fs = require("fs");

  let input = "";
  const stdin = fs.readFileSync(0, "utf8");
  if (stdin) {
    input = stdin;
  }

  const hookData = JSON.parse(input || "{}");
  const toolName = hookData.tool_name || "";
  const toolInput = hookData.tool_input || {};

  // We care about file-writing tools for Antigravity and Claude
  const writeTools = [
    "write_to_file",
    "replace_file_content",
    "multi_replace_file_content",
    "Write",
    "Edit",
    "MultiEdit",
  ];

  if (writeTools.includes(toolName)) {
    // Determine the target file path depending on the tool interface
    const targetFile =
      toolInput.TargetFile || toolInput.file_path || toolInput.path || "";

    if (targetFile) {
      const isInternalPath =
        targetFile.includes(".gemini/antigravity-cli/brain/") ||
        targetFile.includes(".claude/brain/") ||
        targetFile.includes("appDataDir/brain/");

      //  targetFile.endsWith('task.md') ||
      //   targetFile.endsWith('walkthrough.md') ||
      const isForbiddenFile = targetFile.endsWith("implementation_plan.md");

      if (isInternalPath && isForbiddenFile) {
        // Block the action
        const errorMessage =
          `[STRICT PATH ENFORCEMENT] You are strictly forbidden from writing to ${targetFile}. ` +
          `You MUST NOT create internal tracking artifacts. Instead, you MUST update the Single Source of Truth (SSOT) ` +
          `active plan file located in process/general-plans/active/ (or process/features/*/active/). ` +
          `Update your checklist and status directly inside the *_PLAN_*.md file.`;

        console.log(
          JSON.stringify({
            continue: false,
            error: errorMessage,
          }),
        );
        // Must exit with non-zero status so ag-adapter.cjs detects it as a denial
        process.exit(1);
      }
    }
  }

  // Allow the tool to continue normally
  console.log(JSON.stringify({ continue: true }));
} catch (e) {
  // On error, let the tool proceed so we don't block work due to hook bugs
  console.log(JSON.stringify({ continue: true }));
}
