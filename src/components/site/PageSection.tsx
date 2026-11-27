import { eyebrowClass } from "@/components/site/classes";
import type { ReactNode } from "react";

export function PageSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="rounded-[1.75rem] border border-line bg-panel px-6 py-8 md:px-10 md:py-10"
    >
      <p className={eyebrowClass}>{eyebrow}</p>
      <h2 id={titleId} className="mt-3 font-serif text-3xl tracking-[-0.03em] text-ink md:text-4xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
