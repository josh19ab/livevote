import { NextResponse } from "next/server";
import { createPresentation, listPresentations } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ presentations: listPresentations() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "Untitled presentation";
  const presentation = createPresentation(title);
  return NextResponse.json({ presentation }, { status: 201 });
}
