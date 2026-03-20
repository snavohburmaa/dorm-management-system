import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  lift = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-3xl border bg-white",
        "border-zinc-200/70",
        "[box-shadow:var(--shadow-md)]",
        "[background-image:linear-gradient(to_bottom,#fff_0%,#fafafa_100%)]",
        lift && "lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4 sm:p-6", className)}>{children}</div>;
}

