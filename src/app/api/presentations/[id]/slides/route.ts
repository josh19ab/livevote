import { NextResponse } from "next/server";
import { addSlide } from "@/lib/store";
import type { SlideType } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const VALID: SlideType[] = [
  "multiple_choice",
  "word_cloud",
  "open_ended",
  "ranking",
  "rating",
  "quiz",
  "qa",
];

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const type = body.type as SlideType;
  if (!VALID.includes(type)) {
    return NextResponse.json({ error: "Invalid slide type" }, { status: 400 });
  }
  const slide = addSlide(id, type);
  if (!slide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ slide }, { status: 201 });
}
