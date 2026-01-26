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
    <div className={cn("min-h-dvh bg-zinc-50 text-zinc-950", className)}>
      {children}
    </div>
  );
}

