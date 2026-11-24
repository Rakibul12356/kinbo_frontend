# Kinbo

Multi-category ecommerce frontend for Bangladesh — storefront, checkout, and admin dashboard.

**Live demo:** [https://kinbofrontend.vercel.app/](https://kinbofrontend.vercel.app//)

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4
- TanStack Query, i18next (EN/AR), Recharts, Lucide

Auth, catalog, orders, and reviews currently use **localStorage** mocks until the separate Express + MongoDB backend is wired (`BACKEND.md`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Demo logins

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | `admin@kinbo.com` | `Admin@123` |
| User  | (register via signup modal, or use seeded demo user if present) | — |

Admin entry: login → `/admin/dashboard`.

## Main routes

| Area | Path |
|------|------|
| Home / auth modal | `/` · `/?auth=login` |
| Products | `/products`, `/products/[id]` |
| Cart / checkout | `/cart`, `/checkout` |
| Orders | `/orders`, `/orders/[id]` |
| Account | `/account` |
| Admin | `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/reviews`, … |

## Deploy

Frontend is hosted on **Netlify**:  
[https://rococo-mousse-1f01f9.netlify.app/](https://rococo-mousse-1f01f9.netlify.app/)

Optional env (when API exists):

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com/api
```

## Backend

See [`BACKEND.md`](./BACKEND.md) for the planned separate JS Express + MongoDB + Nodemailer API (dummy payment, forget-password mail, step-by-step build order).
