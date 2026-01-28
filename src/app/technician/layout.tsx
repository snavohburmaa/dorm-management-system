import type { ReactNode } from "react";
import { TopTabs } from "@/components/TopTabs";
import { RoleGuard } from "@/components/RoleGuard";
import { TechnicianBadge } from "@/app/technician/technician-badge";

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <RoleGuard role="technician" />
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
          <TechnicianBadge />

          <TopTabs
            tabs={[
              { href: "/technician/tasks", label: "Tasks" },
              { href: "/technician/history", label: "History" },
              { href: "/technician/profile", label: "Profile" },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-6">{children}</main>
    </div>
  );
}

