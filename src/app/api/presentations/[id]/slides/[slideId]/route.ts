import { NextResponse } from "next/server";
import {
  clearSlideVotes,
  deleteSlide,
  highlightQuestion,
  reorderSlides,
  updateSlide,
} from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; slideId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id, slideId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "clear") {
    const presentation = clearSlideVotes(id, slideId);
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  if (body.action === "highlight" && body.questionId) {
    const presentation = highlightQuestion(id, slideId, body.questionId);
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  const slide = updateSlide(id, slideId, {
    title: body.title,
    options: body.options,
    correctIndex: body.correctIndex,
    maxRating: body.maxRating,
    type: body.type,
  });
  if (!slide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ slide });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id, slideId } = await params;
  const ok = deleteSlide(id, slideId);
  if (!ok) {
    return NextResponse.json(
      { error: "Cannot delete last slide or slide not found" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
