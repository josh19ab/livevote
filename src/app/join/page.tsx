"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users } from "lucide-react";
import { QrScannerButton } from "@/components/QrScannerButton";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    const res = await fetch(`/api/join/${cleaned}`);
    if (!res.ok) {
      setError("No contest found with that code.");
      return;
    }
    router.push(`/p/${cleaned}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, #c5ebe3 0%, transparent 60%)",
        }}
      />
      <Link href="/" className="font-display relative z-10 text-2xl font-bold">
        LiveVote
      </Link>
      <form
        onSubmit={onSubmit}
        className="relative z-10 mt-8 w-full max-w-md rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-ink/5"
      >
        <h1 className="font-display text-3xl font-semibold">Join the contest</h1>
        <p className="mt-2 text-ink/55">Enter the code or scan the QR on screen.</p>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          maxLength={6}
          placeholder="ABCDEF"
          className="font-display mt-6 w-full rounded-2xl border border-ink/10 bg-canvas px-4 py-4 text-center text-3xl font-bold tracking-[0.35em] outline-none focus:ring-2 focus:ring-teal-600/30"
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button
          type="submit"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 py-3.5 font-semibold text-white hover:bg-teal-800"
        >
          <Users className="h-4 w-4" />
          Join with code
        </button>
        <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35">
          <span className="h-px flex-1 bg-ink/10" />
          or
          <span className="h-px flex-1 bg-ink/10" />
        </div>
        <QrScannerButton />
      </form>
    </div>
  );
}
