"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AudienceVotePanel } from "@/components/AudienceVotePanel";
import { getVoterId } from "@/lib/helpers";
import { usePresentationStream } from "@/lib/use-presentation-stream";

export default function AudiencePage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const [voterId, setVoterId] = useState("");
  const [name, setName] = useState("Guest");
  const [joined, setJoined] = useState(false);
  const { presentation, error, connected } = usePresentationStream(code);

  useEffect(() => {
    const id = getVoterId();
    setVoterId(id);
    const saved = localStorage.getItem("livevote_display_name");
    if (saved) setName(saved);
  }, []);

  useEffect(() => {
    if (!voterId || joined) return;
    fetch(`/api/join/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId }),
    }).then(() => setJoined(true));
  }, [voterId, code, joined]);

  function saveName(value: string) {
    setName(value);
    localStorage.setItem("livevote_display_name", value);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, #c5ebe3 0%, transparent 70%)",
        }}
      />
      <header className="relative z-10 mx-auto flex max-w-lg items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-lg font-bold">
          LiveVote
        </Link>
        <div className="text-right text-xs text-ink/45">
          <p className="font-semibold tracking-wider text-teal-700">{code}</p>
          <p>{connected ? "Connected" : "Reconnecting…"}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16">
        {error ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
            <p className="font-display text-2xl">Session not found</p>
            <Link href="/join" className="mt-4 inline-block text-teal-700 underline">
              Try another code
            </Link>
          </div>
        ) : !presentation || !voterId ? (
          <p className="text-center text-ink/40">Connecting…</p>
        ) : (
          <>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              maxLength={40}
              className="mb-5 w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-600/25"
            />
            <AudienceVotePanel
              presentation={presentation}
              voterId={voterId}
              displayName={name}
            />
            {presentation.showResults &&
              presentation.status === "live" &&
              presentation.slides[presentation.currentSlideIndex]?.type !== "qa" && (
                <p className="mt-4 text-center text-sm text-ink/40">
                  Results update live on the presenter screen.
                </p>
              )}
          </>
        )}
      </main>
    </div>
  );
}
