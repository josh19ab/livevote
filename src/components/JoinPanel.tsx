"use client";

import { useCallback, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, QrCode, Users, X } from "lucide-react";

export function JoinPanel({
  code,
  joinUrl,
  participants,
  onExpand,
}: {
  code: string;
  joinUrl: string;
  participants: number;
  onExpand?: () => void;
}) {
  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";

  return (
    <div className="rounded-2xl bg-white p-4 text-ink shadow-lg ring-1 ring-black/5">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-xl bg-white p-2 ring-1 ring-ink/5">
          <QRCodeSVG value={joinUrl} size={88} level="M" includeMargin />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            Audience joins at
          </p>
          <p className="truncate font-display text-base font-bold text-ink">{host}</p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-[0.18em] text-teal-700">
            {code}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Users className="h-4 w-4" />
            {participants} participant{participants === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className="mm-btn mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
        >
          <QrCode className="h-4 w-4" />
          Show join screen
        </button>
      )}
    </div>
  );
}

export function JoinScreenModal({
  open,
  onClose,
  code,
  joinUrl,
  participants,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
  joinUrl: string;
  participants: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";

  const downloadImage = useCallback(async () => {
    setDownloading(true);
    try {
      const qrCanvas = canvasRef.current;
      if (!qrCanvas) return;

      const out = document.createElement("canvas");
      out.width = 1080;
      out.height = 1350;
      const ctx = out.getContext("2d");
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
      grad.addColorStop(0, "#1a0533");
      grad.addColorStop(0.5, "#2d0b57");
      grad.addColorStop(1, "#18043a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, out.width, out.height);

      ctx.fillStyle = "rgba(255,107,203,0.25)";
      ctx.beginPath();
      ctx.arc(180, 180, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(124,92,255,0.3)";
      ctx.beginPath();
      ctx.arc(920, 1100, 200, 0, Math.PI * 2);
      ctx.fill();

      const cardX = 90;
      const cardY = 160;
      const cardW = 900;
      const cardH = 1030;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, cardX, cardY, cardW, cardH, 48);
      ctx.fill();

      ctx.fillStyle = "#6c2bd9";
      ctx.font = "bold 42px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LiveVote", out.width / 2, cardY + 80);

      ctx.fillStyle = "#6b6280";
      ctx.font = "600 28px Arial, sans-serif";
      ctx.fillText("Scan to join the contest", out.width / 2, cardY + 130);

      const qrSize = 420;
      const qrX = (out.width - qrSize) / 2;
      const qrY = cardY + 180;
      ctx.fillStyle = "#f6f2ff";
      roundRect(ctx, qrX - 24, qrY - 24, qrSize + 48, qrSize + 48, 28);
      ctx.fill();
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#6b6280";
      ctx.font = "600 26px Arial, sans-serif";
      ctx.fillText("or go to", out.width / 2, qrY + qrSize + 70);
      ctx.fillStyle = "#1c1230";
      ctx.font = "bold 34px Arial, sans-serif";
      ctx.fillText(host, out.width / 2, qrY + qrSize + 120);

      ctx.fillStyle = "#6b6280";
      ctx.font = "600 24px Arial, sans-serif";
      ctx.fillText("and enter code", out.width / 2, qrY + qrSize + 180);
      ctx.fillStyle = "#6c2bd9";
      ctx.font = "800 88px Arial, sans-serif";
      ctx.fillText(code.split("").join(" "), out.width / 2, qrY + qrSize + 290);

      const link = document.createElement("a");
      link.download = `livevote-${code}.png`;
      link.href = out.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [code, host]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close join screen"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-pop relative z-10 flex w-full max-w-3xl flex-col items-center rounded-[2rem] bg-white px-6 py-8 text-ink shadow-2xl sm:px-12 sm:py-12">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
          Join the contest
        </p>
        <h2 className="font-display mt-2 text-center text-3xl font-extrabold sm:text-4xl">
          Scan this QR code
        </h2>
        <p className="mt-2 text-center text-muted">
          or open <span className="font-semibold text-ink">{host}</span> and enter the code
        </p>

        <div className="mt-8 rounded-3xl bg-canvas p-5 ring-1 ring-ink/5">
          <QRCodeSVG value={joinUrl} size={260} level="M" includeMargin />
        </div>

        <div className="pointer-events-none absolute -left-[9999px] top-0 opacity-0" aria-hidden>
          <QRCodeCanvas
            value={joinUrl}
            size={512}
            level="M"
            includeMargin
            ref={canvasRef}
          />
        </div>

        <p className="font-display mt-8 text-5xl font-extrabold tracking-[0.28em] text-teal-700 sm:text-6xl">
          {code}
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Users className="h-4 w-4" />
          {participants} participant{participants === 1 ? "" : "s"} waiting
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={downloadImage}
            disabled={downloading || !joinUrl}
            className="mm-btn inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 font-bold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download QR image"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mm-btn rounded-full bg-ink/5 px-6 py-3.5 font-bold text-ink hover:bg-ink/10"
          >
            Back to present
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
