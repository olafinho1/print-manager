# AGENTS.md

Guidance for coding agents working in this repository.

## Purpose

This project is a Cloudflare Pages app for a small 3D print farm. It tracks:

- printed part inventory
- product BOMs
- finished goods inventory
- derived print demand and queue state
- active printers and queue time estimates
- activity history with operator attribution

The app is already deployed and used behind Cloudflare Access. Treat changes as production-facing, not as throwaway MVP code.

## Stack

- Frontend: static HTML, CSS, vanilla JavaScript
- Build tool: Vite
- Backend: Cloudflare Pages Functions
- Database: Cloudflare D1
- Auth: Cloudflare Access in front of the custom domain

Key files:

- [index.html](/Users/olafwojtas/Documents/twirl.studio/print-manager/index.html)
- [app.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/app.js)
- [styles.css](/Users/olafwojtas/Documents/twirl.studio/print-manager/styles.css)
- [functions/api/_lib/store.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/_lib/store.js)
- [functions/api/state.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/state.js)
- [migrations/0001_initial.sql](/Users/olafwojtas/Documents/twirl.studio/print-manager/migrations/0001_initial.sql)
- [migrations/0002_inventory_ledger.sql](/Users/olafwojtas/Documents/twirl.studio/print-manager/migrations/0002_inventory_ledger.sql)
- [wrangler.toml](/Users/olafwojtas/Documents/twirl.studio/print-manager/wrangler.toml)

## Architectural rules

1. `GET /api/state` is the read model.
It returns the whole normalized app state plus `meta.auth` and `meta.app`.

2. `PUT /api/state` is for full replacement only.
Do not use it for ordinary user actions. It exists for restore/import paths such as `Restore sample data`.

3. Normal operations must use targeted mutation endpoints.
Examples:

- `/api/parts`
- `/api/parts-delete`
- `/api/parts-inventory`
- `/api/products`
- `/api/products-delete`
- `/api/product-actions`
- `/api/printers`
- `/api/printers-delete`
- `/api/printer-actions`
- `/api/queue-actions`

4. The frontend expects mutation responses to return the full refreshed state.
That contract is implemented through `withMutationState()` in [functions/api/_lib/store.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/_lib/store.js).

5. Inventory history matters.
Do not introduce stock-changing behavior that bypasses:

- `part_inventory_movements`
- `finished_inventory_movements`
- `print_events`

6. Queue rows are derived, not manually authored.
Do not reintroduce a user-created print-job model unless the product direction explicitly changes.

## Auth and actor attribution

The app is protected by Cloudflare Access on the custom domain.

Backend actor resolution currently works in this order:

1. `cf-access-jwt-assertion`
2. `cf-access-authenticated-user-email`
3. `CF_Authorization` cookie
4. frontend-supplied operator override

The frontend shows:

- authenticated email when Access is detected
- operator override input for optional aliasing

Important:

- The backend currently decodes the Access JWT payload to read `email`.
- It does not yet cryptographically validate that JWT.
- If auth behavior is changed, preserve compatibility with Pages Functions and the current Access deployment.

## Data model notes

Products come in two modes:

- `requiresAssembly = true`
  - parts are deducted on assemble
  - finished stock is increased
  - packing deducts finished stock

- `requiresAssembly = false`
  - the single linked part is itself sellable stock
  - there is no assembly step
  - packing deducts the underlying part inventory directly

Queue demand is currently driven by target stock replenishment, aggregated by part/color/material.

Printers match queue rows by exact color and material and are used for parallel time estimation.

## Schema change rules

If you change persistence:

1. update D1 migration SQL under `migrations/`
2. update `SCHEMA_STATEMENTS` in [functions/api/_lib/store.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/_lib/store.js)
3. keep normalization functions in sync
4. keep `readState()` output stable unless the frontend is updated in the same change

For existing production databases, remember:

- new SQL files help fresh environments
- existing environments may still need runtime compatibility handling
- this repo already uses runtime `ensureColumn(...)` for additive compatibility in some cases

## Frontend rules

- Keep the app dependency-light. Do not add a framework casually.
- Most UI state lives in `ui` in [app.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/app.js).
- Shared state comes from `/api/state`; do not recreate a local persistence layer.
- When changing actor or auth UX, update both header rendering and mutation payload behavior.

Useful frontend entry points:

- `init()`
- `fetchSharedState()`
- `mutateState()`
- `replaceSharedState()`
- `renderHeader()`
- `renderActivityToolbars()`

## Commands

Install:

```bash
npm install
```

Frontend only:

```bash
npm run dev
```

Full local Cloudflare stack:

```bash
npm run build
npm run dev:cf
```

Local migrations:

```bash
npm run db:migrate:local
```

Remote migrations:

```bash
npm run db:migrate:remote
```

## Deployment facts

- GitHub pushes deploy to Cloudflare Pages
- production hostname is on a custom domain behind Access
- `print-manager.pages.dev` redirects to the custom domain
- D1 binding name is `DB`

Config flags used by the app:

- `APP_ENV`
- `ALLOW_SAMPLE_RESET`

## Safe change checklist

Before finishing a non-trivial change:

1. make sure `/api/state` still returns valid JSON state plus `meta`
2. test at least one stock mutation path
3. verify activity history still records actor and timestamps
4. verify non-assembly products still bypass assembly logic
5. verify queue remains derived and printer time estimates still render

## Current known limitations

- Access identity is read from JWT payload without signature validation
- preview and production can point at the same D1 unless separated deliberately
- there is no demand-source model yet beyond target-stock-driven replenishment
- image support is reference-based, not upload-based

If you extend the app, prefer preserving operational clarity over adding abstraction.
