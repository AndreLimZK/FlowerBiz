import { useEffect, useSyncExternalStore } from "react";

/**
 * Flower quantities, one spreadsheet row per colour.
 *
 * `NEXT_PUBLIC_FLOWER_STOCK_SHEET_URL` is a published Google Sheet the browser
 * can read without a separate secret:
 *
 * - CSV export: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv`
 * - Sheets API values: `https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/Sheet1!A:C`
 *
 * The first row is a header: `productId`, `colourId`, `quantity`.
 * When the variable is unset, or the sheet cannot be read, the dev table below
 * is used so the customiser still runs. This module is the only fetch.
 * Quantities are not part of the bouquet configuration.
 */
export type FlowerQuantityRow = {
  productId: string;
  colourId: string;
  quantity: number;
};

/** Local stand-in for a published sheet. Not a live inventory. */
export const DEV_FLOWER_QUANTITIES: readonly FlowerQuantityRow[] = [
  { productId: "dev-rose", colourId: "dev-rose-blush", quantity: 8 },
  { productId: "dev-daisy", colourId: "dev-daisy-cream", quantity: 6 },
  { productId: "dev-stem-test", colourId: "dev-stem-test-plain", quantity: 4 },
  { productId: "dev-missing-model", colourId: "dev-missing-model-none", quantity: 0 },
];

const listeners = new Set<() => void>();

let snapshot: readonly FlowerQuantityRow[] = DEV_FLOWER_QUANTITIES;
let loadStarted = false;

export function flowerQuantitySheetUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_FLOWER_STOCK_SHEET_URL?.trim();
  return url ? url : undefined;
}

export function getFlowerQuantities(): readonly FlowerQuantityRow[] {
  return snapshot;
}

export function subscribeFlowerQuantities(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isSoldOut(
  rows: readonly FlowerQuantityRow[],
  productId: string,
  colourId: string | undefined,
): boolean {
  if (!colourId) return false;
  const row = rows.find((entry) => entry.productId === productId && entry.colourId === colourId);
  return row?.quantity === 0;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function rowsFromTable(table: string[][]): FlowerQuantityRow[] {
  const header = table[0]?.map(normalizeHeader) ?? [];
  const productIndex = header.findIndex((cell) => cell === "productid" || cell === "product");
  const colourIndex = header.findIndex(
    (cell) => cell === "colourid" || cell === "colorid" || cell === "colour" || cell === "color",
  );
  const quantityIndex = header.findIndex((cell) => cell === "quantity" || cell === "qty");
  if (productIndex < 0 || colourIndex < 0 || quantityIndex < 0) {
    throw new Error("Flower quantity sheet is missing productId, colourId, or quantity.");
  }

  const rows: FlowerQuantityRow[] = [];
  for (const cells of table.slice(1)) {
    const productId = cells[productIndex]?.trim() ?? "";
    const colourId = cells[colourIndex]?.trim() ?? "";
    const rawQuantity = cells[quantityIndex]?.trim() ?? "";
    if (!productId || !colourId || !/^\d+$/.test(rawQuantity)) continue;
    rows.push({ productId, colourId, quantity: Number(rawQuantity) });
  }
  return rows;
}

function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");
  const table: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim().length > 0)) table.push(row);
      row = [];
      continue;
    }
    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim().length > 0)) table.push(row);
  return table;
}

function sheetsValues(payload: unknown): string[][] | undefined {
  if (!payload || typeof payload !== "object" || !("values" in payload)) return undefined;
  const values = payload.values;
  if (!Array.isArray(values)) return undefined;
  return values.map((row) => (Array.isArray(row) ? row.map((cell) => (cell == null ? "" : String(cell))) : []));
}

/** Parses a published CSV or a Sheets API `values` response. */
export function parseFlowerQuantityTable(body: string): FlowerQuantityRow[] {
  const trimmed = body.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const values = sheetsValues(JSON.parse(trimmed) as unknown);
    if (!values) {
      throw new Error("Flower quantity sheet JSON has no values table.");
    }
    return rowsFromTable(values);
  }
  return rowsFromTable(parseCsv(trimmed));
}

async function loadFlowerQuantitySheet(url: string): Promise<readonly FlowerQuantityRow[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Flower quantity sheet responded with ${response.status}.`);
  }
  return parseFlowerQuantityTable(await response.text());
}

function replaceFlowerQuantities(next: readonly FlowerQuantityRow[]) {
  snapshot = next;
  for (const listener of [...listeners]) listener();
}

/** Starts the sheet fetch once. Unset URL keeps the dev table. */
export function ensureFlowerQuantitiesLoaded(): void {
  if (loadStarted) return;
  loadStarted = true;
  const url = flowerQuantitySheetUrl();
  if (!url) return;
  void loadFlowerQuantitySheet(url)
    .then((next) => {
      replaceFlowerQuantities(next);
    })
    .catch((error: unknown) => {
      console.error("Flower quantities could not be loaded. Using the local dev table.", error);
    });
}

export function useFlowerQuantities(): readonly FlowerQuantityRow[] {
  const rows = useSyncExternalStore(subscribeFlowerQuantities, getFlowerQuantities, getFlowerQuantities);
  useEffect(() => {
    ensureFlowerQuantitiesLoaded();
  }, []);
  return rows;
}
