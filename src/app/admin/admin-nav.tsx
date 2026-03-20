"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests",  label: "Requests" },
  { href: "/admin/history",   label: "History" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <>
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
    </>
  );
}
