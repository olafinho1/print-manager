# DEVELOPMENT.md

Development and operations notes for `print-manager`.

## Overview

`print-manager` is a Cloudflare Pages application with Pages Functions and D1. The frontend is a small Vite-built vanilla JS app. The backend exposes a read model plus targeted mutation endpoints.

This document is for humans working on setup, local development, deployment, and safe extension.

## Repository layout

- [index.html](/Users/olafwojtas/Documents/twirl.studio/print-manager/index.html): app shell
- [app.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/app.js): frontend logic and rendering
- [styles.css](/Users/olafwojtas/Documents/twirl.studio/print-manager/styles.css): UI styling
- [functions/api/_lib/store.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/_lib/store.js): D1 access, normalization, mutations, state response helpers
- [functions/api/*.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api): Pages Function routes
- [migrations/0001_initial.sql](/Users/olafwojtas/Documents/twirl.studio/print-manager/migrations/0001_initial.sql): base schema
- [migrations/0002_inventory_ledger.sql](/Users/olafwojtas/Documents/twirl.studio/print-manager/migrations/0002_inventory_ledger.sql): activity and ledger schema
- [migrations/0003_sales_orders.sql](/Users/olafwojtas/Documents/twirl.studio/print-manager/migrations/0003_sales_orders.sql): sales orders, items, and order events
- [wrangler.toml](/Users/olafwojtas/Documents/twirl.studio/print-manager/wrangler.toml): Pages + D1 config

## Prerequisites

- Node.js and npm installed locally
- Cloudflare account
- Wrangler login completed
- D1 database created

Install dependencies:

```bash
npm install
```

## Local development

### Frontend only

Use this when you only need the static UI and do not care about Pages Functions or D1:

```bash
npm run dev
```

### Full stack

Use this for real development:

```bash
npm run build
npm run dev:cf
```

This runs Cloudflare Pages local dev, including:

- static frontend from `dist`
- Pages Functions
- D1 local binding

The local URL is typically `http://127.0.0.1:8788`.

## D1 setup

Create the database:

```bash
npx wrangler d1 create print-manager
```

Copy the returned database ID into [wrangler.toml](/Users/olafwojtas/Documents/twirl.studio/print-manager/wrangler.toml) as `database_id`.

Apply schema locally:

```bash
npm run db:migrate:local
```

Apply schema remotely:

```bash
npm run db:migrate:remote
```

## Build and deploy

Build:

```bash
npm run build
```

Preview static build locally:

```bash
npm run preview
```

Cloudflare deploy model:

- repo is connected to GitHub
- pushes to `main` deploy automatically to Pages
- custom domain is the canonical production entrypoint
- `print-manager.pages.dev` redirects to the custom domain

## Cloudflare Pages configuration

Current build settings:

- framework preset: `React (Vite)` or compatible Vite preset
- build command: `npm run build`
- build output directory: `dist`
- root directory: blank

Current binding:

- D1 database binding name: `DB`

Current runtime config:

- `compatibility_date = "2026-05-04"`

## Variables and secrets

The app reads these values from `context.env`:

- `APP_ENV`
- `ALLOW_SAMPLE_RESET`

Recommended values:

### Production

- `APP_ENV=production`
- `ALLOW_SAMPLE_RESET=false`

### Preview

- `APP_ENV=preview`
- `ALLOW_SAMPLE_RESET=false`

Because this project uses `wrangler.toml` as config source of truth, the Cloudflare dashboard may only allow adding these as secrets. That is acceptable for this app.

## Authentication

Production is protected with Cloudflare Access on the custom domain.

The app currently reads identity from Access via:

1. `Cf-Access-Jwt-Assertion`
2. `Cf-Access-Authenticated-User-Email`
3. `CF_Authorization` cookie

Behavior:

- the header shows the authenticated email when detected
- stock and queue mutations use that identity as actor by default
- the operator input acts as an override alias

Current limitation:

- the backend decodes the JWT payload to read the email
- it does not yet validate the JWT signature

## API model

### Read model

`GET /api/state`

Returns:

- `parts`
- `products`
- `printers`
- `printState`
- `completedPrints`
- `partInventoryMovements`
- `finishedInventoryMovements`
- `printEvents`
- `meta.auth`
- `meta.app`

### Full replacement

`PUT /api/state`

Use only for restore/import workflows. Do not use for normal mutations.

### Mutation endpoints

These routes all return the refreshed full state:

- `POST /api/parts`
- `POST /api/parts-delete`
- `POST /api/parts-inventory`
- `POST /api/products`
- `POST /api/products-delete`
- `POST /api/product-actions`
- `POST /api/printers`
- `POST /api/printers-delete`
- `POST /api/printer-actions`
- `POST /api/queue-actions`
- `POST /api/sales-orders`
- `POST /api/sales-order-actions`

## Business logic notes

### Products

There are two product modes:

- assembly products
- direct single-part products

For direct single-part products:

- there is no assembly step
- the linked printed part is already sellable stock
- packing deducts part inventory directly

### Queue

The print queue is derived automatically from unfulfilled sales-order demand.

Important implications:

- operators do not create manual print jobs
- queue state is quantity-based
- queue rows are aggregated by part/color/material
- packing a sales order deducts inventory and closes its demand atomically
- the legacy `target_stock` column remains for schema compatibility but is normalized to zero and ignored

### Inventory history

Stock-changing actions must write to ledger tables:

- `part_inventory_movements`
- `finished_inventory_movements`
- `print_events`
- `sales_order_events` records the actor and lifecycle of each order

Do not bypass these tables for convenience.

## Schema change workflow

When changing persistence:

1. update SQL migrations
2. update `SCHEMA_STATEMENTS` in [functions/api/_lib/store.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/_lib/store.js)
3. update normalization helpers
4. update read/write logic
5. run local migrations
6. run remote migrations when deploying

For additive compatibility on existing databases, prefer careful non-breaking changes. This codebase already uses runtime column checks for some fields, notably `actor`.

## Testing checklist

After any meaningful change, verify:

1. `GET /api/state` returns JSON successfully
2. parts CRUD still works
3. products CRUD still works
4. one inventory adjustment creates a movement record
5. one queue action creates a print event
6. one pack or assemble action records actor attribution correctly
7. non-assembly products do not show assembly flow
8. authenticated header state still appears behind Access

## Troubleshooting

### `Authentication not detected`

Check:

- the request is hitting the protected custom domain, not an unprotected endpoint
- Cloudflare Access app is attached to the correct hostname
- the latest auth-header fix is deployed

Inspect:

- `/api/state`
- `meta.auth.authenticated`
- `meta.auth.email`

### `/api/state` returns 500

Common causes:

- missing D1 binding
- migration not applied
- Pages Functions not using the expected config

Check:

- Pages `Bindings` include `DB`
- remote migrations were run
- latest deployment succeeded

### UI works locally but not in full-stack mode

Remember:

- `npm run dev` is frontend-only
- `npm run build && npm run dev:cf` is the real Pages + D1 workflow

## Suggested next milestones after v0.1

- JWT signature validation for Access identity
- backup/export tooling for D1
- optional demand sources beyond manual sales orders
- R2-backed file and image uploads
- Shopify order ingestion
