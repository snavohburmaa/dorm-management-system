"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type TopTab = {
  href: string;
  label: string;
};

export function TopTabs({ tabs }: { tabs: TopTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="-mb-1 flex flex-shrink-0 items-center justify-end gap-1 sm:gap-2">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-4",
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

