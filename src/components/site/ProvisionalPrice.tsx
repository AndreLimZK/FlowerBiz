import { formatCatalogueAmount } from "@/lib/shopCatalogue";

export function ProvisionalPrice({ amount, compact = false }: { amount: number; compact?: boolean }) {
  const shown = formatCatalogueAmount(amount);

  if (compact) {
    return (
      <p>
        <span className="font-serif text-[1.75rem] leading-none tracking-[-0.03em] text-ink tabular-nums">{shown}</span>
        <span className="mt-2 block text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">
          Provisional price
        </span>
      </p>
    );
  }

  return (
    <div>
      <p className="font-serif text-5xl leading-none tracking-[-0.03em] text-ink tabular-nums">{shown}</p>
      <p className="mt-3 text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">Provisional price</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Catalogue placeholder. Not a confirmed business price.
      </p>
    </div>
  );
}
