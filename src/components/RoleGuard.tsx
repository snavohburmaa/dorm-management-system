"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { useDorm } from "@/lib/store";
import { getSessionFromCookie } from "@/lib/session";

function defaultRouteFor(role: Role) {
  if (role === "user") return "/user/announcements";
  if (role === "technician") return "/technician/tasks";
  return "/admin/dashboard";
}

export function RoleGuard({ role }: { role: Role }) {
  const { ready, session, setSession } = useDorm();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    // Rehydrate session from cookie when store has none (e.g. after navigation or remount)
    if (!session && typeof document !== "undefined") {
      const fromCookie = getSessionFromCookie(document.cookie);
      if (fromCookie) {
        setSession(fromCookie);
        return;
      }
      const target = role === "admin" ? "/admin/login" : `/auth/${role}`;
      if (pathname !== target) router.replace(target);
      return;
    }

    if (!session) return;

    if (session.role !== role) {
      router.replace(defaultRouteFor(session.role));
      return;
    }

    // If someone hits /user or /technician without a subpage.
    if (pathname === "/user") router.replace("/user/announcements");
    if (pathname === "/technician") router.replace("/technician/tasks");
    if (pathname === "/admin") router.replace("/admin/dashboard");
  }, [pathname, ready, role, router, session, setSession]);

  return null;
}

