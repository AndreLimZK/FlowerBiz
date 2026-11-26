export function PriceSummary() {
  return (
    <section
      aria-label="Bouquet summary"
      className="rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Summary
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-ink">
        Nothing is placed in this bouquet yet.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The estimate will appear here once the business confirms pricing.
      </p>
    </section>
  );
}
