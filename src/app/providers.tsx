"use client";

import { DormProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DormProvider>{children}</DormProvider>;
}

