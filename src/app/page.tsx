"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { QrScannerButton } from "@/components/QrScannerButton";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);

  async function createPresentation() {
    setCreating(true);
    try {
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My contest" }),
      });
      const data = await res.json();
      router.push(`/editor/${data.presentation.id}`);
    } finally {
      setCreating(false);
    }
  }

  function join(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned) router.push(`/p/${cleaned}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, #c5ebe3 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, #f8c9b8 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 100%, #ebe4d8 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1f1c' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          LiveVote
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink/80 transition hover:bg-ink/10"
        >
          Host dashboard
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-8 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-700/15">
              <Sparkles className="h-3.5 w-3.5" />
              Unlimited participants · 3‑min voting windows
            </p>
            <h1 className="font-display mt-6 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              LiveVote
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/65 sm:text-xl">
              Share this link with your audience. They join with a contest code or by
              scanning the QR — then vote live when you go live.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createPresentation}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create a contest"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3.5 text-base font-semibold text-ink ring-1 ring-ink/10 transition hover:bg-white"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="animate-rise relative" style={{ animationDelay: "120ms" }}>
            <div className="animate-drift absolute -right-4 -top-6 h-24 w-24 rounded-full bg-coral/25 blur-2xl" />
            <div className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-teal-700/20 blur-2xl" />
            <form
              onSubmit={join}
              className="relative rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-ink/5 ring-1 ring-ink/5 backdrop-blur sm:p-8"
            >
              <div className="mb-5 flex items-center gap-2 text-teal-700">
                <Users className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Join the contest
                </span>
              </div>
              <label className="block text-sm font-medium text-ink/60">
                Enter the contest code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="DEMO01"
                className="font-display mt-2 w-full rounded-2xl border border-ink/10 bg-canvas px-4 py-4 text-center text-3xl font-bold tracking-[0.35em] outline-none ring-teal-600/25 focus:ring-2"
              />
              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-ink/90"
              >
                Join with code
              </button>

              <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35">
                <span className="h-px flex-1 bg-ink/10" />
                or
                <span className="h-px flex-1 bg-ink/10" />
              </div>

              <QrScannerButton />

              <p className="mt-4 text-center text-sm text-ink/45">
                Demo code{" "}
                <button
                  type="button"
                  onClick={() => setCode("DEMO01")}
                  className="font-semibold text-teal-700 underline-offset-2 hover:underline"
                >
                  DEMO01
                </button>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
