import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-dvh text-zinc-950",
        "bg-[radial-gradient(ellipse_at_top,_#f0f0f2_0%,_#f7f7f8_60%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

