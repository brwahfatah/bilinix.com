# Beeliin Hosting Frontend (Nuxt + WHMCS Bridge)

Nuxt frontend for hosting, VPS, domains, and client dashboard, now wired for a WHMCS backend (no Laravel required).

## What Changed

- Frontend API base now defaults to `"/api/whmcs"`.
- Added a Nuxt server-side WHMCS bridge:
  - `server/utils/whmcs.ts`
  - `server/api/whmcs/[...slug].ts`
- Auth, cart checkout, domain search, dashboard summary, services, and invoices are routed through this bridge.
- VPS items in cart now support explicit WHMCS mapping via `meta.whmcs_product_id`.

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure:

```bash
NUXT_WHMCS_API_URL=https://your-whmcs.tld
NUXT_WHMCS_API_IDENTIFIER=your_identifier
NUXT_WHMCS_API_SECRET=your_secret
NUXT_WHMCS_ACCESS_KEY=
NUXT_WHMCS_TOKEN_SECRET=replace-with-strong-random-secret

NUXT_PUBLIC_API_BASE=/api/whmcs
NUXT_PUBLIC_WHMCS_CLIENT_AREA_URL=https://your-whmcs.tld/clientarea.php
NUXT_PUBLIC_WHMCS_STORE_URL=https://your-whmcs.tld/cart.php
NUXT_PUBLIC_WHMCS_SUPPORT_URL=https://your-whmcs.tld/submitticket.php
```

Run locally:

```bash
npm run dev
```

## WHMCS Bridge Endpoints

The frontend uses these internal routes:

- `POST /api/whmcs/auth/login`
- `POST /api/whmcs/auth/register`
- `GET /api/whmcs/auth/me`
- `POST /api/whmcs/cart/sync`
- `POST /api/whmcs/cart/prepare`
- `POST /api/whmcs/cart/checkout`
- `POST /api/whmcs/domains/search`
- `GET /api/whmcs/domains/pricing`
- `GET /api/whmcs/vps/plans`
- `GET /api/whmcs/dashboard/summary`
- `GET /api/whmcs/servers`
- `GET /api/whmcs/servers/:id`
- `POST /api/whmcs/servers/:id/:action`
- `GET /api/whmcs/invoices`
- `GET /api/whmcs/invoices/:id`
- `POST /api/whmcs/invoices/:id/pay`

## Important Mapping Note

When adding VPS items to cart, include:

- `meta.whmcs_product_id`

If missing, checkout will reject the item because WHMCS `AddOrder` needs a product ID.

## Build

```bash
npm run build
```
