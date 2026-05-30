#!/usr/bin/env node
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

// Safe JSON logging to prevent corrupting stdout and crashing the agent
function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
  process.exit(0);
}

try {
  const args = process.argv.slice(2);
  const eventType = args[0]; 
  const targetScriptRel = args[1];

  if (!targetScriptRel) {
    sendResponse({});
  }

  // Always resolve relative to workspace root (parent of .agents)
  const workspaceRoot = path.resolve(__dirname, '..');
  const targetScript = path.resolve(workspaceRoot, targetScriptRel);

  if (!fs.existsSync(targetScript)) {
    // Fail-open (allow) to avoid crashing the agent loop if Claude hook is missing
    if (eventType === 'PreToolUse') sendResponse({ decision: 'allow' });
    else if (eventType === 'PreInvocation') sendResponse({ injectSteps: [] });
    else sendResponse({});
  }

  let input = '';
  try {
    input = fs.readFileSync(0, 'utf-8');
  } catch(e) {}

  let payload = {};
  try { 
    if (input.trim()) payload = JSON.parse(input); 
  } catch (e) {}

  let claudeInput = payload;
  if (eventType === 'PreToolUse') {
    let mappedToolName = payload.toolCall?.name || '';
    if (mappedToolName === 'run_command') mappedToolName = 'Bash';
    else if (mappedToolName === 'write_to_file') mappedToolName = 'Write';
    else if (mappedToolName === 'replace_file_content' || mappedToolName === 'multi_replace_file_content') mappedToolName = 'Edit';
    else if (mappedToolName === 'view_file' || mappedToolName === 'read_url_content') mappedToolName = 'Read';
    else if (mappedToolName === 'find_by_name') mappedToolName = 'Glob';
    else if (mappedToolName === 'grep_search') mappedToolName = 'Grep';

    let argsMap = payload.toolCall?.args || {};
    let mappedArgs = { ...argsMap };
    // Map Antigravity args to Claude path-extractor args
    if (argsMap.CommandLine) mappedArgs.command = argsMap.CommandLine;
    if (argsMap.AbsolutePath) mappedArgs.file_path = argsMap.AbsolutePath;
    if (argsMap.TargetFile) mappedArgs.file_path = argsMap.TargetFile;
    if (argsMap.DirectoryPath) mappedArgs.file_path = argsMap.DirectoryPath;
    if (argsMap.SearchPath) mappedArgs.file_path = argsMap.SearchPath;
    if (argsMap.Query) mappedArgs.pattern = argsMap.Query;

    claudeInput = {
      tool_name: mappedToolName,
      tool_input: mappedArgs,
      cwd: payload.toolCall?.args?.Cwd || workspaceRoot
    };
  }

  let result = spawnSync('bun', ['run', targetScript], {
    input: JSON.stringify(claudeInput),
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: workspaceRoot // Execute Claude hooks from workspace root
  });

  if (result.error && result.error.code === 'ENOENT') {
    result = spawnSync('node', [targetScript], {
      input: JSON.stringify(claudeInput),
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: workspaceRoot
    });
  }

  const stderrStr = result.stderr ? result.stderr.toString().trim() : '';
  const stdoutStr = result.stdout ? result.stdout.toString().trim() : '';

  if (eventType === 'PreToolUse') {
    if (result.status === 0) {
      sendResponse({ decision: "allow" });
    } else {
      let reason = stderrStr || stdoutStr || `Blocked by ${path.basename(targetScript)}`;
      sendResponse({ decision: "deny", reason: reason });
    }
  } else if (eventType === 'PostToolUse') {
    sendResponse({});
  } else if (eventType === 'PreInvocation') {
    sendResponse({ injectSteps: [] });
  } else {
    sendResponse({});
  }

} catch (err) {
  // Ultimate fallback: fail-open to prevent crashing the agent
  if (process.argv[2] === 'PreToolUse') {
    sendResponse({ decision: 'allow' });
  } else if (process.argv[2] === 'PreInvocation') {
    sendResponse({ injectSteps: [] });
  } else {
    sendResponse({});
  }
}
