import { NextResponse } from "next/server";
import { getPresentationByCode, subscribe } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;
  const presentation = getPresentationByCode(code);
  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          cleanup?.();
        }
      };

      send({ type: "presentation", presentation });

      cleanup = subscribe(presentation.id, (next) => {
        send({ type: "presentation", presentation: next });
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeat);
          cleanup?.();
        }
      }, 15000);

      const originalCleanup = cleanup;
      cleanup = () => {
        clearInterval(heartbeat);
        originalCleanup();
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
