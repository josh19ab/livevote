"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import type { Presentation, Slide, SlideType } from "@/lib/types";
import { SLIDE_TYPE_META } from "@/lib/types";

const TYPES = Object.keys(SLIDE_TYPE_META) as SlideType[];

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/presentations/${params.id}`);
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }
    const data = await res.json();
    setPresentation(data.presentation);
    setSelectedId((prev) => prev ?? data.presentation.slides[0]?.id ?? null);
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const selected =
    presentation?.slides.find((s) => s.id === selectedId) ??
    presentation?.slides[0] ??
    null;

  async function saveTitle(title: string) {
    if (!presentation) return;
    setSavingTitle(true);
    setPresentation({ ...presentation, title });
    await fetch(`/api/presentations/${presentation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setSavingTitle(false);
  }

  async function addSlide(type: SlideType) {
    if (!presentation) return;
    const res = await fetch(`/api/presentations/${presentation.id}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    await load();
    setSelectedId(data.slide.id);
  }

  async function updateSlide(patch: Partial<Slide>) {
    if (!presentation || !selected) return;
    const optimistic = {
      ...presentation,
      slides: presentation.slides.map((s) =>
        s.id === selected.id ? { ...s, ...patch } : s,
      ),
    };
    setPresentation(optimistic);
    await fetch(`/api/presentations/${presentation.id}/slides/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function removeSlide(slideId: string) {
    if (!presentation) return;
    const res = await fetch(
      `/api/presentations/${presentation.id}/slides/${slideId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      alert("Keep at least one slide.");
      return;
    }
    await load();
  }

  async function moveSlide(index: number, dir: -1 | 1) {
    if (!presentation) return;
    const target = index + dir;
    if (target < 0 || target >= presentation.slides.length) return;
    const ids = presentation.slides.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await fetch(`/api/presentations/${presentation.id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideIds: ids }),
    });
    await load();
  }

  if (!presentation || !selected) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/40">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between gap-4 border-b border-ink/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full p-2 text-ink/50 hover:bg-ink/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <input
            value={presentation.title}
            onChange={(e) =>
              setPresentation({ ...presentation, title: e.target.value })
            }
            onBlur={(e) => saveTitle(e.target.value)}
            className="font-display min-w-0 flex-1 truncate bg-transparent text-xl font-semibold outline-none"
          />
          {savingTitle && <span className="text-xs text-ink/35">Saving…</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-semibold tracking-wider text-teal-800 sm:inline">
            {presentation.code}
          </span>
          <Link
            href={`/present/${presentation.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Play className="h-4 w-4" />
            Present
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-ink/5 bg-white/50 p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
            Slides
          </p>
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {presentation.slides.map((slide, index) => {
              const meta = SLIDE_TYPE_META[slide.type];
              const active = slide.id === selected.id;
              return (
                <li key={slide.id} className="min-w-[200px] lg:min-w-0">
                  <div
                    className={`group flex items-start gap-2 rounded-2xl p-3 ring-1 transition ${
                      active
                        ? "bg-white ring-teal-700/30 shadow-sm"
                        : "bg-transparent ring-transparent hover:bg-white/70"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(slide.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: meta.color }}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                          {index + 1}. {meta.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium">{slide.title}</p>
                    </button>
                    <div className="flex flex-col opacity-60 group-hover:opacity-100">
                      <button type="button" onClick={() => moveSlide(index, -1)} className="p-0.5">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => moveSlide(index, 1)} className="p-0.5">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <details className="mt-4">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Add slide
            </summary>
            <div className="mt-3 grid gap-2">
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addSlide(type)}
                  className="rounded-2xl bg-white px-3 py-2.5 text-left ring-1 ring-ink/5 hover:ring-teal-700/25"
                >
                  <p className="text-sm font-semibold" style={{ color: SLIDE_TYPE_META[type].color }}>
                    {SLIDE_TYPE_META[type].label}
                  </p>
                  <p className="text-xs text-ink/45">{SLIDE_TYPE_META[type].description}</p>
                </button>
              ))}
            </div>
          </details>
        </aside>

        <section className="p-4 sm:p-8">
          <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
                  {SLIDE_TYPE_META[selected.type].label}
                </p>
                <label className="mt-3 block text-sm font-medium text-ink/55">Question</label>
                <input
                  value={selected.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  className="font-display mt-1 w-full border-b border-ink/10 bg-transparent py-2 text-2xl font-semibold outline-none focus:border-teal-700"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSlide(selected.id)}
                className="rounded-full p-2 text-ink/30 hover:bg-coral/10 hover:text-coral"
                aria-label="Delete slide"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {(selected.type === "multiple_choice" ||
              selected.type === "ranking" ||
              selected.type === "quiz") && (
              <OptionsEditor
                slide={selected}
                onChange={(options) => updateSlide({ options })}
                onCorrectChange={
                  selected.type === "quiz"
                    ? (correctIndex) => updateSlide({ correctIndex })
                    : undefined
                }
              />
            )}

            {selected.type === "rating" && (
              <div>
                <label className="text-sm font-medium text-ink/55">Scale max</label>
                <div className="mt-2 flex gap-2">
                  {[5, 7, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateSlide({ maxRating: n })}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        selected.maxRating === n
                          ? "bg-teal-700 text-white"
                          : "bg-canvas text-ink ring-1 ring-ink/10"
                      }`}
                    >
                      1–{n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(selected.type === "word_cloud" ||
              selected.type === "open_ended" ||
              selected.type === "qa") && (
              <p className="rounded-2xl bg-mist/60 px-4 py-3 text-sm text-ink/60">
                Audience will submit free-form responses for this slide. Live results
                appear on the present screen.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function OptionsEditor({
  slide,
  onChange,
  onCorrectChange,
}: {
  slide: Slide;
  onChange: (options: string[]) => void;
  onCorrectChange?: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return slide.options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !q || option.toLowerCase().includes(q));
  }, [slide.options, query]);

  function setOption(index: number, value: string) {
    const next = [...slide.options];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...slide.options, `Option ${slide.options.length + 1}`]);
  }

  function remove(index: number) {
    if (slide.options.length <= 1) return;
    onChange(slide.options.filter((_, i) => i !== index));
  }

  async function onImportFile(file: File | null) {
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    try {
      const { parseOptionsFromSpreadsheet } = await import("@/lib/excel-import");
      const imported = await parseOptionsFromSpreadsheet(file);
      if (!imported.length) {
        setImportMsg("No names found in that file.");
        return;
      }
      const merged = [...slide.options];
      const seen = new Set(merged.map((o) => o.toLowerCase()));
      for (const name of imported) {
        if (!seen.has(name.toLowerCase())) {
          merged.push(name);
          seen.add(name.toLowerCase());
        }
      }
      // If previous options were placeholders, replace when importing into nearly empty list
      const cleaned =
        slide.options.length <= 3 &&
        slide.options.every((o) => /^Option \d+$/i.test(o.trim()))
          ? imported
          : merged;
      onChange(cleaned);
      setImportMsg(`Imported ${imported.length} options · ${cleaned.length} total`);
    } catch {
      setImportMsg("Could not read that spreadsheet. Use .xlsx, .xls, or .csv.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm font-medium text-ink/55">
          Options / names ({slide.options.length})
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-teal-800 hover:bg-teal-50">
          <FileSpreadsheet className="h-4 w-4" />
          {importing ? "Importing…" : "Import Excel"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            disabled={importing}
            onChange={(e) => {
              void onImportFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-ink/40">
        Excel tip: put names in the first column, or use a header like Name / Option / Nominee.
      </p>
      {importMsg && <p className="mt-2 text-sm text-teal-700">{importMsg}</p>}

      {slide.options.length > 8 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search options…"
          className="mt-3 w-full rounded-xl border border-ink/10 bg-canvas px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-600/25"
        />
      )}

      <div className="mt-3 flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.map(({ option, index: i }) => (
          <div key={i} className="flex items-center gap-2">
            {onCorrectChange && (
              <button
                type="button"
                title="Mark correct"
                onClick={() => onCorrectChange(i)}
                className={`rounded-full p-1.5 ${
                  slide.correctIndex === i
                    ? "bg-teal-700 text-white"
                    : "bg-canvas text-ink/30"
                }`}
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            <span className="w-8 shrink-0 text-center text-xs tabular-nums text-ink/35">
              {i + 1}
            </span>
            <input
              value={option}
              onChange={(e) => setOption(i, e.target.value)}
              className="flex-1 rounded-xl border border-ink/10 bg-canvas px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-600/25"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-lg p-2 text-ink/30 hover:text-coral"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700"
      >
        <Plus className="h-4 w-4" />
        Add option
      </button>
    </div>
  );
}
