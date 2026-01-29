"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useDorm } from "@/lib/store";

export function AdminActions() {
  const router = useRouter();
  const { logout } = useDorm();

  return (
    <button
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold hover:bg-zinc-100 sm:gap-2 sm:px-4"
      type="button"
      onClick={async () => {
        await logout();
        router.replace("/");
      }}
    >
      <LogOut className="size-4" />
      Logout
    </button>
  );
}

