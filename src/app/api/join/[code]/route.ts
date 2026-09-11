import { NextResponse } from "next/server";
import { getPresentationByCode, joinPresentation } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;
  const presentation = getPresentationByCode(code);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ presentation });
}

export async function POST(request: Request, { params }: Params) {
  const { code } = await params;
  const body = await request.json().catch(() => ({}));
  const voterId = typeof body.voterId === "string" ? body.voterId : "";
  if (!voterId) {
    return NextResponse.json({ error: "voterId required" }, { status: 400 });
  }
  const presentation = joinPresentation(code, voterId);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ presentation });
}
