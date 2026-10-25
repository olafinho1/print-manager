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

`.github/workflows/pr-preview.yml` runs `scripts/preview.mjs` for same-repository PRs on `opened`, `reopened`, `synchronize`, and `closed`. Fork PRs never receive Cloudflare credentials. The workflow tests and builds the PR's head commit before deployment. Treat same-repository branches as trusted: their workflow code runs with account credentials. Do not copy untrusted contributions into such branches and run this workflow.

Each PR owns a Direct Upload Pages project, D1 database, and Access application named `print-manager-pr-<number>-<repository hash>`. The production database is used only as the export source. Imports, migrations, application requests, and cleanup target the isolated PR database. Guards check project ownership, exact database names, and production database IDs before writing or deleting anything.

### One-time setup

1. Give the Cloudflare API token these account permissions: **Cloudflare Pages / Edit**, **D1 / Edit**, and **Access: Apps and Policies / Edit**. Keep the token in GitHub Secrets.
2. Add repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` under **Settings → Secrets and variables → Actions**. The workflow does not put these credentials in the deployed app.
3. The workflow finds the production Access application through the production Pages project's custom domain. If this is ambiguous, set the Actions **variable** `CLOUDFLARE_ACCESS_SOURCE_APP_ID` to that application's ID. It copies the production login policies and identity-provider restrictions to the PR's own Access application. Bypass policies are rejected. The production Access application is never edited.
4. Enable GitHub Actions. The workflow requests `contents: read`, `pull-requests: read`, and `deployments: write` for GitHub's temporary token.
5. Disable native Git preview builds in the production Pages project's **Builds & deployments → Branch control** to avoid duplicate previews. The empty `[env.preview].d1_databases` in `wrangler.toml` prevents native previews from inheriting production D1. Existing deployments are unaffected by a config edit.

The Access application covers both `<project>.pages.dev` and `*.<project>.pages.dev`, including branch aliases and historical deployment URLs. Before exporting production, the workflow deploys a maintenance worker with no D1 binding and verifies unauthenticated requests redirect to Cloudflare Access. Missing permissions or failed protection checks stop the copy. Access applications are removed only after the serving project and D1 have been deleted.

### Lifecycle

- **Open/reopen:** provision Access and isolated resources, export production schema and data, import into the empty PR D1, apply pending feature migrations, validate the app read model against the copy, and deploy. The header and workflow summary show the snapshot timestamp. The source is the production D1 ID in `wrangler.toml`.
- **Update:** keep the existing copy and operator test changes; apply pending migrations and redeploy. A `preview_production_snapshot` marker prevents another export/import. Add numbered migration files instead of editing an applied migration.
- **Close/merge:** delete Pages and its deployments, then D1, then the PR Access application. Mark GitHub preview deployments inactive. Reopening takes a fresh copy. Preview data is never copied back into production on merge.

The SQL import happens **before** migrations so the preview tests a real production upgrade. A full D1 export retains history and internal application records omitted by the bounded `/api/state` read model. Production's migration tracking table is retained when present. Older production installations without tracking use the existing repeatable migrations; future migrations must account for which schema production actually has.

Cloudflare D1 currently implements this copy through SQL export/import. **An export blocks other production database requests while it runs.** A snapshot is taken once per PR environment, not on every update. SQL stays in a private temporary directory outside the deploy bundle, command output is suppressed for export/import, and the directory is removed on success or failure. The workflow never publishes the dump as an artifact. An empty production database remains empty rather than receiving sample data.

Runs for one PR are serialized without cancellation. A completed snapshot is retained even if migration or deployment subsequently fails. An interrupted initial import has no completion marker, so its serving project and incomplete D1 are removed and recreated before retrying. The first run upgrading an old sample-data preview also replaces that synthetic database once. Existing local development data is unaffected.

The maintenance worker remains in place if initialization fails. After import and migration, the workflow exercises the real state serializer through the isolated D1 API without logging row contents. Deployment checks verify Access on the project root, branch alias, and deployment URL. These checks do not bypass login or claim an authenticated browser/API smoke test; finish acceptance testing after signing in. New Pages hostnames may need several minutes for DNS/TLS and Access propagation.

### Test the cycle

1. Open a PR and wait for **Cloudflare PR preview**. Sign in at its deployment URL and confirm **Preview environment · production snapshot from …**. Compare representative inventory, orders, queue state, and history with production as of the snapshot time.
2. Exercise stock adjustments, Complete prints, assembly, and direct-product packing in the preview. Verify actor and timestamp history. Legacy parts start without filament configuration if production predates that feature.
3. Push another commit. Confirm the snapshot timestamp and test changes remain. Add a new migration to test schema upgrades.
4. Close the PR and confirm its Pages project, D1, and Access application are gone. Reopen it to obtain a fresh snapshot.

Local validation without Cloudflare credentials:

```bash
npm test
npm run build
node scripts/preview.mjs build
```

Tests cover resource isolation, retries, deletion order, snapshot preservation, legacy production upgrades with full history and in-progress work, empty snapshots, Access policies, and refusal to expose public data. The build command compiles the deployable worker/assets into ignored `.preview/local-build`.

If a workflow fails, correct the reported permission or resource issue and rerun it. An old run checks current PR state before acting; closed PRs trigger cleanup. GitHub does not trigger `pull_request` workflows for some conflicted PR states, and disabling Actions prevents cleanup. Resolve the condition and rerun, or remove only that PR's named resources. Never use the production migration command to repair a preview.

References: [D1 export/import and limitations](https://developers.cloudflare.com/d1/best-practices/import-export-data/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Pages Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [CI Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

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
- the linked part is already sellable stock
- packing deducts part inventory directly

### Queue

The print queue is derived automatically from unfulfilled sales-order demand.

Important implications:

- operators do not create manual print jobs
- queue state is quantity-based
- queue rows include only 3D printed parts, grouped by exact filament assignment
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

`migrations/0004_filaments.sql` and the matching runtime schema in `store.js` add `filaments`, `part_filaments`, `printer_filaments`, `filament_inventory_movements`, and `mutation_receipts`. Assignment tables avoid altering existing production tables. `0005_completion_filament.sql` adds `filament_prepaid_prints`, which carries outstanding quantities charged by the former Start policy. It reconstructs the outstanding quantity from committed print events, consuming credits on Complete/Fail and preserving zero rows as migration markers. `0006_part_production.sql` adds `part_production_settings` (missing rows default to printed) and `filament_part_stock_movements` (links consumption to manual stock history). Both migration commands include the new SQL; repeated application is safe. Runtime `db.exec()` statements must be single-line because D1 executes each nonempty line separately.

The read model exposes filament `id`, `manufacturer`, `material`, `color`, `spoolWeightGrams`, signed `stockGrams`, and `stockVersion`. Parts expose `isPrinted` (defaults to `true` for existing parts), nullable `filamentId`/`filamentGramsPerUnit`, and `queueVersion`; printers gain nullable `filamentId`. Color/material are derived from the assigned catalog entry, with legacy values retained for unassigned records. `printState` also exposes `prepaidFilamentQty` for outstanding units charged under the earlier policy; restore preserves these credits independently of the history window. Versions are opaque optimistic-concurrency tokens and may change after full-state restore.

All public weights are grams with at most two decimal places. Database weights and arithmetic use integer milligrams. Opening/count inputs require whole non-negative rolls and non-negative additional grams; corrections can be signed. Spool weights and printed-part usage must be positive. Non-printed parts clear their filament assignment/usage and print time, retain BOM/inventory behavior, and never enter the print queue or printer capacity calculations. Catalog edits never change stored weight balances.

New mutation payloads:

- `POST /api/filaments`: `{ filament: { id?, manufacturer, material, color, spoolWeightGrams }, initialRolls?, additionalGrams?, requestId, actor? }`. Opening stock applies only to creation. Omit `id` for a server-generated ID.
- `POST /api/filaments-inventory`: `{ filamentId, action, requestId, actor?, ... }`. `receive` takes positive whole `rolls`; `set` takes `rolls`, `additionalGrams`, `note`, and `expectedStockVersion`; `adjust` takes signed `deltaGrams` and `note`.
- `POST /api/filaments-delete`: `{ id }`. Parts, printers, and inventory history prevent deletion.
- `POST /api/parts-inventory`: `{ partId, delta, reason?, note?, actor?, requestId, expectedIsPrinted, expectedFilamentId, expectedFilamentGramsPerUnit }`. `delta` must be a non-zero safe integer. Positive changes check the displayed production type; printed parts also check the displayed filament/usage and deduct `delta × grams per unit`. Negative changes never return filament and can be made without filament configuration. Both Add stock and Adjust use this endpoint.
- `POST /api/parts` persists the production type and details. Initial stock is an opening balance without retrospective consumption; existing stock is preserved even if the payload has a different balance. Resolve outstanding queue tracking before changing to non-printed.
- `POST /api/queue-actions` now requires `requestId` and `expectedQueueVersion` from the displayed part. For Start and Complete, also send `expectedFilamentId` and `expectedFilamentGramsPerUnit` from that part. This prevents charging a different configuration than the operator reviewed.

Queue actions, manual part-stock changes, and filament save/stock commands use unique request IDs. Repeating an identical request returns refreshed state without another write; reusing the ID with another payload returns 409. Queue/version and assignment checks execute inside the same D1 batch as all balance, ledger, part-stock, and event writes. A failed precondition rolls back the whole batch and returns 409. Counted stock also checks its movement version to avoid overwriting concurrent consumption. Additive receipts and consumption update balances arithmetically, allowing different parts to share a filament safely. Manual part stock uses arithmetic updates and guards against negative/unsafe quantities in the transaction. Part stock and settings edits invalidate stale queue versions. The frontend retains request IDs after ambiguous failures within the current page session and refreshes shared state on conflicts.

Complete deducts `completed quantity × current grams per unit`, with a `print_completed` filament movement. Start/Fail/Retry do not change filament stock; record waste from failures via a manual adjustment. Completion consumes any prepaid units first to avoid charging earlier Start deductions twice. Filament movements preserve actor, time, signed grams, part, linked print event, printed quantity, and usage per unit. Positive manual part-stock entries create `part_stock_added` filament movements with immutable quantity/usage snapshots and `partMovementId` links. Their balance, part ledger, filament ledger, link, and deduplication receipt commit in one batch. Stock reductions leave filament balances/history untouched. Reading state includes the latest 400 filament movements and retains any print events or part stock movements those movements reference, even beyond the normal recent-event window. Full-state restore writes parents before assignments/history and resets mutation receipts. Invalid references roll back the replacement.

## Filament rollout and verification

1. Apply the additive migration or let runtime schema initialization create its tables. No filament data is guessed for existing installations.
2. Add catalog entries and enter available weight. If counting during a print, account for material already used on unfinished units because completion will deduct the full estimate.
3. Mark non-printed bookkeeping components with `isPrinted: false`. Existing parts remain printed until explicitly changed; no stock or historical usage is recalculated. Assign filaments and positive per-unit usage to printed parts before starting, completing, or manually adding stock. Completion uses the settings reviewed in the quantity dialog. Existing prepaid quantities can finish without another charge; no usage is invented for unconfigured parts.
4. Assign the exact loaded filament to each printer. Unassigned/inactive printers do not contribute to matching capacity. Future filament demand includes planned, unplanned, and in-progress quantities, excluding prepaid credits from the earlier Start policy.

`npm test` uses real SQLite with D1-style atomic batches and checks duplicates, interleaved commands, rollback, precision, legacy upgrades, restored history, and exact-filament queue timing. Run `npm run build` afterward. For full-stack checks, use a separate temporary local database:

```bash
WRANGLER_SEND_METRICS=false npm run dev:cf -- --port 8790 --persist-to /tmp/print-manager-filament-check
```

Verify `/api/state` and metadata, non-printed BOM components and shortages, positive manual stock consumption, negative QC corrections without refunds, duplicate stock requests, stock/settings conflicts and rollback, roll receipts/counts, Start → partial Complete, mixed direct completion, Fail → Retry → Start → Complete, prepaid upgrades, deficits, operator history, and assembly/direct packing without extra filament deductions. Never point test resets or fixtures at production D1.
