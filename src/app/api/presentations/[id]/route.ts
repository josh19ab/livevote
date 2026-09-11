import { NextResponse } from "next/server";
import {
  deletePresentation,
  getPresentation,
  updatePresentation,
} from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const presentation = getPresentation(id);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ presentation });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const presentation = updatePresentation(id, {
    title: body.title,
    showResults: body.showResults,
    votingOpen: body.votingOpen,
  });
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ presentation });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = deletePresentation(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
