import { NextResponse } from "next/server";
import {
  endPresentation,
  navigateSlide,
  startPresentation,
  updatePresentation,
} from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "start") {
    const presentation = startPresentation(id);
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  if (action === "end") {
    const presentation = endPresentation(id);
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  if (action === "navigate") {
    const presentation = navigateSlide(id, body.direction);
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  if (action === "toggleVoting") {
    const presentation = updatePresentation(id, {
      votingOpen: Boolean(body.votingOpen),
    });
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  if (action === "toggleResults") {
    const presentation = updatePresentation(id, {
      showResults: Boolean(body.showResults),
    });
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ presentation });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
