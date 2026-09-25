# BirdFeast — Custom Bird Feed E-Commerce Platform

*Custom Feed. Happier Birds.*

BirdFeast is a full-stack MERN application for a bird-feed business where customers build their own
custom feed mix (choose ingredients + quantities), see live pricing, check out with a delivery charge
shown separately, and track their order. Admins get a full dashboard to manage products, categories,
orders, customers, and delivery pricing rules.

This is a real working application — the frontend talks to a real Express/MongoDB backend, there is no
mock/static data for core functionality (products, orders, pricing, auth all come from the database).

---

## 1. Tech Stack

**Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router + Axios + React Hook Form

**Backend:** Node.js + Express + TypeScript + MongoDB + Mongoose + JWT auth + bcrypt

---

## 2. Project Structure

```
bird-feed-store/
  backend/
    src/
      config/       # MongoDB connection
      controllers/  # route handlers
      middleware/   # auth, error handling
      models/       # Mongoose schemas
      routes/       # Express routers
      services/     # pricingService.ts — the authoritative price/delivery calculator
      utils/        # seed.ts
      types/        # Express type augmentation
    .env.example
  frontend/
    src/
      components/   # Navbar, Footer, ProtectedRoute, shared UI
      context/       # Auth, Cart, Toast context providers
      layouts/       # PublicLayout, AdminLayout
      pages/          # all public + customer pages
      pages/admin/    # all admin pages
      services/       # axios instance
      types/          # shared TS types
    .env.example
```

---

## 3. Business Logic — Delivery Pricing (important)

Because every feed mix is prepared fresh and made to order, delivery is priced by weight and part of it
is collected **in advance** at checkout:

- Orders **under** the configured weight threshold (default **3 kg**) pay the **full** delivery fee.
- Orders **at or above** the threshold pay **half** the delivery fee — and that half is the amount
  collected as an advance payment at checkout.
- Admins can configure the base fee, the weight threshold, per-city extra fees, and an optional
  free-delivery weight threshold from **Admin → Delivery Settings**.
- Changing these settings only affects *future* orders — every placed order stores its own
  `deliveryFee`/`total`/`advancePaid` snapshot, so historical orders never change.

All of this is calculated in `backend/src/services/pricingService.ts` and is **always recalculated on
the server** from the current product prices — the frontend's live total is only a preview. This
matters: the frontend can never be trusted to set the final price.

---

## 4. Installation

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGODB_URI and a real JWT_SECRET
npm run seed     # creates demo admin/customer, categories, products, delivery settings
npm run dev      # starts the API on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point at the backend, e.g. http://localhost:5000/api
npm run dev      # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser. The backend must be running (and MongoDB reachable) for
the app to load any data.

---

## 5. Demo Accounts (after running `npm run seed`)

| Role     | Email                  | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@birdfeast.com    | Admin@123   |
| Customer | customer@birdfeast.com | Customer@123|

These are for **local development only** — never use these credentials in production.

---

## 6. API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                (protected)
PUT    /api/auth/me                (protected)

GET    /api/products
GET    /api/products/:id
POST   /api/products               (admin)
PUT    /api/products/:id           (admin)
DELETE /api/products/:id           (admin)

GET    /api/categories
POST   /api/categories             (admin)
PUT    /api/categories/:id         (admin)
DELETE /api/categories/:id         (admin)

GET    /api/cart                   (protected)
POST   /api/cart                   (protected)
DELETE /api/cart                   (protected)

POST   /api/orders/quote           (public price preview — no order created)
POST   /api/orders                 (protected — creates order, recalculates price server-side)
GET    /api/orders                 (protected — the logged-in user's own orders)
GET    /api/orders/:id             (protected — owner or admin only)
POST   /api/orders/:id/pay-test    (protected — simulated test payment, NOT real)

GET    /api/admin/dashboard        (admin)
GET    /api/admin/orders           (admin)
PUT    /api/admin/orders/:id/status(admin)
GET    /api/admin/users            (admin)

GET    /api/delivery/settings
PUT    /api/delivery/settings      (admin)
```

---

## 7. Security Notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- JWT auth with role-based middleware (`protect`, `adminOnly`) protects admin-only routes.
- All order pricing is recalculated server-side from the database — the client's numbers are never
  trusted for the final charge.
- Basic rate limiting is applied to `/api/auth` to slow brute-force attempts.
- `.env` files are git-ignored; only `.env.example` files are committed.

---

## 8. Payment

The current payment flow is a **safe development/test flow only** — `POST /api/orders/:id/pay-test`
simulates a successful payment and clearly labels itself as a simulation in its response. No real
money moves. The `Order.payment` sub-document (`status`, `method`, `referenceId`, `amount`, `paidAt`)
is structured so a real provider (e.g. Stripe) can be dropped in to replace only that one endpoint,
without touching order creation, pricing, or the rest of the app.

---

## 9. Known Limitations / Future Improvements

- No real payment gateway integration yet (see above).
- No email notifications yet — the backend is structured so they can be added without restructuring
  orders/auth.
- Product images use a placeholder icon rather than uploaded photos; add an image upload flow when
  wiring in real photography.
- No automated test suite yet.

---

## 10. Running Locally — Quick Checklist

1. Start MongoDB.
2. `cd backend && npm install && npm run seed && npm run dev`
3. `cd frontend && npm install && npm run dev`
4. Visit http://localhost:5173, log in with a demo account, and try:
   - Customize a feed → Cart → Checkout → pay the test advance
   - Log in as admin → Admin Dashboard → try Manage Products / Orders / Delivery Settings

This project was built for local development and testing first — it has **not** been deployed
anywhere automatically.
