# Ride iQ — سوق الدراجات

A full-stack Arabic bike marketplace for Iraq, branded as "Ride iQ", inspired by iqcars.net layout with a distinct navy-blue identity. Users buy and sell bikes with direct phone/WhatsApp contact. Prices are in Iraqi Dinar (د.ع / IQD), no login/sign-up required to post or browse.

## Architecture

**Monorepo** managed by pnpm workspace.

### Services
- **Frontend** (`artifacts/bike-market`) — React + Vite, port 25990, preview path `/`
- **API Server** (`artifacts/api-server`) — Express + Clerk auth, port 8080, path `/api`
- **Database** — PostgreSQL via Drizzle ORM (`lib/db`)
- **API Client** — Generated via Orval from OpenAPI spec (`lib/api-client-react`, `lib/api-spec`)

### Key Libraries
- **Auth**: Clerk (`@clerk/react`, `@clerk/express`) with proxy middleware
- **UI**: Tailwind v4, shadcn/ui components, `@clerk/themes` (shadcn theme)
- **Routing**: Wouter (base path aware)
- **Data fetching**: TanStack Query v5 + Orval-generated hooks
- **ORM**: Drizzle ORM + pg
- **Object storage**: `@workspace/object-storage-web` (`useUpload` hook) + `@workspace/object-storage` server routes for multi-image bike listing uploads

## Features

- **Homepage** — top CTA banner ("بيع دراجتك اليوم مجاناً") with bicycle/e-bike/motorcycle illustration, list-view listings feed, no filter shown until user taps "بحث"
- **Listings** — Search/filter by bike type (bicycle/electric/motorcycle), bicycle category (mountain/road/hybrid/kids), condition, price range (IQD) with iqcars-style list cards
- **Bike Detail** — Full info, Call Seller button, WhatsApp button, favorites
- **Sell** — Bike type selector first (كهربائية/نارية/هوائية), bicycle sub-category (جبلي/رود/هجين/الأطفال), brand ("شركة الدراجة"), condition (جديد/مستخدم), motorcycle-only mileage ("الممشى"), description ("مواصفات الدراجة"), multi-image upload (min 2 images via object storage), phone number ("رقم التليفون", Iraqi 07XXXXXXXXX format) — no login required
- **My Listings** — View/delete own listings, mark as sold
- **Favorites** — Save bikes for later
- **Admin Dashboard** — Stats overview, approve/reject/mark-sold listings, user list
- **No Auth** — Site has no sign-in/sign-up; all pages and actions (including posting listings) are open

## Database Schema (`lib/db/src/schema/bikes.ts`)

- `bikes` — bike listings (id, title, description, price, category, condition, brand, phone, images text[], mileage integer — motorcycle-only, status, userId, userName, userEmail)
- `favorites` — user→bike favorites
- `users` — synced from Clerk auth tokens

## API Routes (`artifacts/api-server/src/routes/bikes.ts`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/bikes | List active bikes (search, filter) |
| POST | /api/bikes | Create bike (auth required) |
| GET | /api/bikes/:id | Get single bike |
| PATCH | /api/bikes/:id | Update bike (owner only) |
| DELETE | /api/bikes/:id | Delete bike (owner only) |
| GET | /api/bikes/my-bikes | My listings |
| GET | /api/bikes/stats | Public stats + recent listings |
| GET | /api/favorites | Get favorites (auth required) |
| POST | /api/favorites/:bikeId | Add favorite |
| DELETE | /api/favorites/:bikeId | Remove favorite |
| GET | /api/admin/stats | Admin stats |
| GET | /api/admin/bikes | All bikes (admin) |
| PATCH | /api/admin/bikes/:id/status | Update bike status |
| GET | /api/admin/users | All users (admin) |

## Admin Access

Set `role: "admin"` in a user's Clerk public metadata to grant admin access.

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

- **Brand**: Ride iQ — wheel SVG logo, `ride` text + `iQ` blue badge
- **Theme**: Deep navy (#0D1B35) + vibrant blue (hsl 213 88% 50%) on light gray background
- **Language**: Arabic (RTL), English brand name "Ride iQ"
- **Market**: Iraq — currency is Iraqi Dinar (د.ع / IQD), phone format 07XXXXXXXXX
- **Layout**: iqcars.net-inspired — sticky white navbar with "بحث" + "بيع دراجتك" buttons, list-view cards (small image on one side, details + price on the other)
