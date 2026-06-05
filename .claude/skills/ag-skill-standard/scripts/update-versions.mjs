#!/usr/bin/env node

/**
 * Derives skill versions from git history using conventional commits.
 *
 * Logic:
 *   - First commit for a skill = 1.0.0
 *   - Each subsequent "feat:" commit = minor bump
 *   - Each subsequent "fix:" / "refactor:" / "chore:" / other commit = patch bump
 *
 * Usage: node scripts/update-versions.mjs [--dry-run]
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import yaml from "js-yaml";

const ROOT = new URL("../../../..", import.meta.url).pathname.replace(
  /\/$/,
  "",
);
const DRY_RUN = process.argv.includes("--dry-run");

function getSkillDirs() {
  const dirs = [];
  const directories = [
    ".claude/skills",
    ".omp/skills",
    "skills/.curated",
    "skills/.experimental",
  ];
  for (const dir of directories) {
    const dirPath = join(ROOT, dir);
    if (!existsSync(dirPath)) continue;
    for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        dirs.push(join(dirPath, entry.name));
      }
    }
  }
  return dirs;
}

function getGitLog(skillDir) {
  const rel = skillDir.replace(`${ROOT}/`, "");
  try {
    const out = execFileSync(
      "git",
      ["log", "--oneline", "--reverse", "--format=%s", "--", rel],
      { cwd: ROOT, encoding: "utf-8" },
    );
    return out
      .trim()
      .split("\n")
      .filter((l) => l.length > 0);
  } catch {
    return [];
  }
}

function deriveVersion(commits) {
  if (commits.length === 0) return "1.0.0";

  const major = 1;
  let minor = 0;
  let patch = 0;

  // First commit is always 1.0.0, process remaining
  for (let i = 1; i < commits.length; i++) {
    const msg = commits[i];
    if (/^feat(\(.*?\))?[!]?:/.test(msg)) {
      minor++;
      patch = 0;
    } else {
      // fix, refactor, chore, docs, style, perf, build, ci, test, etc.
      patch++;
    }
  }

  return `${major}.${minor}.${patch}`;
}

function readVersion(skillMd) {
  if (!existsSync(skillMd)) return null;
  try {
    const content = readFileSync(skillMd, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const parsed = yaml.load(match[1]);
    if (parsed && typeof parsed === "object") {
      return parsed.version || parsed.metadata?.version || null;
    }
    return null;
  } catch {
    return null;
  }
}

function updateSkillVersion(skillMd, newVersion) {
  const content = readFileSync(skillMd, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    const frontmatter = yaml.dump({
      name: basename(dirname(skillMd)),
      description: "Trigger/Use case description here",
      metadata: { version: newVersion },
    });
    writeFileSync(skillMd, `---\n${frontmatter}---\n\n${content}`);
    return;
  }

  const frontmatterStr = match[1];
  const parsed = yaml.load(frontmatterStr);

  if (parsed && typeof parsed === "object") {
    if (parsed.version) {
      parsed.version = newVersion;
    } else {
      if (!parsed.metadata) {
        parsed.metadata = {};
      }
      parsed.metadata.version = newVersion;
    }
  }

  const newFrontmatterStr = yaml.dump(parsed, { lineWidth: -1 }).trim();
  const newContent = content.replace(
    /^---\n([\s\S]*?)\n---/,
    `---\n${newFrontmatterStr}\n---`,
  );
  writeFileSync(skillMd, newContent, "utf-8");
}

function run() {
  const skillDirs = getSkillDirs();
  const changes = [];

  for (const dir of skillDirs) {
    const skillMd = join(dir, "SKILL.md");
    if (!existsSync(skillMd)) continue;

    const currentVersion = readVersion(skillMd) || "0.0.0";
    const commits = getGitLog(dir);
    const newVersion = deriveVersion(commits);
    const skillName = basename(dir);

    if (currentVersion !== newVersion) {
      changes.push({ skillName, currentVersion, newVersion, skillMd });
    }
  }

  if (changes.length === 0) {
    console.log("All versions are up to date.");
    return;
  }

  console.log(`Found ${changes.length} version update(s):\n`);
  const pad = Math.max(...changes.map((c) => c.skillName.length));

  for (const { skillName, currentVersion, newVersion, skillMd } of changes) {
    const arrow = `${currentVersion} → ${newVersion}`;
    console.log(`  ${skillName.padEnd(pad)}  ${arrow}`);

    if (!DRY_RUN) {
      updateSkillVersion(skillMd, newVersion);
    }
  }

  if (DRY_RUN) {
    console.log("\n(dry run — no files were modified)");
  } else {
    console.log(`\nUpdated ${changes.length} SKILL.md file(s).`);
  }
}

run();
