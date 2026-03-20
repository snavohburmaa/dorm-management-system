"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/technician/tasks",   label: "Tasks" },
  { href: "/technician/history", label: "History" },
  { href: "/technician/profile", label: "Profile" },
];

export function TechnicianNav() {
  const pathname = usePathname();
  return (
    <nav className="scrollbar-hide flex min-w-0 flex-1 justify-end overflow-x-auto">
      <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 sm:px-4",
                active
                  ? "bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.18)]"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
