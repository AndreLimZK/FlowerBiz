/**
 * Flat swatch fills so catalogue cards can be told apart.
 * These are not photographs and not product imagery.
 */
const SWATCH_FILLS: Record<string, string> = {
  "shop-blush-bunch": "#e4cfc9",
  "shop-cream-posy": "#f0e6d2",
  "shop-sage-wrap": "#d5ddd0",
  "shop-ink-ribbon": "#d4cdc4",
};

export function ProductPlaceholder({
  productId,
  label,
  className = "h-44",
}: {
  productId: string;
  label: string;
  className?: string;
}) {
  const fill = SWATCH_FILLS[productId] ?? "#e6dfd4";

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative overflow-hidden rounded-[1.25rem] border border-line ${className}`}
      style={{ backgroundColor: fill }}
    >
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <svg viewBox="0 0 120 48" className="h-8 w-16 text-ink/40">
          <circle cx="46" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="74" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[0.72rem] font-medium tracking-[0.18em] text-ink/80 uppercase">Placeholder</span>
        <span className="max-w-[16rem] text-xs leading-relaxed text-muted">{label}</span>
      </div>
    </div>
  );
}
