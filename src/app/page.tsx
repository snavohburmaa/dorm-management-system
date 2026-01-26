import Link from "next/link";
import { Wrench, UserRound, Shield } from "lucide-react";
import { Card, CardBody } from "@/components/Card";

export default function Home() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-10">
        <div className="rounded-3xl border border-zinc-200 bg-white p-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-zinc-600">
                Dorm Management
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Choose your role
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Select User or Technician to continue to login/register.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <Shield className="size-4" />
              Admin login
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/auth/user" className="group">
            <Card className="transition group-hover:shadow-sm">
              <CardBody className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-3xl bg-zinc-100">
                  <UserRound className="size-6 text-zinc-900" />
                </div>
                <div>
                  <div className="text-lg font-semibold">User</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    View announcements, notifications, and report issues.
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/auth/technician" className="group">
            <Card className="transition group-hover:shadow-sm">
              <CardBody className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-3xl bg-zinc-100">
                  <Wrench className="size-6 text-zinc-900" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Technician</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Accept tasks, update status, and add repair notes.
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>

        <div className="text-xs text-zinc-500">
          Demo credentials: user `user@dorm.local` / `user123`, technician
          `tech@dorm.local` / `tech123`, admin `admin@dorm.local` / `admin123`.
        </div>
      </main>
    </div>
  );
}
