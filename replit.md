# motorby — سوق الدراجات

A full-stack Arabic bike marketplace for Iraq, branded as "motorby", inspired by iqcars.net layout with a distinct navy-blue identity. Users buy and sell bikes with direct phone/WhatsApp contact. Prices are in Iraqi Dinar (د.ع / IQD), no login/sign-up required to post or browse. Verified showrooms (صالات عرض) have credentialed accounts managed by the site admin.

## Architecture

**Monorepo** managed by pnpm workspace.

### Services
- **Frontend** (`artifacts/bike-market`) — React + Vite, port 25990, preview path `/`
- **API Server** (`artifacts/api-server`) — Express, port 8080, path `/api`
- **Database** — PostgreSQL via Drizzle ORM (`lib/db`)
- **API Client** — Generated via Orval from OpenAPI spec (`lib/api-client-react`, `lib/api-spec`)

### Key Libraries
- **Auth (accounts)**: Custom username/password accounts (scrypt hashes + HMAC-signed tokens) in `artifacts/api-server/src/lib/accountAuth.ts`; frontend store in `artifacts/bike-market/src/lib/accountAuth.ts` (localStorage key `motorby_auth`). Clerk is still wired in App.tsx but the site has no public sign-in.
- **UI**: Tailwind v4, shadcn/ui components
- **Routing**: Wouter (base path aware)
- **Data fetching**: TanStack Query v5 + Orval-generated hooks
- **ORM**: Drizzle ORM + pg
- **Object storage**: `@workspace/object-storage-web` (`useUpload` hook) + `@workspace/object-storage` server routes for image uploads (bike listings, showroom photos). Images stored as `/api/storage{objectPath}`.

## Features

- **Homepage** — top CTA banner ("بيع دراجتك اليوم مجاناً"), list-view listings feed
- **Listings** — Filter by bike type (bicycle/electric/motorcycle), bicycle category, condition, price range (IQD), papers (مع/بدون أوراق رسمية); no search bar on the listings page (filter via navbar "فلتر")
- **Bike Detail** — Full info, Call Seller button, WhatsApp button, papers badge; when the bike belongs to a showroom, shows a clickable showroom card (photo, "صالة عرض X", "صالة عرض معتمدة" badge, Google Maps link) linking to `/showrooms/:id`
- **Sell** — Bike type selector (كهربائية/نارية/هوائية), motorcycle-only mileage/engine capacity/papers, multi-image upload (min 2), phone (07XXXXXXXXX) — no login required. When a showroom account is logged in, the same page acts as "إضافة منتج" and supports edit mode via `?edit=<bikeId>`
- **Showrooms** — Public page `/showrooms/:id` (header with photo, verified badge, maps + call buttons, product grid). Showroom dashboard `/showroom` for credentialed showroom accounts: add/edit/delete products, mark sold/active, logout
- **Login** — `/login` (username/password) for admin + showroom accounts only; redirects by role
- **Admin Dashboard** — `/admin` (requires admin account login): stats, approve/reject/mark-sold listings, showrooms tab (create showroom + its credentials, upload photo, maps URL, delete), user list
- **No public auth** — Browsing and posting regular listings need no account

## Database Schema (`lib/db/src/schema/bikes.ts`)

- `bikes` — bike listings (…, mileage, engineCapacity, province, hasDelivery, hasDocuments, status, showroomId nullable FK, userId, userName, userEmail)
- `showrooms` — id, name, imageUrl, googleMapsUrl, phone, verified, createdAt
- `accounts` — username (unique), passwordHash (scrypt), role ('admin' | 'showroom'), showroomId nullable FK
- `favorites` — user→bike favorites
- `users` — legacy Clerk-synced users

## API Routes

Bikes/favorites/admin-bikes routes in `artifacts/api-server/src/routes/bikes.ts`; auth in `routes/auth.ts`; showrooms in `routes/showrooms.ts`.

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/bikes | List active bikes (filters incl. hasDocuments, showroomId; joins showroom) |
| POST | /api/bikes | Create bike |
| GET | /api/bikes/:id | Get single bike (includes showroom) |
| PATCH/DELETE | /api/bikes/:id | Update/delete bike (owner only) |
| POST | /api/auth/login | Username/password login → token |
| GET | /api/auth/me | Current account info |
| GET | /api/showrooms/:id | Public showroom profile (+bikesCount) |
| GET/POST | /api/admin/showrooms | Admin: list / create showroom + account |
| PUT/DELETE | /api/admin/showrooms/:id | Admin: update (opt. password reset) / delete (cascades) |
| GET/POST | /api/showroom/bikes | Showroom account: list own / create |
| PUT/DELETE | /api/showroom/bikes/:id | Showroom account: update (incl. status) / delete own |
| GET | /api/admin/stats, /api/admin/bikes, /api/admin/users | Admin data |
| PATCH | /api/admin/bikes/:id/status | Update bike status |

## Admin Access

An `admin` account exists in the `accounts` table (seeded). Login at `/login`. Admin creates showroom accounts from the "صالات العرض" tab.

## Codegen

```bash
pnpm --filter @workspace/api-spec run codegen
```

Regenerates React Query hooks and Zod schemas from `lib/api-spec/openapi.yaml`.

## Development

Both workflows run automatically:
- `artifacts/api-server: API Server` — Express server
- `artifacts/bike-market: web` — Vite dev server

## Design

- **Brand**: motorby — wheel SVG logo, "motor" navy + "by" blue, no gap
- **Theme**: Deep navy (#0D1B35) + vibrant blue (hsl 213 88% 50%) on light gray background
- **Language**: Arabic (RTL), English brand name "motorby"
- **Market**: Iraq — currency is Iraqi Dinar (د.ع / IQD), phone format 07XXXXXXXXX
- **Layout**: iqcars.net-inspired — sticky white navbar with "فلتر" + "بيع دراجتك" buttons, list-view cards
