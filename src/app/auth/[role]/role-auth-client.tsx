"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useDorm } from "@/lib/store";
import type { Role } from "@/lib/types";

function roleLabel(role: Role) {
  return role === "user" ? "User" : "Technician";
}

function defaultRoute(role: Role) {
  return role === "user" ? "/user/announcements" : "/technician/tasks";
}

export function RoleAuthClient({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const router = useRouter();
  const dorm = useDorm();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState<Role>("user");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await params;
      const raw = p.role;
      setRole(raw === "technician" ? "technician" : "user");
    })();
  }, [params]);

  useEffect(() => {
    if (!dorm.ready) return;
    if (dorm.session?.role === "user") router.replace("/user/announcements");
    if (dorm.session?.role === "technician") router.replace("/technician/tasks");
    if (dorm.session?.role === "admin") router.replace("/admin/dashboard");
  }, [dorm.ready, dorm.session, router]);

  const title = useMemo(() => `${roleLabel(role)} ${mode}`, [mode, role]);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const res =
          role === "user"
            ? await dorm.loginUser({ email, password })
            : await dorm.loginTechnician({ email, password });
        if (!res.ok) setError(res.error ?? "Login failed.");
        else router.replace(defaultRoute(role));
        return;
      }

      const res =
        role === "user"
          ? await dorm.registerUser({ name, email, password, phone })
          : await dorm.registerTechnician({ name, email, password, phone });
      if (!res.ok) setError(res.error ?? "Registration failed.");
      else router.replace(defaultRoute(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check the console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#e4e4e7_0%,_#f7f7f8_70%)] text-zinc-950">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-10 sm:px-5 sm:py-14">

        {/* Back + tab switcher */}
        <div className="anim-fade flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Back
          </Link>
          <div className="inline-flex w-full justify-center rounded-2xl border border-zinc-200/80 bg-white/80 p-1
            [box-shadow:var(--shadow-sm)] sm:w-auto">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                mode === "login"
                  ? "bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.2)]"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                mode === "register"
                  ? "bg-zinc-950 text-white [box-shadow:0_2px_8px_rgba(0,0,0,0.2)]"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>
        </div>

        {/* Header card */}
        <Card className="anim-enter delay-50">
          <CardBody>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {roleLabel(role)}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {mode === "register"
                ? "Create an account to get started."
                : "Sign in to continue."}
            </p>
          </CardBody>
        </Card>

        {/* Form card */}
        <Card className="anim-enter delay-100">
          <CardBody className="space-y-4">
            {mode === "register" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
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

            {mode === "register" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">Phone (optional)</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+95 9 ..." />
              </div>
            ) : null}

            {error ? (
              <div className="anim-pop rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button className="w-full" onClick={onSubmit} type="button" disabled={loading}>
              {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
            </Button>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

