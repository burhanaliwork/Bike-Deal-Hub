---
name: Object storage web lib dependency install
description: Why a lib package (e.g. object-storage-web) can fail typecheck with TS2307 for react/@uppy modules even though a consuming app resolves those same packages fine.
---

When a shared lib package (`lib/*`) declares `react`/`@uppy/*` deps but was scaffolded without its own `pnpm install`, `tsc --build` on the workspace can throw TS2307 "cannot find module" for those imports — even though the consuming artifact (e.g. a Vite app) has the same packages installed and typechecks in isolation.

**Why:** pnpm's workspace linking creates the module resolution `node_modules` state per-package; a lib added to the workspace after initial `pnpm install` (or one with `package.json` deps but never installed) won't have its own `node_modules` symlinks until you run `pnpm install` scoped to that lib (or a full workspace install).

**How to apply:** if a shared lib in `lib/*` produces TS2307 for its own declared dependencies during `tsc --build`, run `pnpm install` inside that lib's directory (or `pnpm install` at the workspace root) before assuming the import paths or package.json entries are wrong. Also remember composite libs referenced via TS project references need `"composite": true` in their own tsconfig, or the referencing project's build fails with TS6306.
