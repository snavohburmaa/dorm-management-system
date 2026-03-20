import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-200/70 bg-white p-8",
        "[box-shadow:var(--shadow-sm)]",
        "anim-enter",
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
          {icon}
        </div>
      ) : null}
      <div className="text-center">
        <div className="text-sm font-semibold text-zinc-800">{title}</div>
        {description ? (
          <div className="mt-1.5 text-sm text-zinc-500">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

