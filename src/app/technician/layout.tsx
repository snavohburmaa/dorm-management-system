import Link from "next/link";
import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { TechnicianBadge } from "@/app/technician/technician-badge";

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <RoleGuard role="technician" />
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <TechnicianBadge />
          <nav className="scrollbar-hide flex min-w-0 flex-1 justify-end overflow-x-auto">
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/technician/tasks"
              >
                Tasks
              </Link>
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/technician/history"
              >
                History
              </Link>
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/technician/profile"
              >
                Profile
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-5 sm:py-6">{children}</main>
    </div>
  );
}

