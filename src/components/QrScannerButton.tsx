"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";

function extractCode(decoded: string): string | null {
  try {
    const url = new URL(decoded);
    const fromPath = url.pathname.match(/\/p\/([A-Za-z0-9]+)/i);
    if (fromPath) return fromPath[1].toUpperCase();
    const q = url.searchParams.get("code");
    if (q) return q.toUpperCase();
  } catch {
    /* not a URL */
  }
  const bare = decoded.trim().toUpperCase();
  if (/^[A-Z0-9]{4,8}$/.test(bare)) return bare;
  return null;
}

export function QrScannerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const regionId = "livevote-qr-reader";
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function start() {
      setError("");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            const code = extractCode(decoded);
            if (!code) return;
            scanner.stop().catch(() => undefined);
            scannerRef.current = null;
            setOpen(false);
            router.push(`/p/${code}`);
          },
          () => undefined,
        );
      } catch {
        setError("Camera access denied or unavailable. Enter the contest code instead.");
      }
    }

    start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      scanner?.stop().catch(() => undefined);
    };
  }, [open, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/80 px-5 py-3.5 font-semibold text-ink transition hover:bg-white"
      >
        <Camera className="h-4 w-4" />
        Scan QR to join
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Scan contest QR</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-ink/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div id={regionId} className="overflow-hidden rounded-2xl bg-ink/5" />
            {error && <p className="mt-3 text-sm text-coral">{error}</p>}
            <p className="mt-3 text-sm text-ink/50">
              Point your camera at the QR on the presenter’s screen.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
