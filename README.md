# FlowerBiz

Desktop-first site for handmade pipe-cleaner bouquets. The product decisions live in `PROJECT_SPEC.md`.

Phase 0 is the application shell: a landing page and an empty three-column customiser. The flower catalogue, pricing, and live 3D preview are not part of this phase.

## Local development

```bash
npm install
npm run dev
```

- http://localhost:3000 — landing page
- http://localhost:3000/customise — customiser

```bash
npm run build
```

## Flower quantities

Stock is a spreadsheet row per colour: `productId`, `colourId`, `quantity`. The only fetch is `src/lib/flowerQuantities.ts`. It is not stored on the bouquet configuration, and the 3D scene does not request the sheet.

Set `NEXT_PUBLIC_FLOWER_STOCK_SHEET_URL` to a published Google Sheet the browser can read. No separate API secret is used.

- CSV export: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv`
- Sheets API values: `https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1!A:C`

The first row is the header (`productId`, `colourId`, `quantity`). When the variable is unset, or the sheet cannot be read, the app uses the small dev table in that module. A quantity of `0` is shown as Sold out, cannot be added, and the preview does not request its model.
