import { cn } from "@/lib/cn";

type Tone = "neutral" | "warning" | "info" | "success" | "danger";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        "ring-1 ring-inset",
        tone === "neutral" && "bg-zinc-100 text-zinc-700 ring-zinc-200/60",
        tone === "warning" && "bg-amber-50 text-amber-700 ring-amber-200/60",
        tone === "info"    && "bg-sky-50 text-sky-700 ring-sky-200/60",
        tone === "success" && "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
        tone === "danger"  && "bg-red-50 text-red-700 ring-red-200/60",
        className,
      )}
    >
      {children}
    </span>
  );
}

