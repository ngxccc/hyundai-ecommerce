#!/usr/bin/env node

/**
 * Detects skills whose version was not bumped after subsequent content changes.
 *
 * For each skill dir under .claude/skills and .omp/skills:
 *   - last_touch  = newest commit touching anything in the skill dir
 *   - last_bump   = newest commit that changed the `version` line in SKILL.md
 *                   (uses `git log -L` line-history, so reformatting that does not
 *                   actually change the value is not counted as a bump)
 *
 * Status taxonomy:
 *   OK            last_bump == last_touch, OR last_bump committed at-or-after last_touch
 *   STALE         last_touch is newer than last_bump → version needs a bump
 *   DIRTY         working tree has uncommitted edits inside the skill dir
 *   NEVER_BUMPED  SKILL.md has no commit that ever wrote a `version:` line,
 *                 yet other commits touch the skill
 *
 * Usage:
 *   node scripts/check-versions.mjs            # human table
 *   node scripts/check-versions.mjs --json     # machine output (one row per skill)
 *   node scripts/check-versions.mjs --root DIR # operate on a different repo (tests)
 *
 * Exits 0 if every skill is OK, 1 otherwise.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

const args = process.argv.slice(2);
const JSON_OUT = args.includes("--json");
const rootArgIdx = args.indexOf("--root");
const ROOT =
  rootArgIdx >= 0
    ? args[rootArgIdx + 1]
    : new URL("../../../..", import.meta.url).pathname.replace(/\/$/, "");

function git(gitArgs, opts = {}) {
  return execFileSync("git", gitArgs, {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
}

function listSkills() {
  const skills = [];
  // Support both custom test roots (which might just have "skills/.curated" etc.)
  // and the standard ag-kit folders (.claude/skills, .omp/skills).
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
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;
      skills.push({
        name: entry.name,
        tier: dir,
        absDir: join(dirPath, entry.name),
        relDir: join(dir, entry.name),
      });
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function readVersion(skill) {
  const p = join(skill.absDir, "SKILL.md");
  if (!existsSync(p)) return null;
  try {
    const content = readFileSync(p, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const parsed = yaml.load(match[1]);
    if (parsed && typeof parsed === "object") {
      const version = parsed.version || parsed.metadata?.version;
      return typeof version === "string" ? version : null;
    }
    return null;
  } catch {
    return null;
  }
}

// Newest commit touching anything inside the skill dir.
function lastTouch(skill) {
  try {
    const out = git([
      "log",
      "-1",
      "--format=%H%x09%ct",
      "--",
      skill.relDir,
    ]).trim();
    if (!out) return null;
    const [sha, ct] = out.split("\t");
    return { sha, time: Number(ct) };
  } catch {
    return null;
  }
}

// Newest commit that actually changed the `version` line in SKILL.md.
function lastBump(skill) {
  const file = join(skill.relDir, "SKILL.md");
  const absFile = join(ROOT, file);
  if (!existsSync(absFile)) return null;
  try {
    const content = readFileSync(absFile, "utf-8");
    if (!content.includes("version:")) {
      return null;
    }
    const out = git([
      "log",
      "-1",
      "--format=%H%x09%ct",
      "-L",
      `/version:/,+1:${file}`,
    ]).trim();
    if (!out) return null;
    // -L prepends the diff after the format line; take only the first line.
    const first = out.split("\n")[0];
    const [sha, ct] = first.split("\t");
    if (!sha) return null;
    return { sha, time: Number(ct) };
  } catch {
    return null;
  }
}

// Any uncommitted change inside the skill dir.
function isDirty(skill) {
  try {
    const out = git(["status", "--porcelain", "--", skill.relDir]);
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

// True if `ancestor` is reachable from `descendant` via parent links.
// Falls back to false on error (e.g. unrelated SHAs).
function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function classify(skill) {
  const version = readVersion(skill);
  if (isDirty(skill)) {
    return { status: "DIRTY", version, touch: null, bump: null };
  }
  const touch = lastTouch(skill);
  const bump = lastBump(skill);
  if (!touch) {
    return { status: "OK", version, touch, bump };
  }
  if (!bump) {
    return { status: "NEVER_BUMPED", version, touch, bump };
  }
  if (bump.sha === touch.sha) {
    return { status: "OK", version, touch, bump };
  }
  // Topological compare: STALE iff bump is a strict ancestor of touch,
  // i.e. touch came after bump in history. Timestamps tie when commits
  // land in the same second; ancestry is the authoritative ordering.
  if (isAncestor(bump.sha, touch.sha)) {
    return { status: "STALE", version, touch, bump };
  }
  return { status: "OK", version, touch, bump };
}

function shortSha(sha) {
  return sha ? sha.slice(0, 7) : "-";
}

function isoDate(ts) {
  return ts ? new Date(ts * 1000).toISOString().slice(0, 10) : "-";
}

function main() {
  const skills = listSkills();
  const rows = skills.map((s) => {
    const r = classify(s);
    return {
      skill: s.name,
      tier: s.tier,
      version: r.version,
      status: r.status,
      last_bump_sha: r.bump?.sha ?? null,
      last_bump_date: r.bump ? isoDate(r.bump.time) : null,
      last_touch_sha: r.touch?.sha ?? null,
      last_touch_date: r.touch ? isoDate(r.touch.time) : null,
    };
  });

  if (JSON_OUT) {
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
    process.exit(0);
  } else {
    const header = ["STATUS", "TIER", "SKILL", "VERSION", "BUMP", "TOUCH"];
    const widths = header.map((h) => h.length);
    const data = rows.map((r) => [
      r.status,
      r.tier.replace(/^\./, ""),
      r.skill,
      r.version ?? "-",
      `${shortSha(r.last_bump_sha)} ${r.last_bump_date ?? "-"}`,
      `${shortSha(r.last_touch_sha)} ${r.last_touch_date ?? "-"}`,
    ]);
    for (const row of data) {
      row.forEach((cell, i) => {
        if (cell.length > widths[i]) widths[i] = cell.length;
      });
    }
    const fmt = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join("  ");
    process.stdout.write(`${fmt(header)}\n`);
    process.stdout.write(`${widths.map((w) => "-".repeat(w)).join("  ")}\n`);
    for (const row of data) process.stdout.write(`${fmt(row)}\n`);

    const counts = rows.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
    process.stdout.write(
      `\n${rows.length} skills — ` +
        Object.entries(counts)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ") +
        "\n",
    );
  }

  const bad = rows.some((r) => r.status !== "OK");
  process.exit(bad ? 1 : 0);
}

main();
