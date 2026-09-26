---
name: prohibit-db-mutating-scripts
description: "Require human permission before executing database migrations, pushes, baseline, resets, or seeding scripts"
condition: "(?:\\b(?:db:(?:migrate|push|seed|reset-schema|baseline)|drizzle-kit\\s+(?:migrate|push|drop)|scripts/reset-db\\.ts|src/database/seeds/index\\.ts)\\b)"
scope: "tool:bash(*)"
---

# Database Mutating Scripts

Database state changes require explicit human confirmation:

1. **Human Authority**: AI MUST NOT run database migrations, schema pushes, baseline resets, or seeds (`db:migrate`, `db:push`, `db:seed`, `drizzle-kit migrate/push/drop`, `reset-db.ts`).
2. **Permitted Non-Destructive Tooling**: Static code/schema generators (`bun run db:generate`, `bun run openapi:generate`) are permitted without prior confirmation.
