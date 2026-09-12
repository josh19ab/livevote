"use client";

import { useMemo, useState } from "react";
import { CHART_COLORS } from "@/lib/types";
import {
  countOptionVotes,
  openEndedResponses,
  rankingScores,
  ratingAverage,
  wordFrequencies,
} from "@/lib/helpers";
import type { Slide } from "@/lib/types";

export function MultipleChoiceChart({
  slide,
  revealCorrect = false,
}: {
  slide: Slide;
  revealCorrect?: boolean;
}) {
  const [query, setQuery] = useState("");
  const counts = countOptionVotes(slide.votes, slide.options.length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...counts, 1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return slide.options
      .map((option, i) => ({ option, i, count: counts[i] }))
      .filter((row) => !q || row.option.toLowerCase().includes(q))
      .sort((a, b) => b.count - a.count || a.i - b.i);
  }, [slide.options, counts, query]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {slide.options.length > 8 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or option…"
          className="w-full rounded-2xl border border-ink/10 bg-canvas px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-600/25"
        />
      )}
      <div className="flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-1">
        {rows.slice(0, query ? rows.length : Math.min(rows.length, 40)).map((row) => {
          const pct = Math.round((row.count / total) * 100);
          const width = `${(row.count / max) * 100}%`;
          const isCorrect = revealCorrect && slide.correctIndex === row.i;
          return (
            <div key={`${row.option}-${row.i}`} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex min-w-0 items-baseline justify-between gap-3">
                <span
                  className={`min-w-0 flex-1 break-words text-base font-medium sm:text-lg ${
                    isCorrect ? "text-teal-700" : "text-ink"
                  }`}
                >
                  {row.option}
                  {isCorrect ? " ✓" : ""}
                </span>
                <span className="font-display shrink-0 text-lg tabular-nums text-ink/70 sm:text-xl">
                  {row.count}{" "}
                  <span className="text-sm text-ink/40">({pct}%)</span>
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full origin-left rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: row.count ? width : "0%",
                    background: isCorrect
                      ? "#0D9488"
                      : CHART_COLORS[row.i % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-ink/45">
        {slide.votes.length} responses · {slide.options.length} options
        {!query && rows.length > 40
          ? " · showing top 40 (search to find others)"
          : ""}
      </p>
    </div>
  );
}

export function WordCloudView({ slide }: { slide: Slide }) {
  const words = wordFrequencies(slide.votes);
  if (!words.length) {
    return <EmptyState text="Waiting for words…" />;
  }
  const max = words[0].count;
  return (
    <div className="flex min-h-[240px] flex-wrap items-center justify-center gap-x-5 gap-y-3 px-2 py-6">
      {words.slice(0, 40).map(({ word, count }, i) => {
        const scale = 0.85 + (count / max) * 1.6;
        return (
          <span
            key={word}
            className="animate-pop font-display font-semibold capitalize leading-none"
            style={{
              fontSize: `${scale}rem`,
              color: CHART_COLORS[i % CHART_COLORS.length],
              animationDelay: `${i * 40}ms`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

export function OpenEndedFeed({ slide }: { slide: Slide }) {
  const items = openEndedResponses(slide.votes);
  if (!items.length) return <EmptyState text="Waiting for responses…" />;
  return (
    <div className="grid max-h-[55vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="animate-rise rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm ring-1 ring-ink/5"
          style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
        >
          <p className="text-base leading-snug text-ink">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export function RankingChart({ slide }: { slide: Slide }) {
  const scores = rankingScores(slide.votes, slide.options.length);
  const ranked = slide.options
    .map((option, i) => ({ option, score: scores[i], i }))
    .sort((a, b) => b.score - a.score);
  const max = Math.max(...scores, 1);

  if (!slide.votes.length) return <EmptyState text="Waiting for rankings…" />;

  return (
    <div className="flex w-full flex-col gap-3">
      {ranked.map((row, place) => (
        <div key={row.i} className="flex items-center gap-4">
          <span className="font-display w-8 text-2xl font-bold text-ink/30">
            {place + 1}
          </span>
          <div className="flex-1">
            <div className="mb-1 flex justify-between">
              <span className="font-medium">{row.option}</span>
              <span className="tabular-nums text-ink/50">{row.score} pts</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(row.score / max) * 100}%`,
                  background: CHART_COLORS[place % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RatingChart({ slide }: { slide: Slide }) {
  const { average, distribution, total } = ratingAverage(slide.votes);
  if (!total) return <EmptyState text="Waiting for ratings…" />;
  const maxDist = Math.max(...distribution, 1);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="font-display text-7xl font-bold tracking-tight text-teal-700">
          {average.toFixed(1)}
        </p>
        <p className="mt-1 text-ink/50">
          average · {total} {total === 1 ? "vote" : "votes"}
        </p>
      </div>
      <div className="flex w-full max-w-md items-end justify-center gap-2">
        {distribution.map((count, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg bg-teal-600/80 transition-all duration-700"
              style={{ height: `${Math.max(8, (count / maxDist) * 120)}px` }}
            />
            <span className="text-xs text-ink/45">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QABoard({
  slide,
  onHighlight,
}: {
  slide: Slide;
  onHighlight?: (questionId: string) => void;
}) {
  const sorted = [...slide.questions].sort((a, b) => {
    if (a.highlighted !== b.highlighted) return a.highlighted ? -1 : 1;
    return b.upvotes - a.upvotes;
  });

  if (!sorted.length) return <EmptyState text="Waiting for questions…" />;

  return (
    <div className="grid max-h-[55vh] gap-3 overflow-y-auto sm:grid-cols-2">
      {sorted.map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => onHighlight?.(q.id)}
          className={`rounded-2xl px-4 py-3 text-left transition ${
            q.highlighted
              ? "bg-teal-700 text-white shadow-lg"
              : "bg-white/80 text-ink ring-1 ring-ink/5 hover:ring-teal-600/30"
          }`}
        >
          <p className="text-base leading-snug">{q.text}</p>
          <div
            className={`mt-2 flex justify-between text-xs ${
              q.highlighted ? "text-white/70" : "text-ink/45"
            }`}
          >
            <span>{q.author}</span>
            <span>▲ {q.upvotes}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function SlideResults({
  slide,
  revealCorrect = false,
  onHighlight,
}: {
  slide: Slide;
  revealCorrect?: boolean;
  onHighlight?: (questionId: string) => void;
}) {
  switch (slide.type) {
    case "multiple_choice":
    case "quiz":
      return (
        <MultipleChoiceChart
          slide={slide}
          revealCorrect={revealCorrect && slide.type === "quiz"}
        />
      );
    case "word_cloud":
      return <WordCloudView slide={slide} />;
    case "open_ended":
      return <OpenEndedFeed slide={slide} />;
    case "ranking":
      return <RankingChart slide={slide} />;
    case "rating":
      return <RatingChart slide={slide} />;
    case "qa":
      return <QABoard slide={slide} onHighlight={onHighlight} />;
    default:
      return null;
  }
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="animate-pulse text-lg text-ink/35">{text}</p>
    </div>
  );
}
