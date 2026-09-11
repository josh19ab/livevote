"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/voting";

export function useCountdown(closesAt: number | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!closesAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [closesAt]);

  if (!closesAt) {
    return { remainingMs: null as number | null, label: null as string | null, expired: false };
  }

  const remainingMs = closesAt - now;
  return {
    remainingMs,
    label: formatCountdown(remainingMs),
    expired: remainingMs <= 0,
  };
}

export function VotingTimerBadge({
  closesAt,
  votingOpen,
  variant = "light",
}: {
  closesAt: number | null | undefined;
  votingOpen: boolean;
  variant?: "light" | "dark";
}) {
  const { label, expired } = useCountdown(closesAt);

  if (!closesAt) return null;

  if (!votingOpen || expired) {
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          variant === "dark"
            ? "bg-white/10 text-white/70"
            : "bg-ink/10 text-ink/60"
        }`}
      >
        Voting closed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
        variant === "dark"
          ? "bg-coral/90 text-white"
          : "bg-coral text-white"
      }`}
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Closes in {label}
    </span>
  );
}
