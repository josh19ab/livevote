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

export default function DashboardPage() {
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
        body: JSON.stringify({ title: "Untitled presentation" }),
      });
      const data = await res.json();
      router.push(`/editor/${data.presentation.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this presentation?")) return;
    await fetch(`/api/presentations/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/5 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-xl font-bold">
            LiveVote
          </Link>
          <button
            type="button"
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            New presentation
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your presentations
          </h1>
          <p className="mt-2 text-ink/55">
            Build slides, present live, and let unlimited participants join with a code.
          </p>
        </div>

        {loading ? (
          <p className="text-ink/40">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white/50 px-8 py-16 text-center">
            <Presentation className="mx-auto h-10 w-10 text-ink/25" />
            <p className="mt-4 font-display text-xl">No presentations yet</p>
            <button
              type="button"
              onClick={create}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white"
            >
              Create your first <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ul className="grid gap-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold">{item.title}</h2>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink/50">
                    Code <span className="font-semibold tracking-wider text-teal-700">{item.code}</span>
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
                    className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold hover:bg-ink/10"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/present/${item.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Present
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
        ? "bg-ink/10 text-ink/60"
        : "bg-sand text-ink/70";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles}`}>
      {status}
    </span>
  );
}
