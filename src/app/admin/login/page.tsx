"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Input";
import { useDorm } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const dorm = useDorm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dorm.ready) return;
    if (dorm.session?.role === "admin") router.replace("/admin/dashboard");
  }, [dorm.ready, dorm.session, router]);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await dorm.loginAdmin({ email, password });
      if (!res.ok) setError(res.error ?? "Login failed.");
      else router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#e4e4e7_0%,_#f7f7f8_70%)] text-zinc-950">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-10 sm:px-5 sm:py-14">
        <div className="anim-fade">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Back
          </Link>
        </div>

        <Card className="anim-enter delay-50">
          <CardBody>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Admin</div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Admin login</h1>
            <p className="mt-1.5 text-sm text-zinc-500">Sign in to access the control centre.</p>
          </CardBody>
        </Card>

        <Card className="anim-enter delay-100">
          <CardBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dorm.local"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="anim-pop rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button className="w-full" onClick={onSubmit} type="button" disabled={loading}>
              {loading ? "Please wait…" : "Sign in"}
            </Button>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

