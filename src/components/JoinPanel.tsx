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
  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl bg-white text-ink shadow-lg ring-1 ring-black/5 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className={`rounded-xl bg-white p-2 ${compact ? "" : "ring-1 ring-ink/5"}`}>
        <QRCodeSVG value={joinUrl} size={compact ? 72 : 120} level="M" includeMargin />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Audience joins at
        </p>
        <p className="font-display text-lg font-bold text-ink sm:text-xl">{host}</p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-[0.2em] text-teal-700">
          {code}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <Users className="h-4 w-4" />
          {participants} participant{participants === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
