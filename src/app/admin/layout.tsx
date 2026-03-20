import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminActions } from "@/app/admin/admin-actions";
import { AdminNav } from "@/app/admin/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_80%_50%_at_50%_-5%,_#e4e4e7_0%,_#f7f7f8_60%)] text-zinc-950">
      <RoleGuard role="admin" />
      <header className="sticky top-0 z-20 border-b border-zinc-200/50
        bg-white/70 backdrop-blur-xl
        [box-shadow:0_1px_0_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5">
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl
              bg-zinc-950 text-xs font-semibold text-white
              [box-shadow:0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]
              sm:size-10 sm:rounded-2xl sm:text-sm">
              A
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-5">Admin</div>
              <div className="hidden truncate text-xs text-zinc-500 sm:block">Manage &amp; report</div>
            </div>
          </div>

          <div className="scrollbar-hide flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:gap-2">
            <AdminNav />
            <AdminActions />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-5 sm:py-7">
        {children}
      </main>
    </div>
  );
}

