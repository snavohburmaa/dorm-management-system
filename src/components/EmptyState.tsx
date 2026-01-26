import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-zinc-200 bg-white p-6", className)}>
      <div className="text-sm font-semibold">{title}</div>
      {description ? (
        <div className="mt-2 text-sm text-zinc-600">{description}</div>
      ) : null}
    </div>
  );
}

