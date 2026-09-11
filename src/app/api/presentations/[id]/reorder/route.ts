import { NextResponse } from "next/server";
import { reorderSlides } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.slideIds)) {
    return NextResponse.json({ error: "slideIds required" }, { status: 400 });
  }
  const presentation = reorderSlides(id, body.slideIds);
  if (!presentation) {
    return NextResponse.json({ error: "Invalid reorder" }, { status: 400 });
  }
  return NextResponse.json({ presentation });
}
