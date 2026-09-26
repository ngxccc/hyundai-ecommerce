---
name: no-manual-memo-with-react-compiler
description: "Rely on React Compiler for automatic memoization instead of adding manual useMemo/useCallback"
condition: "(?:const\\s+\\w+\\s*=\\s*useMemo\\(|const\\s+\\w+\\s*=\\s*useCallback\\()"
scope:
  [
    "tool:write(admin/**/*.tsx)",
    "tool:edit(admin/**/*.tsx)",
    "tool:write(storefront/**/*.tsx)",
    "tool:edit(storefront/**/*.tsx)",
  ]
---

# React Compiler Auto-Memoization

Both `admin` and `storefront` run React 19 with React Compiler (`reactCompiler: true`). Write straightforward functions and derived state without manual `useMemo` or `useCallback`.
