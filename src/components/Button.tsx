import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold",
        "transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400",
        "active:scale-[0.97]",
        size === "sm" ? "h-10 px-4 text-sm" : "h-11 px-5 text-sm",
        variant === "primary" && [
          "bg-zinc-950 text-white",
          "[box-shadow:0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]",
          "hover:bg-zinc-800 hover:[box-shadow:0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.07)]",
          "hover:-translate-y-px",
        ],
        variant === "secondary" && [
          "bg-white text-zinc-900 border border-zinc-200/80",
          "[box-shadow:var(--shadow-sm)]",
          "hover:bg-zinc-50 hover:[box-shadow:var(--shadow-md)] hover:-translate-y-px",
        ],
        variant === "ghost" && "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
        variant === "danger" && [
          "bg-red-600 text-white",
          "[box-shadow:0_1px_2px_rgba(220,38,38,0.35)]",
          "hover:bg-red-700 hover:[box-shadow:0_4px_12px_rgba(220,38,38,0.3)] hover:-translate-y-px",
        ],
        className,
      )}
      {...props}
    />
  );
}

