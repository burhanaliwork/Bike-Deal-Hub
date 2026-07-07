---
name: Account auth revocation
description: Why the custom HMAC token auth revalidates accounts against the DB on protected routes.
---

The site uses custom username/password accounts with stateless HMAC-signed tokens (30-day TTL) whose payload embeds role and showroomId claims.

**Rule:** any middleware that grants admin or showroom privileges must revalidate the token's claims against the `accounts` table per request (account still exists, role and showroomId unchanged).

**Why:** architect review flagged that trusting stateless claims alone means a deleted or demoted account keeps access until token expiry — verified by test: deleting a showroom cascades its account and its old token immediately gets 401.

**How to apply:** when adding new protected routes or roles, reuse the revalidation helper in the server's account auth lib rather than checking token claims alone.
