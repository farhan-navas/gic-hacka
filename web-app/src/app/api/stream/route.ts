/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/stream/route.ts
import { NextRequest } from "next/server";
import { bus } from "@/lib/bus";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let handler: ((e: any) => void) | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (e: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {
          // controller already closed
          cleanup(controller);
        }
      };

      handler = (e: any) => send(e);

      // initial hello
      send({ type: "hello", data: "sse connected" });

      // subscribe to bus
      bus.onEvent(handler);

      // keep-alive ping
      pingTimer = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          cleanup(controller);
        }
      }, 15000);

      // tie lifecycle to client disconnect
      req.signal.addEventListener("abort", () => cleanup(controller));
    },

    cancel() {
      // called when consumer cancels (e.g., tab closes)
      closed = true;
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      if (handler) {
        bus.offEvent(handler);
        handler = null;
      }
    },
  });

  function cleanup(controller: ReadableStreamDefaultController<Uint8Array>) {
    if (closed) return;
    closed = true;
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (handler) {
      bus.offEvent(handler);
      handler = null;
    }
    try {
      controller.close();
    } catch {
      // already closed; ignore
    }
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
