---
name: DB schema nullable migration
description: How to apply non-interactive schema changes when drizzle-kit push requires user input
---

## Rule
`drizzle-kit push` (pnpm run push in lib/db) prompts interactively for constraint changes (e.g. adding UNIQUE, dropping NOT NULL). It cannot be piped non-interactively. Use `executeSql()` in the code_execution sandbox to run direct SQL instead.

**Why:** The drizzle-kit CLI uses a TUI (interactive terminal) for confirmation prompts; shell piping does not satisfy it and the command hangs/terminates.

**How to apply:** For schema-level changes that affect existing data (ALTER TABLE ... DROP NOT NULL, ADD CONSTRAINT), skip `pnpm run push` and run the raw SQL directly via `executeSql({ sqlQuery: "ALTER TABLE ..." })` in the code_execution notebook. Then update the Drizzle schema file to match — the schema file is the source of truth for TypeScript types, the SQL ensures the DB matches.
