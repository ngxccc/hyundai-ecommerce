---
name: prohibit-db-mutating-scripts
description: "Block running database migration, push, seed, baseline, and reset scripts without explicit user permission"
condition: "(?:\\b(?:db:(?:migrate|push|seed|reset-schema|baseline)|drizzle-kit\\s+(?:migrate|push|drop)|scripts/reset-db\\.ts|src/database/seeds/index\\.ts)\\b)"
scope: "tool:bash(*)"
---

# Prohibit Database Mutating & Seed Scripts

- **No Autonomous DB Mutations**: AI agents MUST NEVER autonomously run database schema mutations, migrations, pushes, baseline injections, resets, or seeding scripts (`db:migrate`, `db:push`, `db:seed`, `db:reset-schema`, `db:baseline`, `drizzle-kit migrate`, `drizzle-kit push`).
- **Human Authority for Database State**: Any execution that alters database tables, drops columns, resets schemas, or injects seed data directly impacts shared developer or test databases and MUST be executed manually by the human developer.
- **Allowed DB Commands**: Non-destructive read-only tooling or schema generation commands (such as `bun run db:generate` or `bun run openapi:generate`) are permitted when generating static artifacts.
