"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Presentation } from "./types";

export function usePresentationStream(code: string | null) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!code) return;
    const res = await fetch(`/api/join/${code.toUpperCase()}`);
    if (!res.ok) {
      setError("Presentation not found");
      setPresentation(null);
      return;
    }
    const data = await res.json();
    setPresentation(data.presentation);
    setError(null);
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let closed = false;
    let source: EventSource | null = null;

    const connect = () => {
      source = new EventSource(`/api/stream/${code.toUpperCase()}`);
      source.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
      };
      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "presentation") {
            setPresentation(data.presentation);
            setError(null);
          }
        } catch {
          /* ignore */
        }
      };
      source.onerror = () => {
        setConnected(false);
        source?.close();
        if (closed) return;
        const delay = Math.min(1000 * 2 ** retryRef.current, 8000);
        retryRef.current += 1;
        setTimeout(connect, delay);
      };
    };

    refresh();
    connect();

    return () => {
      closed = true;
      source?.close();
    };
  }, [code, refresh]);

  return { presentation, connected, error, refresh, setPresentation };
}
