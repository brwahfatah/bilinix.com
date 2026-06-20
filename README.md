# Beeliin Hosting

A full-stack hosting SaaS frontend built with **Nuxt 4** that bridges directly to **WHMCS** via a built-in Nitro server layer — no separate Laravel backend required.

---

## Architecture

```
Browser / Client
      │
      ▼
┌─────────────────────────────────┐
│       Nuxt 4 Application        │
│                                 │
│  ┌──────────────────────────┐   │
│  │   Vue 3 + Pinia + Pages  │   │  ← SSR disabled on /dashboard/**
│  └──────────┬───────────────┘   │
│             │ fetch /api/whmcs  │
│  ┌──────────▼───────────────┐   │
│  │  Nitro Server Routes     │   │  ← server/api/whmcs/[...slug].ts
│  │  (WHMCS Bridge Layer)    │   │
│  └──────────┬───────────────┘   │
└─────────────┼───────────────────┘
              │ HTTPS POST (API credentials, server-side only)
              ▼
     ┌────────────────┐
     │   WHMCS        │  ← /includes/api.php
     │   (external)   │
     └────────────────┘
```

**Key principle:** All WHMCS API credentials stay server-side inside Nitro. The browser never sees them. Session tokens are HMAC-signed with `NUXT_WHMCS_TOKEN_SECRET`.

---

## Requirements

- **Node.js** >= 20.x
- **npm** >= 10.x
- A running **WHMCS** installation with API access enabled

---

## Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/brwahfatah/bilinix.com.git
cd bilinix.com

# 2. Install dependencies
npm install

# 3. Copy the example environment file
cp .env.example .env

# 4. Configure your .env (see Environment Variables section below)
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `NUXT_WHMCS_API_URL` | Yes | Full URL to your WHMCS installation (e.g. `https://billing.example.com`) |
| `NUXT_WHMCS_API_IDENTIFIER` | Yes | WHMCS API identifier |
| `NUXT_WHMCS_API_SECRET` | Yes | WHMCS API secret |
| `NUXT_WHMCS_ACCESS_KEY` | No | WHMCS access key (leave blank if not using) |
| `NUXT_WHMCS_TOKEN_SECRET` | Yes | Min 32 random characters — signs HMAC session tokens |
| `NUXT_WHMCS_DEPT_TECHNICAL` | No | WHMCS department ID for Technical (default: 1) |
| `NUXT_WHMCS_DEPT_BILLING` | No | WHMCS department ID for Billing (default: 2) |
| `NUXT_WHMCS_DEPT_SALES` | No | WHMCS department ID for Sales (default: 3) |
| `NUXT_WHMCS_DEPT_GENERAL` | No | WHMCS department ID for General (default: 4) |
| `NUXT_PUBLIC_API_BASE` | No | Internal API base path (default: `/api/whmcs`) |
| `NUXT_PUBLIC_APP_ENV` | No | `development` or `production` |
| `NUXT_PUBLIC_ENABLE_DEV_MOCKS` | No | Set `true` to enable dev mock login (see below) |

> **Security note:** `NUXT_WHMCS_TOKEN_SECRET` is the equivalent of a Laravel `APP_KEY`. Generate it with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Running Nuxt

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview the production build locally
npm run preview
```

The dev server starts at `http://localhost:3000`.

---

## Dev Mock Mode (FakeWhmcs)

When you don't have a WHMCS instance available locally, enable dev mock mode:

```env
NUXT_PUBLIC_ENABLE_DEV_MOCKS=true
```

This activates the `/api/dev/login` endpoint which accepts **any** email and password and returns a fake session token. This allows you to log in and navigate the dashboard without a live WHMCS connection.

**Dev test credentials (any values work):**
- Email: `dev@example.com`
- Password: `anything`

> Dev mock login is automatically disabled in production (`NODE_ENV !== 'development'` and `enableDevMocks !== true`).

---

## WHMCS Bridge Endpoints

