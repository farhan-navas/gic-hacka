// app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAgentOnce } from "@/lib/agent";
import { bus } from "@/lib/bus";

export async function POST(req: NextRequest) {
  const trigger = await req.json().catch(() => ({}));
  // fire-and-complete (no background jobs — we run now and stream logs via SSE)
  bus.emitEvent({ type: "agent_log", data: "Manual trigger received." });
  const result = await runAgentOnce(trigger);
  return NextResponse.json({ ok: true, result });
}
