"use client";

import { QRCodeSVG } from "qrcode.react";
import { Users } from "lucide-react";

export function JoinPanel({
  code,
  joinUrl,
  participants,
  compact = false,
}: {
  code: string;
  joinUrl: string;
  participants: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl bg-white/90 ring-1 ring-ink/5 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className={`rounded-xl bg-white p-2 ${compact ? "" : "shadow-sm"}`}>
        <QRCodeSVG value={joinUrl} size={compact ? 72 : 112} level="M" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
          Join at
        </p>
        <p className="font-display text-lg font-semibold text-ink sm:text-xl">
          {typeof window !== "undefined" ? window.location.host : "localhost:3000"}/join
        </p>
        <p className="mt-1 font-display text-3xl font-bold tracking-[0.2em] text-teal-700">
          {code}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/50">
          <Users className="h-4 w-4" />
          {participants} participant{participants === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
