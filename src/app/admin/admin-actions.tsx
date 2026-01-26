"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useDorm } from "@/lib/store";

export function AdminActions() {
  const router = useRouter();
  const { logout } = useDorm();

  return (
    <button
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
      type="button"
      onClick={() => {
        logout();
        router.replace("/");
      }}
    >
      <LogOut className="size-4" />
      Logout
    </button>
  );
}

