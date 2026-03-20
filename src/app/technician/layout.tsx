import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";
import { TechnicianBadge } from "@/app/technician/technician-badge";
import { TechnicianNav } from "@/app/technician/technician-nav";

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_80%_50%_at_50%_-5%,_#e4e4e7_0%,_#f7f7f8_60%)] text-zinc-950">
      <RoleGuard role="technician" />
      <header className="sticky top-0 z-20 border-b border-zinc-200/50
        bg-white/70 backdrop-blur-xl
        [box-shadow:0_1px_0_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5">
          <TechnicianBadge />
          <TechnicianNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-5 sm:py-7">
        {children}
      </main>
    </div>
  );
}

