import { flowers } from "@/data/flowers";

export function FlowerLibrary() {
  return (
    <section
      className="flex h-full flex-col"
      aria-labelledby="flower-library-heading"
    >
      <header className="border-b border-line px-5 py-4">
        <p className="text-xs font-medium tracking-[0.14em] text-moss uppercase">
          Library
        </p>
        <h2
          id="flower-library-heading"
          className="mt-1 font-serif text-2xl tracking-tight"
        >
          Flowers
        </h2>
      </header>
      <div className="px-5 py-5">
        {flowers.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">
            No flowers are available yet. Approved types and colours will
            appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {flowers.map((flower) => (
              <li
                key={flower.id}
                className="border border-line px-3 py-3 text-sm"
              >
                {flower.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
