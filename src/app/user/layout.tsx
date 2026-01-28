import type { ReactNode } from "react";
import { TopTabs } from "@/components/TopTabs";
import { RoleGuard } from "@/components/RoleGuard";
import { UserBadge } from "@/app/user/user-badge";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <RoleGuard role="user" />
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <UserBadge />

          <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto">
            <TopTabs
              tabs={[
                { href: "/user/announcements", label: "Announcement" },
                { href: "/user/requests", label: "Request list" },
                { href: "/user/notifications", label: "Notification" },
                { href: "/user/profile", label: "Profile" },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-5 sm:py-6">{children}</main>
    </div>
  );
}

