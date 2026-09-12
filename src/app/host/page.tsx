"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Play,
  Plus,
  Presentation,
  Trash2,
  Users,
} from "lucide-react";
import type { PresentationSummary } from "@/lib/types";

export default function HostDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<PresentationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/presentations");
    const data = await res.json();
    setItems(data.presentations);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setCreating(true);
    try {
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled contest" }),
      });
      const data = await res.json();
      router.push(`/editor/${data.presentation.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this contest?")) return;
    await fetch(`/api/presentations/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-display text-xl font-extrabold text-teal-700">LiveVote</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Host only
            </p>
          </div>
          <button
            type="button"
            onClick={create}
            disabled={creating}
            className="mm-btn inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-800/20 hover:bg-teal-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            New contest
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 animate-rise">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Your contests
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Create slides, import names from Excel, then open{" "}
            <strong className="text-ink">Present → Go live</strong> when the
            audience has joined. Share only the public join link with them — not this page.
          </p>
        </div>

        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="animate-pop rounded-3xl border border-dashed border-ink/15 bg-white px-8 py-16 text-center">
            <Presentation className="mx-auto h-10 w-10 text-ink/25" />
            <p className="font-display mt-4 text-xl font-bold">No contests yet</p>
            <button
              type="button"
              onClick={create}
              className="mm-btn mt-6 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-bold text-white"
            >
              Create your first <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ul className="grid gap-4">
            {items.map((item, i) => (
              <li
                key={item.id}
                className="animate-rise flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold">{item.title}</h2>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Code{" "}
                    <span className="font-bold tracking-wider text-teal-700">
                      {item.code}
                    </span>
                    {" · "}
                    {item.slideCount} slides ·{" "}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {item.participantCount}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/editor/${item.id}`}
                    className="mm-btn rounded-full bg-ink/5 px-4 py-2 text-sm font-bold hover:bg-ink/10"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/present/${item.id}`}
                    className="mm-btn inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Present / Go live
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="rounded-full p-2 text-ink/35 hover:bg-coral/10 hover:text-coral"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "live"
      ? "bg-teal-700 text-white"
      : status === "ended"
        ? "bg-ink/10 text-muted"
        : "bg-sand text-ink/70";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
      {status}
    </span>
  );
}
