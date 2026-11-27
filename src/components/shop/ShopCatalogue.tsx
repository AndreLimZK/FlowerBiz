"use client";

import { EmptyState } from "@/components/site/EmptyState";
import { ProductCard } from "@/components/site/ProductCard";
import { eyebrowClass, fieldClass, pillButtonClass } from "@/components/site/classes";
import { useShopProducts } from "@/components/shop/useShopProducts";
import {
  filterShopProducts,
  shopCategories,
  sortShopProducts,
  type ShopSort,
} from "@/lib/shopCatalogue";
import { useState } from "react";

const SORTS: { value: ShopSort; label: string }[] = [
  { value: "catalogue", label: "Catalogue order" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "mock-popularity", label: "Mock popularity, high to low (not sales)" },
];

function filterClass(active: boolean): string {
  return [
    "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
    active ? "border-ink bg-ink text-studio" : "border-line bg-panel text-ink hover:bg-studio",
  ].join(" ");
}

export function ShopCatalogue() {
  const products = useShopProducts();
  const categories = shopCategories(products);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<ShopSort>("catalogue");
  const filtered = sortShopProducts(filterShopProducts(products, query, category), sort);
  const filtersActive = query.trim() !== "" || category !== "all";

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <div className="mt-10">
      <form role="search" className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="shop-search" className={eyebrowClass}>
            Search
          </label>
          <input
            id="shop-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search placeholder products"
            className={`${fieldClass} mt-3`}
            type="search"
          />
        </div>
        <div>
          <label htmlFor="shop-sort" className={eyebrowClass}>
            Sort
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ShopSort)}
            aria-describedby="shop-sort-note"
            className={`${fieldClass} mt-3`}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>
      <p id="shop-sort-note" className="mt-3 max-w-2xl text-xs leading-relaxed text-muted">
        Mock popularity is a number stored on each placeholder product. It is not sales, views, or a ranking from the
        business. Prices in either price sort are provisional.
      </p>

      <div className="mt-6">
        <p id="shop-category-label" className={eyebrowClass}>
          Category
        </p>
        <p className="mt-2 text-xs text-muted">Placeholder groupings, not a confirmed range.</p>
        <div role="group" aria-labelledby="shop-category-label" className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={filterClass(category === "all")} aria-pressed={category === "all"} onClick={() => setCategory("all")}>
            All
          </button>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={filterClass(category === name)}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="mt-8 text-sm text-muted">
        Showing {filtered.length} of {products.length}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={filtersActive ? "No matching products" : "The catalogue is empty"}
            action={
              filtersActive ? (
                <button type="button" className={pillButtonClass} onClick={clearFilters}>
                  Clear search and category
                </button>
              ) : undefined
            }
          >
            {filtersActive
              ? "Nothing in the placeholder catalogue matches this search and category."
              : "There are no placeholder products to show."}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-6 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
