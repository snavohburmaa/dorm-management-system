import Link from "next/link";
import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminActions } from "@/app/admin/admin-actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <RoleGuard role="admin" />
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-950 text-xs font-semibold text-white sm:size-10 sm:rounded-2xl sm:text-sm">
              A
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-5">Admin</div>
              <div className="hidden truncate text-xs text-zinc-500 sm:block">
                Manage & report
              </div>
            </div>
          </div>

          <nav className="scrollbar-hide flex min-w-0 flex-1 justify-end overflow-x-auto">
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/admin/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/admin/requests"
              >
                Requests
              </Link>
              <Link
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:px-4"
                href="/admin/history"
              >
                History
              </Link>
              <AdminActions />
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-5 sm:py-6">{children}</main>
    </div>
  );
}

