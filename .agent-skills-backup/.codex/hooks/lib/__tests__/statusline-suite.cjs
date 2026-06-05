#!/usr/bin/env node
'use strict';

/**
 * Aggregate runner for statusline test suites.
 *
 * Run:
 *   node .codex/hooks/lib/__tests__/statusline-suite.cjs
 */

const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../../..');

const SUITES = [
  '.codex/hooks/lib/__tests__/usage-limits-cache.test.cjs',
  '.codex/hooks/lib/__tests__/statusline.test.cjs',
  '.codex/hooks/lib/__tests__/statusline-integration.test.cjs',
  '.codex/hooks/lib/__tests__/statusline-scenarios.test.cjs'
];

let failed = 0;

for (const suite of SUITES) {
  console.log('\n================================================');
  console.log(`Running: ${suite}`);
  console.log('================================================');

  const result = spawnSync('node', [suite], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    failed++;
  }
}

console.log('\n================================================');
console.log('STATUSLINE SUITE SUMMARY');
console.log('================================================');
console.log(`Suites run: ${SUITES.length}`);
console.log(`Suites failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}

console.log('All statusline suites passed.');
process.exit(0);
