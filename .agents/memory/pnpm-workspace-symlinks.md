---
name: pnpm workspace symlinks
description: Recovering workspace dependency links after package changes.
---

If esbuild cannot resolve dependencies imported from a workspace library after package changes, check the library's `node_modules` symlinks and run `pnpm install` before changing build configuration.

**Why:** A package update left stale links in the database workspace. TypeScript checks and app code could still run, but the API bundle failed to resolve Drizzle imports until the workspace install relinked dependencies.

**How to apply:** After adding or updating packages, if a build reports unresolved imports from another workspace package, run the root `pnpm install` and retry the build before editing bundler settings.
