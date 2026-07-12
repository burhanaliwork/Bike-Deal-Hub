---
name: Express 5 wildcard routes
description: How to write catch-all SPA fallback routes in Express 5 (path-to-regexp v8)
---

## Rule
Do NOT use `app.get("*", handler)` or `app.get("(.*)", handler)` in Express 5 — path-to-regexp v8 throws `PathError: Missing parameter name`. Use `app.use(handler)` for catch-all SPA fallbacks.

**Why:** Express 5 upgraded to path-to-regexp v8, which requires all wildcard groups to be named (e.g. `/{*path}`). Bare `*` and regex groups `(.*)` are no longer accepted.

**How to apply:** Whenever writing a catch-all route (e.g. SPA fallback serving index.html), use `app.use((req, res, next) => { ... })` instead of `app.get("*", ...)`. This avoids the path-to-regexp v8 constraint entirely.
