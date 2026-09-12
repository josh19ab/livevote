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
    <div className="mm-gradient relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden
        className="animate-floaty pointer-events-none absolute -right-10 top-20 h-40 w-40 rounded-full bg-mm-accent/25 blur-3xl"
      />
      <header className="relative z-10 mx-auto flex max-w-lg items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-lg font-extrabold">
          LiveVote
        </Link>
        <div className="text-right text-xs text-white/60">
          <p className="font-bold tracking-wider text-white">{code}</p>
          <p>{connected ? "Connected" : "Reconnecting…"}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16">
        {error ? (
          <div className="animate-pop rounded-3xl bg-white p-8 text-center text-ink shadow-xl">
            <p className="font-display text-2xl font-bold">Contest not found</p>
            <Link href="/" className="mt-4 inline-block font-semibold text-teal-700 underline">
              Try another code
            </Link>
          </div>
        ) : !presentation || !voterId ? (
          <p className="text-center text-white/50">Connecting…</p>
        ) : (
          <div className="animate-rise">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              maxLength={40}
              className="mb-5 w-full rounded-2xl border-0 bg-white/95 px-4 py-3 text-sm text-ink outline-none ring-2 ring-transparent focus:ring-mm-accent"
            />
            <AudienceVotePanel
              presentation={presentation}
              voterId={voterId}
              displayName={name}
            />
            {presentation.status === "live" && (
              <p className="mt-4 text-center text-sm text-white/45">
                Results appear on the presenter’s screen.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
