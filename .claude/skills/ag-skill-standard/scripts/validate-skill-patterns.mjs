#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const legacySkills = new Set([
  "ag-agent-browser",
  "ag-audit-ag",
  "ag-audit-context",
  "ag-audit-plans",
  "ag-autoresearch",
  "ag-chrome-devtools",
  "ag-context-engineering",
  "ag-debug",
  "ag-docs",
  "ag-docs-seeker",
  "ag-frontend-design",
  "ag-generate-context",
  "ag-generate-plan",
  "ag-mcp-management",
  "ag-merge-worktree",
  "ag-predict",
  "ag-preview",
  "ag-problem-solving",
  "ag-publish",
  "ag-repomix",
  "ag-scenario",
  "ag-scout",
  "ag-security",
  "ag-sequential-thinking",
  "ag-setup",
  "ag-team",
  "ag-tech-graph",
  "ag-update",
  "ag-watzup",
  "ag-web-testing",
  "ag-xia",
  "ag-zod",
  "ag-code-simplifier",
  "ag-implementation-design-patterns",
  "ag-implementation-functional-patterns",
  "ag-nextjs",
  "ag-nextjs-bundle-optimizer",
  "ag-nextjs-ppr-patterns",
  "ag-react-hook-form",
  "ag-react-hook-form-audit",
  "ag-tailwind",
  "ag-tailwind-refactor",
  "ag-tailwind-responsive-ui",
  "ag-tailwind-ui-refactor",
  "ag-typescript",
  "ag-typescript-advanced-patterns",
  "ag-typescript-refactor",
  "ag-ui-design",
]);

const skillDirs = [
  { path: "./.claude/skills", type: "Claude" },
  { path: "./.omp/skills", type: "OMP" },
];

let failures = 0;

function logError(file, message) {
  console.error(
    `${colors.bold}${colors.red}FAIL:${colors.reset} [${file}] ${message}`,
  );
  failures++;
}

function logSuccess(file, message) {
  console.log(`${colors.green}PASS:${colors.reset} [${file}] ${message}`);
}

// Check every skill directory
for (const group of skillDirs) {
  if (!fs.existsSync(group.path)) continue;

  const dirs = fs
    .readdirSync(group.path)
    .filter((d) => fs.statSync(path.join(group.path, d)).isDirectory());

  for (const dir of dirs) {
    if (legacySkills.has(dir)) {
      continue;
    }

    const skillFile = path.join(group.path, dir, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      logError(skillFile, "SKILL.md is missing in skill folder.");
      continue;
    }

    const content = fs.readFileSync(skillFile, "utf8");

    // 1. Validate YAML Frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      logError(skillFile, "Missing YAML frontmatter block.");
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*([^\n]+)/m);
    const descMatch = frontmatter.match(/^description:\s*([^\n]+)/m);

    if (!nameMatch) {
      logError(skillFile, "Frontmatter is missing 'name' field.");
    } else {
      const name = nameMatch[1].replace(/['"]/g, "").trim();
      if (name !== dir) {
        logError(
          skillFile,
          `Frontmatter name '${name}' must match folder name '${dir}'.`,
        );
      }
    }

    if (!descMatch) {
      logError(skillFile, "Frontmatter is missing 'description' field.");
    } else {
      const desc = descMatch[1].replace(/['"]/g, "").trim();
      if (!/\b(use|when|for)\b/i.test(desc)) {
        logError(
          skillFile,
          "Description missing trigger language: must contain 'use', 'when', or 'for'.",
        );
      }
      if (desc.length < 24) {
        logError(
          skillFile,
          "Description is too short (must be at least 24 characters).",
        );
      }
    }

    // 2. Validate H2 Markdown headings

    const headings = ["## When to Apply", "## How to Use", "## References"];

    for (const heading of headings) {
      // Escape heading regex
      const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const headingRegex = new RegExp(`^${escapedHeading}\\s*$`, "m");
      if (!headingRegex.test(content)) {
        logError(skillFile, `Missing mandatory markdown heading '${heading}'.`);
      }
    }

    if (failures === 0) {
      logSuccess(skillFile, `Skill pattern complies with standards.`);
    }
  }
}

if (failures > 0) {
  console.error(
    `\n${colors.bold}${colors.red}Validation failed with ${failures} error(s).${colors.reset}\n`,
  );
  process.exit(1);
} else {
  console.log(
    `\n${colors.bold}${colors.green}All skills comply with structural pattern standards!${colors.reset}\n`,
  );
  process.exit(0);
}
