import Link from "next/link";
import { Wrench, UserRound, Shield, ArrowRight, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_#e4e4e7_0%,_#f7f7f8_70%)] text-zinc-950">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-16 sm:py-24">

        {/* Hero */}
        <div className="anim-enter flex flex-col items-center gap-4 text-center">
          <div className="grid size-16 place-items-center rounded-[22px] bg-zinc-950 shadow-lg shadow-zinc-900/20 sm:size-20 sm:rounded-3xl">
            <Building2 className="size-8 text-white sm:size-10" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Dorm Management System
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
              Sign in or register to manage dormitory operations, track
              maintenance requests, and stay informed.
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="anim-enter delay-100 grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
          <Link
            href="/auth/user"
            className="group relative flex items-center gap-4 rounded-3xl border border-zinc-200/70 bg-white p-5 transition-all duration-300
              [box-shadow:var(--shadow-md)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-xl)]
              active:translate-y-0 active:[box-shadow:var(--shadow-sm)]"
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-100
              transition-transform duration-300 group-hover:scale-110 group-hover:bg-zinc-200">
              <UserRound className="size-6 text-zinc-800" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">Resident</div>
              <div className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                Announcements, requests &amp; notifications
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-zinc-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-zinc-600" />
          </Link>

          <Link
            href="/auth/technician"
            className="group relative flex items-center gap-4 rounded-3xl border border-zinc-200/70 bg-white p-5 transition-all duration-300
              [box-shadow:var(--shadow-md)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-xl)]
              active:translate-y-0 active:[box-shadow:var(--shadow-sm)]"
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-zinc-100
              transition-transform duration-300 group-hover:scale-110 group-hover:bg-zinc-200">
              <Wrench className="size-6 text-zinc-800" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">Technician</div>
              <div className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                Accept tasks, update status &amp; add notes
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-zinc-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-zinc-600" />
          </Link>
        </div>

        {/* Admin link */}
        <div className="anim-enter delay-200">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/60 bg-white/60 px-5 py-2.5 text-sm font-semibold text-zinc-700
              transition-all duration-200 hover:bg-white hover:text-zinc-950 hover:[box-shadow:var(--shadow-md)]
              [box-shadow:var(--shadow-sm)]"
          >
            <Shield className="size-4" />
            Admin login
          </Link>
        </div>

      </main>
    </div>
  );
}
