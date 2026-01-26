import { cn } from "@/lib/cn";

type Tone = "neutral" | "warning" | "info" | "success";

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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-zinc-100 text-zinc-700",
        tone === "warning" && "bg-amber-100 text-amber-800",
        tone === "info" && "bg-blue-100 text-blue-800",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        className,
      )}
    >
      {children}
    </span>
  );
}

