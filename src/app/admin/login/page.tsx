"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { useDorm } from "@/lib/store";
import { ADMIN_CREDENTIALS } from "@/lib/seed";

export default function AdminLoginPage() {
  const router = useRouter();
  const dorm = useDorm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dorm.ready) return;
    if (dorm.session?.role === "admin") router.replace("/admin/dashboard");
  }, [dorm.ready, dorm.session, router]);

  function onSubmit() {
    setError(null);
    const res = dorm.loginAdmin({ email, password });
    if (!res.ok) setError(res.error);
    else router.replace("/admin/dashboard");
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8 sm:px-5 sm:py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-zinc-700 hover:text-zinc-950">
            ← Back
          </Link>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-2xl font-semibold tracking-tight">Admin login</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Demo: <span className="font-semibold">{ADMIN_CREDENTIALS.email}</span> /{" "}
              <span className="font-semibold">{ADMIN_CREDENTIALS.password}</span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Email</div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dorm.local"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-600">Password</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </div>
            ) : null}

            <Button className="w-full" onClick={onSubmit} type="button">
              Login
            </Button>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

