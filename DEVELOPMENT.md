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
- Node.js 24 or newer for the SQLite-backed test suite (`node:sqlite`)
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

## Pull request preview environments

`.github/workflows/pr-preview.yml` runs `scripts/preview.mjs` for same-repository PRs on `opened`, `reopened`, `synchronize`, and `closed`. Fork PRs never receive Cloudflare credentials. The workflow tests and builds the PR's head commit before deployment.

Each PR owns a separate Direct Upload Pages project and D1 database named `print-manager-pr-<number>-<repository hash>`. Pages has only production/preview binding scopes, so separate projects avoid different PRs sharing or overwriting a database binding. The main production project and database are not used by this workflow. The script checks project ownership markers, exact database names, and the production database IDs before acting.

### One-time setup

1. Create a Cloudflare API token scoped to this account with **Account / Cloudflare Pages / Edit** and **Account / D1 / Edit**. Keep the token in GitHub Secrets; never commit it.
2. Add repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` under **Settings → Secrets and variables → Actions**. Find the account ID in Cloudflare's account overview. These are build-time secrets, not app runtime bindings.
3. Enable GitHub Actions for this repository. The workflow requests `contents: read`, `pull-requests: read`, and `deployments: write` for its temporary GitHub token.
4. In the production Pages project's **Builds & deployments → Branch control**, disable native Git preview builds to avoid duplicate previews. The explicit empty `[env.preview].d1_databases` in `wrangler.toml` also prevents future native preview builds of this branch from inheriting production D1. Existing native deployments are unaffected by a config edit.

The generated preview config binds only that PR's D1 and sets `APP_ENV=preview` and `ALLOW_SAMPLE_RESET=false`. The header identifies the app as a test environment. The preview is a public `pages.dev` site with synthetic data; the custom production domain's Access policy does not automatically cover it. Use synthetic data when testing.

Cloudflare references: [CI Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [Pages configuration environments](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).

### Lifecycle

- **Open/reopen:** create or recover the PR's resources, run every pending migration with `wrangler d1 migrations apply`, seed sample parts/products/printers/filaments and open sales orders, compile Pages Functions, deploy, and smoke-test `/api/state` and its metadata. GitHub shows the preview link as a deployment and in the Actions run summary.
- **Update:** reuse the same D1, apply only pending migration files, and deploy the new head. A `preview_seed` marker prevents reseeding. Operator changes made during testing remain intact. Add new numbered migration files; editing an already applied file will not rerun it.
- **Close/merge:** remove the Pages project and its deployments, then delete its D1. Verify both are gone and mark GitHub preview deployments inactive. Reopening creates fresh resources and sample data.

Runs for one PR are serialized without canceling the running job. The script reads the current PR state before acting: stale revisions skip deployment, and an already closed PR triggers cleanup. Resource creation/deletion can be retried after partial failures. Seed inserts use `INSERT OR IGNORE`, so a failed first import can resume without resetting existing rows. Cleanup refuses a mismatched project/database and leaves D1 intact if deleting the serving project fails.

The seed uses the app's sample-data serializer with only inserts retained. It includes assembly and direct products, synthetic sales orders, and 250 g of each sample filament so ordering warnings are easy to exercise. It never imports production state. The advanced-mode `_worker.js` bundle packages the existing Pages Functions alongside the Vite assets, allowing deployment from an isolated directory/config.

### Test the cycle

1. Open a PR and wait for **Cloudflare PR preview** to pass. Open its deployment URL and confirm the **Preview environment · test data** header, open sales orders, and filament ordering overview.
2. Receive a roll or adjust stock with an operator name. Verify activity includes the actor and timestamp. Exercise Complete prints, assembly, and direct-product packing.
3. Push another commit. Verify the preview updates, the database is unchanged, the stock adjustment remains, and the Actions summary says **preserved**. For a schema change, add a new migration and confirm it is applied before deployment.
4. Close the PR. Confirm the cleanup run succeeds, the GitHub deployment is inactive, and both the Pages project and D1 are absent in Cloudflare.
5. Reopen the PR if testing should continue; it receives newly seeded data.

Local validation without Cloudflare credentials:

```bash
npm test
npm run build
node scripts/preview.mjs build
```

The last command compiles the same deployable worker/assets into ignored `.preview/local-build`. Lifecycle tests cover resource isolation, retries, deletion order, seed preservation, real SQL migrations, and environment smoke checks.

If provisioning or cleanup fails, inspect the Actions error, correct the token permissions or resource conflict, and rerun the failed job. Rerunning an old deployment after closing a PR performs cleanup using the current PR state. A failed seed is retried; a completed seed is never reset. GitHub does not trigger `pull_request` workflows for some conflicted PR states, and disabling Actions prevents cleanup; in those cases, rerun an existing job after resolving the condition or remove only that PR's named project and database in Cloudflare. Do not use the production migration command to repair a preview.

## Production Pages configuration

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
- `filaments`
- `filamentInventoryMovements`
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
- `POST /api/filaments`
- `POST /api/filaments-delete`
- `POST /api/filaments-inventory`
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

## Filament persistence and API

`migrations/0004_filaments.sql` and the matching runtime schema in `store.js` add `filaments`, `part_filaments`, `printer_filaments`, `filament_inventory_movements`, and `mutation_receipts`. Assignment tables avoid altering existing production tables. `0005_completion_filament.sql` adds `filament_prepaid_prints`, which carries outstanding quantities charged by the former Start policy. It reconstructs the outstanding quantity from committed print events, consuming credits on Complete/Fail and preserving zero rows as migration markers. Both migration commands include the new SQL; repeated application is safe. Runtime `db.exec()` statements must be single-line because D1 executes each nonempty line separately.

The read model exposes filament `id`, `manufacturer`, `material`, `color`, `spoolWeightGrams`, signed `stockGrams`, and `stockVersion`. Parts gain nullable `filamentId`/`filamentGramsPerUnit` and `queueVersion`; printers gain nullable `filamentId`. Color/material are derived from the assigned catalog entry, with legacy values retained for unassigned records. `printState` also exposes `prepaidFilamentQty` for outstanding units charged under the earlier policy; restore preserves these credits independently of the history window. Versions are opaque optimistic-concurrency tokens and may change after full-state restore.

All public weights are grams with at most two decimal places. Database weights and arithmetic use integer milligrams. Opening/count inputs require whole non-negative rolls and non-negative additional grams; corrections can be signed. Spool weights and part usage must be positive. Catalog edits never change stored weight balances.

New mutation payloads:

- `POST /api/filaments`: `{ filament: { id?, manufacturer, material, color, spoolWeightGrams }, initialRolls?, additionalGrams?, requestId, actor? }`. Opening stock applies only to creation. Omit `id` for a server-generated ID.
- `POST /api/filaments-inventory`: `{ filamentId, action, requestId, actor?, ... }`. `receive` takes positive whole `rolls`; `set` takes `rolls`, `additionalGrams`, `note`, and `expectedStockVersion`; `adjust` takes signed `deltaGrams` and `note`.
- `POST /api/filaments-delete`: `{ id }`. Parts, printers, and inventory history prevent deletion.
- `POST /api/queue-actions` now requires `requestId` and `expectedQueueVersion` from the displayed part. For Start and Complete, also send `expectedFilamentId` and `expectedFilamentGramsPerUnit` from that part. This prevents charging a different configuration than the operator reviewed.

Queue actions and filament save/stock commands use unique request IDs. Repeating an identical request returns refreshed state without another write; reusing the ID with another payload returns 409. Queue/version and assignment checks execute inside the same D1 batch as all balance, ledger, part-stock, and event writes. A failed precondition rolls back the whole batch and returns 409. Counted stock also checks its movement version to avoid overwriting concurrent consumption. Additive receipts and consumption update balances arithmetically, allowing different parts to share a filament safely. The frontend retains request IDs after ambiguous failures within the current page session and refreshes shared state on conflicts.

Complete deducts `completed quantity × current grams per unit`, with a `print_completed` filament movement. Start/Fail/Retry do not change filament stock; record waste from failures via a manual adjustment. Completion consumes any prepaid units first to avoid charging earlier Start deductions twice. Filament movements preserve actor, time, signed grams, part, linked print event, printed quantity, and usage per unit. Reading state includes the latest 400 filament movements and retains any print events those movements reference, even beyond the normal recent-event window. Full-state restore writes parents before assignments/history and resets mutation receipts. Invalid references roll back the replacement.

## Filament rollout and verification

1. Apply the additive migration or let runtime schema initialization create its tables. No filament data is guessed for existing installations.
2. Add catalog entries and enter available weight. If counting during a print, account for material already used on unfinished units because completion will deduct the full estimate.
3. Assign filaments and positive per-unit usage to parts before starting or completing prints. Completion uses the settings reviewed in the quantity dialog. Existing prepaid quantities can finish without another charge; no usage is invented for unconfigured parts.
4. Assign the exact loaded filament to each printer. Unassigned/inactive printers do not contribute to matching capacity. Future filament demand includes planned, unplanned, and in-progress quantities, excluding prepaid credits from the earlier Start policy.

`npm test` uses real SQLite with D1-style atomic batches and checks duplicates, interleaved commands, rollback, precision, legacy upgrades, restored history, and exact-filament queue timing. Run `npm run build` afterward. For full-stack checks, use a separate temporary local database:

```bash
WRANGLER_SEND_METRICS=false npm run dev:cf -- --port 8790 --persist-to /tmp/print-manager-filament-check
```

Verify `/api/state` and metadata, roll receipts/counts, Start → partial Complete, mixed direct completion, Fail → Retry → Start → Complete, prepaid upgrades, deficits, operator history, and assembly/direct packing without extra filament deductions. Never point test resets or fixtures at production D1.
