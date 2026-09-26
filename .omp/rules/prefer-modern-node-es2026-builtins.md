---
name: prefer-modern-node-es2026-builtins
description: "Use modern native ECMAScript built-ins instead of multi-step legacy loops, spreads, and helper boilerplate"
condition: "(?:error\\s+instanceof\\s+Error\\s*\\?\\s*error\\.message\\s*:\\s*[\"']Unknown error[\"']|for\\s*\\(\\s*const\\s+\\w+\\s+of\\s+[^)]+\\)\\s*\\{\\s*(?:let\\s+)?\\w+By\\w+\\.set|itemsBy\\w+\\.set\\()|JSON\\.parse\\s*\\(\\s*JSON\\.stringify\\s*\\([^)]+\\)\\)|\\[\\s*\\.\\.\\.\\w+\\s*\\]\\.sort\\("
scope: "text"
---

# Native Modern ECMAScript Built-ins

Write positive native primitives. Avoid multi-step loops, spread clones, and serialization workarounds:

1. **Grouping**: `Map.groupBy(items, fn)` / `Object.groupBy(items, fn)`.
2. **Immutable Arrays**:
   - Sort: `arr.toSorted(cmp)` (replaces `[...arr].sort(cmp)`)
   - Reverse: `arr.toReversed()` (replaces `[...arr].reverse()`)
   - Splice: `arr.toSpliced(start, count, ...items)`
   - Replace single element: `arr.with(index, value)` (replaces `[...arr]` + `arr[i] = val`)
   - Search from end: `arr.findLast(fn)` / `arr.findLastIndex(fn)`
3. **Set Algebra**:
   - `setA.intersection(setB)`
   - `setA.union(setB)`
   - `setA.difference(setB)` (replaces `arr.filter(x => !set.has(x))`)
   - `setA.symmetricDifference(setB)`
   - `setA.isSubsetOf(setB)` / `setA.isDisjointFrom(setB)`
4. **Deep Clone**: `structuredClone(obj)` (replaces `JSON.parse(JSON.stringify(obj))`).
5. **Promise Execution**:
   - Wrap sync/async uniformly: `Promise.try(fn)`.
   - External resolvers: `Promise.withResolvers()`.
6. **Error String**: `getErrorMessage(error)` or `String(error)`.
