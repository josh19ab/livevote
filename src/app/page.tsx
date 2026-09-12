"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QrScannerButton } from "@/components/QrScannerButton";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/join/${cleaned}`);
      if (!res.ok) {
        setError("That code wasn’t found. Check the screen and try again.");
        return;
      }
      router.push(`/p/${cleaned}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mm-gradient relative flex min-h-screen flex-col overflow-hidden text-white">
      <div
        aria-hidden
        className="animate-floaty pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-mm-accent/30 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-floaty pointer-events-none absolute -right-16 bottom-28 h-64 w-64 rounded-full bg-mm-accent-2/35 blur-3xl"
        style={{ animationDelay: "1.2s" }}
      />

      <header className="relative z-10 px-6 py-8 text-center">
        <p className="font-display animate-rise text-3xl font-extrabold tracking-tight sm:text-4xl">
          LiveVote
        </p>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <div className="animate-rise text-center" style={{ animationDelay: "80ms" }}>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Join the contest
          </h1>
          <p className="mt-3 text-base text-white/70">
            Enter the code on screen, or scan the QR with your phone.
          </p>
        </div>

        <form
          onSubmit={join}
          className="animate-rise mt-8 rounded-[2rem] bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-8"
          style={{ animationDelay: "160ms" }}
        >
          <label className="block text-center text-sm font-semibold text-muted">
            Contest code
          </label>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            maxLength={6}
            placeholder="ABC123"
            autoComplete="off"
            autoCapitalize="characters"
            className="font-display mt-3 w-full rounded-2xl border-2 border-ink/10 bg-canvas px-4 py-4 text-center text-3xl font-extrabold tracking-[0.35em] text-ink outline-none transition focus:border-teal-700"
          />
          {error && (
            <p className="mt-3 text-center text-sm text-coral">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || code.trim().length < 4}
            className="mm-btn mt-5 w-full rounded-full bg-teal-700 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-800/25 hover:bg-teal-800 disabled:opacity-50"
          >
            {busy ? "Joining…" : "Join"}
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            <span className="h-px flex-1 bg-ink/10" />
            or
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <div className="mt-0">
            <QrScannerButton variant="light" />
          </div>
        </form>

        <p
          className="animate-rise mt-8 text-center text-sm text-white/45"
          style={{ animationDelay: "240ms" }}
        >
          Waiting for the host to go live? Stay on this page after you join.
        </p>
      </main>
    </div>
  );
}
