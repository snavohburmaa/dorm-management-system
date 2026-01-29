"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type TopTab = {
  href: string;
  label: string;
};

type TopTabsProps = {
  tabs: TopTab[];
  orientation?: "horizontal" | "vertical";
};

export function TopTabs({ tabs, orientation = "horizontal" }: TopTabsProps) {
  const pathname = usePathname();
  const isVertical = orientation === "vertical";

  return (
    <nav
      className={cn(
        "flex flex-shrink-0 gap-1 sm:gap-2",
        isVertical
          ? "flex-col"
          : "-mb-1 flex-row items-center justify-start",
      )}
    >
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap text-sm font-semibold transition-colors",
              isVertical
                ? "rounded-lg px-3 py-2 sm:px-4"
                : "rounded-full px-3 py-2 sm:px-4",
              active ? "bg-zinc-950 text-white" : "hover:bg-zinc-100",
            )}
            aria-current={active ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

