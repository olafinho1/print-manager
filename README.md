# Print Farm Manager MVP

Standalone browser app for tracking:

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

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Then open the local URL Vite prints, which is typically `http://localhost:5173`.

## Notes

- Data is stored in browser `localStorage`.
- `Restore sample data` resets the app to a seeded dataset for testing the workflow.
- Completing a print job automatically adds that quantity into part inventory.
- Assembling a product automatically deducts required parts and increases finished stock.
- Queue timing is estimated from active printers whose loaded color and material match the required queue rows.
