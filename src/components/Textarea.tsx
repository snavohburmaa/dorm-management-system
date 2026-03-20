import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-sm text-zinc-900",
        "outline-none placeholder:text-zinc-400",
        "[box-shadow:var(--shadow-xs),inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "transition-all duration-150",
        "focus:border-zinc-400 focus:[box-shadow:0_0_0_3px_rgba(0,0,0,0.06),var(--shadow-xs)]",
        className,
      )}
      {...props}
    />
  );
}

