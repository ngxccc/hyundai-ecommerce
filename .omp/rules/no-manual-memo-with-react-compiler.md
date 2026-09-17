---
name: no-manual-memo-with-react-compiler
description: "Avoid suggesting or adding redundant manual useMemo/useCallback when React Compiler is enabled"
condition: "(?:Dùng\\s+`?useMemo`?|const\\s+\\w+\\s*=\\s*useMemo\\()"
scope: ["text", "tool:edit(*.tsx)", "tool:write(*.tsx)"]
---

React 19 with React Compiler (`reactCompiler: true`) automatically optimizes and memoizes component outputs and calculations at build time. Do not introduce redundant manual `useMemo` or `useCallback` boilerplate.
