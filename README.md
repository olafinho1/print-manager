# Print Farm Manager MVP

Cloudflare Pages app for tracking:

- printed part inventory
- products and their required printed parts
- finished goods inventory
- buildable products
- low-stock parts
- suggested next print jobs
- print queue status
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
- Local `npm run dev` does not include Pages Functions or D1. Use `npm run build` plus `npm run dev:cf` for the real full-stack workflow.
- `Restore sample data` resets the app to a seeded dataset for testing the workflow.
- Completing a print job automatically adds that quantity into part inventory.
- Assembling a product automatically deducts required parts and increases finished stock.
- Queue timing is estimated from active printers whose loaded color and material match the required queue rows.
