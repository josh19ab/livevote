import { NextResponse } from "next/server";
import { submitQuestion, submitVote, upvoteQuestion } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { action, code, slideId, voterId } = body;

  if (!code || !slideId || !voterId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (action === "vote") {
    const presentation = submitVote(code, slideId, voterId, body.value);
    if (!presentation) {
      return NextResponse.json(
        { error: "Unable to submit vote" },
        { status: 400 },
      );
    }
    return NextResponse.json({ presentation });
  }

  if (action === "question") {
    const question = submitQuestion(
      code,
      slideId,
      voterId,
      body.text || "",
      body.author || "Anonymous",
    );
    if (!question) {
      return NextResponse.json(
        { error: "Unable to submit question" },
        { status: 400 },
      );
    }
    return NextResponse.json({ question });
  }

  if (action === "upvote") {
    const presentation = upvoteQuestion(code, slideId, body.questionId, voterId);
    if (!presentation) {
      return NextResponse.json({ error: "Unable to upvote" }, { status: 400 });
    }
    return NextResponse.json({ presentation });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
