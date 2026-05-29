const { test } = require('node:test');
const assert = require('node:assert/strict');

const { handleSessionStateEvent } = require('../session-state.cjs');

test('handleSessionStateEvent returns null when disabled', async () => {
  const result = await handleSessionStateEvent({
    session_id: 'test-session',
    transcript_path: '/tmp/test.jsonl',
    cwd: process.cwd(),
    hook_event_name: 'PostToolUse',
  }, {
    enabled: false,
  });

  assert.deepEqual(result, {
    ok: true,
    action: 'skipped-disabled',
  });
});
