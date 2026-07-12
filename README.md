# Print Farm Manager MVP

Cloudflare Pages app for tracking:

- printed part inventory
- products and their required printed parts
- finished goods inventory
- buildable products
- low-stock parts
- suggested next print jobs
- print queue status
- manual sales orders and order-driven demand
- active printer setups and queue parallel-time estimates

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

This applies the base, inventory-ledger, and sales-order tables. Re-run it after pulling schema changes; the SQL uses `IF NOT EXISTS`.

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
- Open sales orders add demand to the derived print queue; packing an order deducts the correct finished or direct-part stock and records the actor.
- Queue timing is estimated from active printers whose loaded color and material match the required queue rows.
