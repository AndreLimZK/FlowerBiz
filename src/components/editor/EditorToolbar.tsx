import Link from "next/link";

const actions = ["Undo", "Redo", "Reset", "Submit design"] as const;

export function EditorToolbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-6 border-b border-line bg-panel px-4">
      <div className="flex items-baseline gap-5">
        <Link href="/" className="font-serif text-lg tracking-tight">
          FlowerBiz
        </Link>
        <p className="text-sm text-muted">Customiser</p>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            disabled
            title="Not available yet"
            className="border border-line px-3 py-1.5 text-sm text-muted disabled:cursor-not-allowed"
          >
            {action}
          </button>
        ))}
      </div>
    </header>
  );
}
