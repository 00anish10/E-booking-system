# ReadVerse

A full-stack reading platform for discovering books, previewing them for free, buying them, and tracking reading progress. Built with React, Vite, Tailwind CSS, Fastify, and PostgreSQL.

## Features

- **Authentication** — JWT auth with bcrypt password hashing, protected routes, and session restoration.
- **Catalog** — server-side search, category filters, rating/price filters, sorting, and pagination.
- **Book details** — ratings, reviews, wishlist, free previews, and related books.
- **Cart and checkout** — persistent cart, quantity controls, coupons, order creation, and purchase history.
- **Personal library** — owned books, reading progress, completed books, and reading stats.
- **Reader** — paginated reading experience with font controls, theme switching, bookmarks, progress saving, keyboard navigation, and preview locks for unowned books.
- **Dashboard** — reading activity, current books, recommendations, and recent orders.
- **Polish** — responsive layouts, dark mode, Framer Motion animations, skeletons, toasts, and accessible form validation.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion |
| Data fetching | TanStack Query |
| Forms | react-hook-form, yup |
| Backend | Fastify 5, TypeScript, zod, JWT |
| Database | PostgreSQL, `pg` |
| Tooling | Biome, tsx, concurrently |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Default local values:

```env
DATABASE_URL=postgresql://localhost:5432/readverse
JWT_SECRET=replace-with-a-long-random-secret
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

If your PostgreSQL role requires a password, include it in `DATABASE_URL`.

### 3. Create the database and seed data

```bash
createdb readverse
npm run db:setup
```

`db:setup` creates the schema and seeds 20 books, a demo user, a demo library, and reviews.

### 4. Run the app

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Health check: http://localhost:4000/api/health

You can also run each side separately:

```bash
npm run dev      # frontend
npm run server   # API with watch mode
```

### Demo account

```text
Email: demo@readverse.dev
Password: password123
```

### Coupons

| Code | Discount |
| --- | --- |
| `READ10` | 10% off |
| `READVERSE20` | 20% off |
| `SAVE5` | $5 off |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run server` | Start the API in watch mode |
| `npm run server:start` | Start the API once |
| `npm run dev:all` | Run frontend and API together |
| `npm run db:setup` | Create tables and seed demo data |
| `npm run typecheck` | Typecheck frontend and server |
| `npm run build` | Typecheck and build the frontend |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Biome lint |
| `npm run lint-fix` | Apply safe Biome lint fixes |
| `npm run format` | Check Biome formatting |
| `npm run format-fix` | Apply Biome formatting |

## API Overview

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/books` | Search, filter, sort, paginate books |
| `GET` | `/api/books/categories` | Category list |
| `GET` | `/api/books/:bookId` | Book details and reviews |
| `POST` | `/api/books/:bookId/reviews` | Add a review (auth) |
| `GET` | `/api/cart` | Current cart (auth) |
| `POST` | `/api/cart` | Add a book to cart (auth) |
| `PATCH` | `/api/cart/:bookId` | Update quantity (auth) |
| `DELETE` | `/api/cart/:bookId` | Remove a book (auth) |
| `DELETE` | `/api/cart` | Clear cart (auth) |
| `POST` | `/api/orders` | Checkout (auth) |
| `GET` | `/api/orders` | Order history (auth) |
| `GET` | `/api/library` | Owned books and stats (auth) |
| `PATCH` | `/api/library/:bookId/progress` | Save reading progress (auth) |
| `GET` | `/api/wishlist` | Wishlist (auth) |
| `POST` | `/api/wishlist/:bookId` | Add to wishlist (auth) |
| `DELETE` | `/api/wishlist/:bookId` | Remove from wishlist (auth) |
| `PATCH` | `/api/profile` | Update profile (auth) |
| `PATCH` | `/api/profile/password` | Change password (auth) |
| `GET` | `/api/coupons` | Available coupons |
| `GET` | `/api/stats` | Store statistics |

## Project Structure

```text
server/
  index.ts              Fastify app, CORS, error handling
  env.ts                Environment parsing
  db.ts                 PostgreSQL pool
  seed.ts               Schema + demo data seeding
  plugins/auth.ts       JWT authentication
  routes/               Auth, books, cart, orders, library, wishlist, profile, meta
src/
  components/           Shared UI, layout, header, footer, book cards
  contexts/             Auth, cart, theme, toast providers
  hooks/                Books, library, wishlist, debounce, document title
  lib/                  API client, types, query client, formatting, reader content
  pages/frontend-ui/    Home, catalog, book detail, cart, library, reader, auth, profile, orders
  pages/backend-ui/     Reading dashboard
  application.tsx       Routes
  index.css             Tailwind theme and custom utilities
```

## Notes

- Guest carts and wishlists are stored in `localStorage` and merged into the server after login.
- Wishlists are server-backed for authenticated users and stored locally for guests.
- The reader gives unowned users a five-page preview; purchased books unlock the full book.
- Reading progress is saved automatically while reading owned books.
- `DATABASE_URL` and `JWT_SECRET` should be changed before deploying.
