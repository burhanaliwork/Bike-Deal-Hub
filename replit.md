# سوق الدراجات — Bike Market

A full-stack Arabic/English bike marketplace for Saudi Arabia, where users can buy and sell bikes with direct phone contact.

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

## Features

- **Homepage** — Arabic hero, search, category browse, recent listings, trust section
- **Listings** — Search/filter by category, condition, price range
- **Bike Detail** — Full info, Call Seller button, WhatsApp button, favorites
- **Sell** — Create listing form with image URL, phone number
- **My Listings** — View/delete own listings, mark as sold
- **Favorites** — Save bikes for later
- **Admin Dashboard** — Stats overview, approve/reject/mark-sold listings, user list
- **Auth** — Clerk sign-in/sign-up with branded UI (orange theme, SVG logo)

## Database Schema (`lib/db/src/schema/bikes.ts`)

- `bikes` — bike listings (id, title, description, price, category, condition, brand, phone, imageUrl, status, userId, userName, userEmail)
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

- **Theme**: Warm amber/orange (`hsl(25, 95%, 50%)`) on light cream background
- **Language**: Arabic primary (RTL text), English labels
- **Currency**: SAR (Saudi Riyal)
