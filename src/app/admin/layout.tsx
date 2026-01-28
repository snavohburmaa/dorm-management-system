import Link from "next/link";
import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminActions } from "@/app/admin/admin-actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <RoleGuard role="admin" />
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white">
              A
            </div>
            <div>
              <div className="text-sm font-semibold leading-5">Admin</div>
              <div className="text-xs text-zinc-500">Manage & report</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
              href="/admin/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
              href="/admin/requests"
            >
              Requests
            </Link>
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
              href="/admin/history"
            >
              History
            </Link>
            <AdminActions />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}