All frontend API calls are routed through `server/api/whmcs/[...slug].ts`:

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/whmcs/auth/login` | — | Validate WHMCS credentials, issue session token |
| `POST` | `/api/whmcs/auth/register` | — | Create WHMCS client account |
| `GET` | `/api/whmcs/auth/me` | Bearer | Get current user profile |
| `PATCH` | `/api/whmcs/auth/profile` | Bearer | Update display name |
| `POST` | `/api/whmcs/auth/change-password` | Bearer | Change password |
| `POST` | `/api/whmcs/auth/forgot-password` | — | Trigger WHMCS password reset email |
| `POST` | `/api/whmcs/cart/sync` | — | Save cart snapshot to Nitro storage |
| `POST` | `/api/whmcs/cart/prepare` | — | Read saved cart snapshot |
| `POST` | `/api/whmcs/cart/checkout` | Bearer | Submit order to WHMCS |
| `POST` | `/api/whmcs/domains/search` | — | WHOIS availability check |
| `GET` | `/api/whmcs/domains/pricing` | — | Return TLD pricing list |
| `GET` | `/api/whmcs/domains` | Bearer | List client domains |
| `GET` | `/api/whmcs/domains/:id` | Bearer | Get single domain |
| `PATCH` | `/api/whmcs/domains/:id` | Bearer | Update domain settings |
| `POST` | `/api/whmcs/domains/:id/renew` | Bearer | Renew domain |
| `GET` | `/api/whmcs/vps/plans` | — | List VPS products from WHMCS (falls back to static data) |
| `GET` | `/api/whmcs/dashboard/summary` | Bearer | Aggregate server/domain/invoice summary |
| `GET` | `/api/whmcs/servers` | Bearer | List client services |
| `GET` | `/api/whmcs/servers/:id` | Bearer | Get single service |
| `PATCH` | `/api/whmcs/servers/:id` | Bearer | Rename server (hostname) |
| `POST` | `/api/whmcs/servers/:id/:action` | Bearer | Power action (start/stop/reboot/terminate) |
| `GET` | `/api/whmcs/invoices` | Bearer | List invoices |
| `GET` | `/api/whmcs/invoices/:id` | Bearer | Get invoice details |
| `POST` | `/api/whmcs/invoices/:id/pay` | Bearer | Generate WHMCS SSO payment URL |
| `GET` | `/api/whmcs/tickets` | Bearer | List support tickets |
| `GET` | `/api/whmcs/tickets/:id` | Bearer | Get ticket with replies |
| `POST` | `/api/whmcs/tickets` | Bearer | Open new ticket |
| `POST` | `/api/whmcs/tickets/:id/reply` | Bearer | Reply to ticket |
| `POST` | `/api/whmcs/tickets/:id/close` | Bearer | Close ticket |

---

## Health Check

```bash
GET /api/health
```

Returns `{ "status": "ok", "timestamp": "..." }`. Use this to verify the Nuxt server is running in your deployment pipeline or load balancer health checks.

---

## VPS Cart Mapping

When adding VPS items to the cart, you **must** include `meta.whmcs_product_id`:

```js
{
  id: 'vps-1',
  type: 'server',
  name: 'Business VPS',
  price: 14,
  meta: {
    whmcs_product_id: 42   // ← required, maps to WHMCS product pid
  }
}
```

Checkout will reject any server/hosting cart item missing this field.

---

## Testing

There are no automated tests in this project. Manual testing steps:

1. **Dev mock login**: set `NUXT_PUBLIC_ENABLE_DEV_MOCKS=true`, visit `http://localhost:3000/login`, use any credentials.
2. **Health check**: `curl http://localhost:3000/api/health`
3. **WHMCS integration**: configure real credentials in `.env`, test login with a valid WHMCS account.

---

## Deployment Notes

### Pre-deployment checklist

- [ ] `NUXT_WHMCS_API_URL` points to your live WHMCS installation
- [ ] `NUXT_WHMCS_API_IDENTIFIER` and `NUXT_WHMCS_API_SECRET` are set
- [ ] `NUXT_WHMCS_TOKEN_SECRET` is set to a random 32+ character string (treat like a private key)
- [ ] `NUXT_PUBLIC_APP_ENV=production`
- [ ] `NUXT_PUBLIC_ENABLE_DEV_MOCKS=false` (or unset)
- [ ] WHMCS API access key restrictions are configured in WHMCS Admin → Configuration → Security

### Build for production

```bash
npm run build
# Output is in .output/
# Start with:
node .output/server/index.mjs
```

### Environment variables at runtime

Set all `NUXT_*` variables in your hosting environment (PM2 ecosystem file, Docker env, Coolify/Ploi/Forge env vars, etc.). Never commit `.env` to version control.

### No database required

This application has no local database. All persistent data (clients, orders, invoices, domains, tickets) lives in WHMCS. Cart snapshots use Nitro's built-in file-based storage (`.data/` directory) and are ephemeral by design.
