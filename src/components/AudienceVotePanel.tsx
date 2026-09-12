"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Send } from "lucide-react";
import { getVoteValue, hasVoted } from "@/lib/helpers";
import type { Presentation, Slide } from "@/lib/types";
import { CHART_COLORS } from "@/lib/types";
import { VotingTimerBadge } from "@/components/VotingTimer";

async function postVote(payload: Record<string, unknown>) {
  const res = await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Vote failed");
  return res.json();
}

export function AudienceVotePanel({
  presentation,
  voterId,
  displayName,
}: {
  presentation: Presentation;
  voterId: string;
  displayName: string;
}) {
  const slide = presentation.slides[presentation.currentSlideIndex];
  if (!slide) return null;

  if (presentation.status === "ended") {
    return (
      <div className="animate-pop rounded-3xl bg-white p-8 text-center text-ink shadow-xl">
        <p className="font-display text-2xl font-bold">Contest ended</p>
        <p className="mt-2 text-muted">Thanks for voting!</p>
      </div>
    );
  }

  if (presentation.status !== "live") {
    return (
      <div className="animate-pop rounded-3xl bg-white p-8 text-center text-ink shadow-xl">
        <div className="relative mx-auto mb-4 h-14 w-14">
          <span className="animate-pulse-ring absolute inset-0 rounded-full bg-teal-700/30" />
          <span className="absolute inset-2 rounded-full bg-teal-700/20" />
        </div>
        <p className="font-display text-2xl font-bold">Waiting for host…</p>
        <p className="mt-2 text-muted">
          Code{" "}
          <span className="font-bold text-teal-700">{presentation.code}</span>
        </p>
        <p className="mt-4 text-sm text-muted">
          {presentation.participants.length} joined — voting opens when the host goes live.
        </p>
      </div>
    );
  }

  if (!presentation.votingOpen && slide.type !== "qa") {
    return (
      <div className="animate-pop rounded-3xl bg-white p-8 text-center text-ink shadow-xl">
        <p className="font-display text-2xl font-bold">Voting closed</p>
        <p className="mt-2 text-muted">
          The 3‑minute window ended. Results are on the presenter’s screen.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-pop rounded-3xl bg-white p-6 text-ink shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
          {slide.type.replace("_", " ")}
        </p>
        <VotingTimerBadge
          closesAt={presentation.votingClosesAt}
          votingOpen={presentation.votingOpen}
        />
      </div>
      <h1 className="font-display mt-2 text-2xl font-bold leading-tight sm:text-3xl">
        {slide.title}
      </h1>
      <div className="mt-6">
        <VoteForm
          slide={slide}
          code={presentation.code}
          voterId={voterId}
          displayName={displayName}
        />
      </div>
    </div>
  );
}

function VoteForm({
  slide,
  code,
  voterId,
  displayName,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  displayName: string;
}) {
  const voted = hasVoted(slide, voterId);
  const existing = getVoteValue(slide, voterId);

  if (slide.type === "multiple_choice" || slide.type === "quiz") {
    return (
      <ChoiceVote
        slide={slide}
        code={code}
        voterId={voterId}
        voted={voted}
        selected={typeof existing === "number" ? existing : null}
      />
    );
  }
  if (slide.type === "word_cloud" || slide.type === "open_ended") {
    return (
      <TextVote
        slide={slide}
        code={code}
        voterId={voterId}
        voted={voted}
        existing={typeof existing === "string" ? existing : ""}
        multiline={slide.type === "open_ended"}
      />
    );
  }
  if (slide.type === "ranking") {
    return (
      <RankingVote
        slide={slide}
        code={code}
        voterId={voterId}
        voted={voted}
        existing={Array.isArray(existing) ? existing : null}
      />
    );
  }
  if (slide.type === "rating") {
    return (
      <RatingVote
        slide={slide}
        code={code}
        voterId={voterId}
        voted={voted}
        selected={typeof existing === "number" ? existing : null}
      />
    );
  }
  if (slide.type === "qa") {
    return <QAVote slide={slide} code={code} voterId={voterId} displayName={displayName} />;
  }
  return null;
}

function ChoiceVote({
  slide,
  code,
  voterId,
  voted,
  selected,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  voted: boolean;
  selected: number | null;
}) {
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return slide.options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !q || option.toLowerCase().includes(q));
  }, [slide.options, query]);

  async function choose(index: number) {
    setBusy(true);
    try {
      await postVote({ action: "vote", code, slideId: slide.id, voterId, value: index });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {slide.options.length >= 1 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or option…"
          className="w-full rounded-2xl border border-ink/10 bg-canvas px-4 py-3 text-base outline-none ring-teal-600/30 focus:ring-2"
        />
      )}
      <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/45">No matches for “{query}”.</p>
        ) : (
          filtered.map(({ option, index }) => {
            const active = selected === index;
            return (
              <button
                key={index}
                type="button"
                disabled={busy}
                onClick={() => choose(index)}
                className={`mm-btn flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition sm:text-lg ${
                  active
                    ? "border-teal-700 bg-teal-50 text-teal-800"
                    : "border-ink/10 bg-canvas hover:border-teal-700/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate">{option}</span>
                </span>
                {active && <Check className="h-5 w-5 shrink-0 text-teal-700" />}
              </button>
            );
          })
        )}
      </div>
      <p className="text-center text-xs text-ink/40">
        {slide.options.length} options
        {query ? ` · showing ${filtered.length}` : ""}
      </p>
      {voted && (
        <p className="text-center text-sm text-teal-700">
          Vote recorded — tap another option to change it.
        </p>
      )}
    </div>
  );
}

function TextVote({
  slide,
  code,
  voterId,
  voted,
  existing,
  multiline,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  voted: boolean;
  existing: string;
  multiline: boolean;
}) {
  const [text, setText] = useState(existing);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(voted);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await postVote({
        action: "vote",
        code,
        slideId: slide.id,
        voterId,
        value: text.trim(),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {multiline ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={280}
          placeholder="Type your answer…"
          className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas px-4 py-3 text-base outline-none ring-teal-600/30 focus:ring-2"
        />
      ) : (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={40}
          placeholder="One word…"
          className="w-full rounded-2xl border border-ink/10 bg-canvas px-4 py-3 text-base outline-none ring-teal-600/30 focus:ring-2"
        />
      )}
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {done ? "Update response" : "Submit"}
      </button>
    </form>
  );
}

function RankingVote({
  slide,
  code,
  voterId,
  voted,
  existing,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  voted: boolean;
  existing: number[] | null;
}) {
  const initial = useMemo(
    () => existing ?? slide.options.map((_, i) => i),
    [existing, slide.options],
  );
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState(false);

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  async function submit() {
    setBusy(true);
    try {
      await postVote({ action: "vote", code, slideId: slide.id, voterId, value: order });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {order.map((optionIndex, position) => (
        <div
          key={optionIndex}
          className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-canvas px-3 py-2"
        >
          <span className="font-display w-6 text-center text-lg text-ink/35">
            {position + 1}
          </span>
          <span className="flex-1 font-medium">{slide.options[optionIndex]}</span>
          <button
            type="button"
            aria-label="Move up"
            onClick={() => move(position, -1)}
            className="rounded-lg p-2 hover:bg-ink/5"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            onClick={() => move(position, 1)}
            className="rounded-lg p-2 hover:bg-ink/5"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="rounded-full bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {voted ? "Update ranking" : "Submit ranking"}
      </button>
    </div>
  );
}

function RatingVote({
  slide,
  code,
  voterId,
  voted,
  selected,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  voted: boolean;
  selected: number | null;
}) {
  const [busy, setBusy] = useState(false);
  const max = slide.maxRating || 5;

  async function choose(n: number) {
    setBusy(true);
    try {
      await postVote({ action: "vote", code, slideId: slide.id, voterId, value: n });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={busy}
            onClick={() => choose(n)}
            className={`font-display h-14 w-14 rounded-2xl text-xl font-bold transition ${
              selected === n
                ? "bg-teal-700 text-white shadow-md"
                : "bg-canvas text-ink ring-1 ring-ink/10 hover:ring-teal-600/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {voted && (
        <p className="mt-4 text-center text-sm text-teal-700">Rating saved.</p>
      )}
    </div>
  );
}

function QAVote({
  slide,
  code,
  voterId,
  displayName,
}: {
  slide: Slide;
  code: string;
  voterId: string;
  displayName: string;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const sorted = [...slide.questions].sort((a, b) => b.upvotes - a.upvotes);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await postVote({
        action: "question",
        code,
        slideId: slide.id,
        voterId,
        text,
        author: displayName,
      });
      setText("");
    } finally {
      setBusy(false);
    }
  }

  async function upvote(questionId: string) {
    await postVote({
      action: "upvote",
      code,
      slideId: slide.id,
      voterId,
      questionId,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Ask a question…"
          className="w-full resize-none rounded-2xl border border-ink/10 bg-canvas px-4 py-3 outline-none ring-teal-600/30 focus:ring-2"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-full bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Submit question
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {sorted.map((q) => {
          const mine = q.upvotedBy.includes(voterId);
          return (
            <div
              key={q.id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-canvas px-4 py-3 ring-1 ring-ink/5"
            >
              <div>
                <p className="leading-snug">{q.text}</p>
                <p className="mt-1 text-xs text-ink/40">{q.author}</p>
              </div>
              <button
                type="button"
                onClick={() => upvote(q.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  mine ? "bg-teal-700 text-white" : "bg-white text-ink/60 ring-1 ring-ink/10"
                }`}
              >
                ▲ {q.upvotes}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
