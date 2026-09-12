"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Square,
  RotateCcw,
} from "lucide-react";
import { JoinPanel } from "@/components/JoinPanel";
import { SlideResults } from "@/components/SlideResults";
import { VotingTimerBadge } from "@/components/VotingTimer";
import { usePresentationStream } from "@/lib/use-presentation-stream";
import { SLIDE_TYPE_META } from "@/lib/types";

export default function PresentPage() {
  const params = useParams<{ id: string }>();
  const [code, setCode] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch(`/api/presentations/${params.id}`)
      .then((r) => r.json())
      .then((d) => setCode(d.presentation.code));
  }, [params.id]);

  const { presentation, connected } = usePresentationStream(code);

  const joinUrl = useMemo(
    () => (code ? `${origin}/p/${code}` : ""),
    [origin, code],
  );

  const control = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      await fetch(`/api/presentations/${params.id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
    },
    [params.id],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        control("navigate", { direction: "next" });
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        control("navigate", { direction: "prev" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [control]);

  if (!presentation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white/50">
        Starting presentation…
      </div>
    );
  }

  const slide = presentation.slides[presentation.currentSlideIndex];
  const meta = SLIDE_TYPE_META[slide.type];

  return (
    <div className="flex min-h-screen flex-col bg-[#1a0533] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, #ff6bcb44 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, #7c5cff55 0%, transparent 45%)",
        }}
      />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={`/editor/${presentation.id}`} className="font-display text-lg font-extrabold">
            LiveVote
          </Link>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              presentation.status === "live"
                ? "bg-mm-accent/25 text-mm-accent"
                : "bg-white/10 text-white/60"
            }`}
          >
            {presentation.status}
            {connected ? " · live sync" : ""}
          </span>
          {presentation.status === "live" && (
            <VotingTimerBadge
              closesAt={presentation.votingClosesAt}
              votingOpen={presentation.votingOpen}
              variant="dark"
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {presentation.status !== "live" ? (
            <button
              type="button"
              onClick={() => control("start")}
              className="mm-btn rounded-full bg-mm-accent px-4 py-2 text-sm font-bold text-ink hover:brightness-110"
            >
              Go live · open voting (3 min)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => control("end")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
            >
              <Square className="h-3.5 w-3.5" />
              End
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              control("toggleVoting", { votingOpen: !presentation.votingOpen })
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            {presentation.votingOpen ? (
              <LockOpen className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {presentation.votingOpen ? "Voting open" : "Voting locked"}
          </button>
          <button
            type="button"
            onClick={() =>
              control("toggleResults", { showResults: !presentation.showResults })
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            {presentation.showResults ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Results
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch(
                `/api/presentations/${presentation.id}/slides/${slide.id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "clear" }),
                },
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-4 lg:grid-cols-[1fr_280px] lg:px-6">
        <div className="flex flex-col rounded-[2rem] bg-white text-ink shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4 sm:px-10">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              {meta.label} · {presentation.currentSlideIndex + 1}/
              {presentation.slides.length}
            </span>
            <span className="text-sm text-ink/40">
              {slide.votes.length + slide.questions.length} responses
            </span>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <div className="mt-10 flex-1">
              {presentation.showResults ? (
                <SlideResults
                  slide={slide}
                  revealCorrect={slide.type === "quiz" && !presentation.votingOpen}
                  onHighlight={async (questionId) => {
                    await fetch(
                      `/api/presentations/${presentation.id}/slides/${slide.id}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "highlight", questionId }),
                      },
                    );
                  }}
                />
              ) : (
                <div className="flex min-h-[240px] items-center justify-center text-ink/35">
                  Results hidden — audience is voting
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-ink/5 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => control("navigate", { direction: "prev" })}
              disabled={presentation.currentSlideIndex === 0}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex gap-1.5">
              {presentation.slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => control("navigate", { direction: i })}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === presentation.currentSlideIndex
                      ? "bg-teal-700"
                      : "bg-ink/15 hover:bg-ink/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => control("navigate", { direction: "next" })}
              disabled={
                presentation.currentSlideIndex >= presentation.slides.length - 1
              }
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <JoinPanel
            code={presentation.code}
            joinUrl={joinUrl}
            participants={presentation.participants.length}
          />
          <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70 ring-1 ring-white/10">
            <p className="font-semibold text-white">Presenter tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Arrow keys or space to advance</li>
              <li>Hide results until you&apos;re ready</li>
              <li>Lock voting before revealing quiz answers</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
