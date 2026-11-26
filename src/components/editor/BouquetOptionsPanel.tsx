export function BouquetOptionsPanel() {
  return (
    <section
      aria-label="Bouquet options"
      className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Options
      </h2>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        Wrapping, stem, and ribbon choices will appear here once the business
        confirms them.
      </p>
    </section>
  );
}
