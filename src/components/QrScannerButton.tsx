"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";

function extractCode(decoded: string): string | null {
  const text = decoded.trim();
  try {
    const url = new URL(text);
    const fromPath = url.pathname.match(/\/p\/([A-Za-z0-9]+)/i);
    if (fromPath) return fromPath[1].toUpperCase();
    const q = url.searchParams.get("code");
    if (q) return q.toUpperCase();
  } catch {
    /* not a URL */
  }
  const bare = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^[A-Z0-9]{4,8}$/.test(bare)) return bare;
  return null;
}

export function QrScannerButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const router = useRouter();
  const reactId = useId().replace(/:/g, "");
  const regionId = `livevote-qr-reader-${reactId}`;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear?: () => void;
  } | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    handledRef.current = false;

    const timer = window.setTimeout(async () => {
      setStarting(true);
      setError("");
      try {
        if (!window.isSecureContext && location.hostname !== "localhost") {
          throw new Error("Camera needs HTTPS. Open this site over https or use the code.");
        }

        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const el = document.getElementById(regionId);
        if (!el) throw new Error("Scanner UI not ready");

        el.innerHTML = "";
        const scanner = new Html5Qrcode(regionId, { verbose: false });
        scannerRef.current = scanner;

        const onSuccess = async (decoded: string) => {
          if (handledRef.current || cancelled) return;
          const code = extractCode(decoded);
          if (!code) return;
          handledRef.current = true;
          try {
            await scanner.stop();
            scanner.clear?.();
          } catch {
            /* ignore */
          }
          scannerRef.current = null;
          setOpen(false);
          router.push(`/p/${code}`);
        };

        const config = {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
          disableFlip: false,
        };

        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        if (cancelled) return;

        if (cameras.length > 0) {
          const back =
            cameras.find((c) => /back|rear|environment|world/i.test(c.label)) ??
            cameras[cameras.length - 1];
          try {
            await scanner.start(back.id, config, onSuccess, () => undefined);
          } catch {
            await scanner.start(cameras[0].id, config, onSuccess, () => undefined);
          }
        } else {
          try {
            await scanner.start({ facingMode: "environment" }, config, onSuccess, () => undefined);
          } catch {
            await scanner.start({ facingMode: "user" }, config, onSuccess, () => undefined);
          }
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Camera unavailable";
        setError(
          message.includes("HTTPS")
            ? message
            : "Could not open the camera. Allow camera permission, use HTTPS (or localhost), or enter the code instead.",
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const scanner = scannerRef.current;
      scannerRef.current = null;
      scanner
        ?.stop()
        .then(() => scanner.clear?.())
        .catch(() => undefined);
    };
  }, [open, regionId, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "dark"
            ? "mm-btn inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-5 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            : "mm-btn inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-canvas px-5 py-3.5 font-semibold text-ink transition hover:bg-mist"
        }
      >
        <Camera className="h-4 w-4" />
        Scan QR code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div className="animate-pop w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">Scan QR</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-ink/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              id={regionId}
              className="min-h-[260px] overflow-hidden rounded-2xl bg-ink/5"
            />
            {starting && !error && (
              <p className="mt-3 text-sm text-muted">Starting camera…</p>
            )}
            {error && <p className="mt-3 text-sm text-coral">{error}</p>}
            <p className="mt-3 text-sm text-muted">
              Point your camera at the QR on the presenter’s screen.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
