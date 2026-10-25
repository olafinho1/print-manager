# Print Farm Manager MVP

Cloudflare Pages app for tracking:

- printed and non-printed part inventory
- products and their required parts
- finished goods inventory
- buildable products
- low-stock parts
- suggested next print jobs
- print queue status
- manual sales orders and order-driven demand
- active printer setups and queue parallel-time estimates
- filament catalog, roll receipts, weight balances, and automatic print consumption

## Run

Install dependencies:

```bash
npm install
```

## D1 setup

Create the D1 database:

```bash
npx wrangler d1 create print-manager
```

Then copy the returned database ID into [wrangler.toml](/Users/olafwojtas/Documents/twirl.studio/print-manager/wrangler.toml) as `database_id`.

Run the schema locally:

```bash
npm run db:migrate:local
```

This applies the base, inventory-ledger, sales-order, and filament tables. Re-run it after pulling schema changes; the SQL uses `IF NOT EXISTS`. Runtime schema initialization also creates the additive filament tables for existing installations.

Run the schema remotely:

```bash
npm run db:migrate:remote
```

## Local development

UI-only dev:

```bash
npm run dev
```

Full Cloudflare Pages + Functions + D1 dev:

```bash
npm run build
npm run dev:cf
```

Then open the Wrangler local URL, typically `http://127.0.0.1:8788`.

## Pull request previews

The **Cloudflare PR preview** GitHub Actions workflow creates a separate Pages project and D1 database for each same-repository PR. It protects the preview with Cloudflare Access, clones production D1 once, applies feature migrations to that copy, and publishes the preview URL in the PR's deployments and workflow summary. Updates migrate and redeploy while keeping test data. Closing or merging the PR deletes its preview and database; reopening creates a fresh production snapshot.

Configure the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` Actions secrets first. See [preview setup and testing](DEVELOPMENT.md#pull-request-preview-environments) for permissions and a full lifecycle trial.

## Build

Build the static frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Then open the local URL Vite prints, which is typically `http://localhost:5173`.

## Notes

- Shared app state is stored in Cloudflare D1 through [functions/api/state.js](/Users/olafwojtas/Documents/twirl.studio/print-manager/functions/api/state.js).
- Inventory, finished-goods, and queue actions now write movement/event records in D1 so stock changes are transactional instead of whole-state rewrites.
- The operator name field is session-scoped in the browser and is attached to new activity records for attribution and filtering.
- If Cloudflare Access is enabled in front of the app, the backend reads `cf-access-authenticated-user-email` and uses that identity as the default actor when the operator override is blank.
- `Restore sample data` is shown automatically in local development. In deployed environments it is hidden unless `ALLOW_SAMPLE_RESET=true` is configured.
- `APP_ENV` can be set to label non-local deployments more explicitly; otherwise the app treats deployed environments as `production`.
- Local `npm run dev` does not include Pages Functions or D1. Use `npm run build` plus `npm run dev:cf` for the real full-stack workflow.
- `Restore sample data` resets the app to a seeded dataset for testing the workflow.
- Completing a print job automatically adds that quantity into part inventory.
- Assembling a product automatically deducts required parts and increases finished stock.
- Unfulfilled sales orders are the sole source of derived print demand; packing an order deducts the correct finished or direct-part stock and records the actor.
- Queue timing is estimated from active printers whose loaded filament exactly matches the part's selected filament.

## Filament inventory

Use **Filaments** to add a manufacturer, material/type, color, and net spool weight. Enter initial full rolls plus any additional grams. Receive new rolls, set a counted balance, or enter a signed gram correction with a reason. Balances are pooled weights; fractional roll equivalents do not represent individual physical spools.

The dashboard starts with **Filament to order**, listing shortages in grams and suggested whole rolls, largest shortages first. It includes current stock deficits and future queue demand. An alert above the main metrics links to this list from every tab. Queued parts missing filament settings are flagged so incomplete estimates cannot appear fully covered.

Keep **3D printed — uses filament** checked for printed parts, then select a filament and enter grams per unit. Uncheck it for purchased or other non-printed components: they remain in inventory, product requirements, and sales shortages, but do not need filament or enter the print queue. Include supports and waste in the slicer estimate. Set each printer's loaded filament to enable exact queue matching; manufacturers and spool sizes are not interchangeable automatically.

**Complete prints** deducts the completed quantity you enter × the part’s current grams per unit. The same calculation applies to in-progress, planned, and directly completed units. **Start**, **Fail**, and **Retry** do not deduct filament. Use a stock adjustment to record filament wasted on failed prints or other differences. Negative balances warn without blocking production. For printed parts, **Add stock** and positive **Adjust** entries also deduct the added quantity × grams per unit, with a consumption/balance preview before saving. Negative entries only remove parts; they never return filament, including QC rejections. Non-printed components, assembly, and packing do not consume filament.

Opening part balances describe existing stock and do not consume filament retrospectively. Once a part exists, change its stock through Add stock or Adjust; editing its details preserves the balance. Add stock records extra units independently of queue progress: use Complete prints for tracked units so the same units are not entered twice. Resolve any planned, running, or failed print tracking before changing a part to non-printed.

Queue actions open an in-page quantity dialog. Complete prints shows the live consumption estimate and resulting balance as you edit the completed quantity. Future filament demand includes planned, unplanned, and in-progress quantities that have not been charged yet. Conflicts keep the dialog open so the operator can review refreshed values before retrying.

Existing parts and printers remain unassigned after upgrade. Configure parts before starting or completing work; unconfigured in-progress quantities can still be marked failed. Quantities already charged at Start by the earlier version are carried forward as prepaid and completed without a second deduction. Historical charges remain unchanged. When entering a physical count, account separately for material used by unfinished prints, since completion will still deduct their full per-unit estimate. Catalog edits preserve existing balances and historical consumption.

Run `npm test` with Node.js 24 or newer for demand, inventory, transaction, upgrade, and UI view-model checks, then `npm run build`. See `DEVELOPMENT.md` for API and rollout details.
