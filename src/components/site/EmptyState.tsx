import type { ReactNode } from "react";

export function EmptyState({
  title,
  titleAs = "h2",
  children,
  action,
}: {
  title: string;
  titleAs?: "h1" | "h2";
  children: ReactNode;
  action?: ReactNode;
}) {
  const Title = titleAs;
  return (
    <div className="rounded-[1.75rem] border border-dashed border-line bg-panel px-6 py-14 text-center">
      <Title className="font-serif text-3xl tracking-[-0.03em] text-ink">{title}</Title>
      <div className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{children}</div>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}
