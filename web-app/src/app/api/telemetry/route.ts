// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bus } from "@/lib/bus";

const SECRET = "devsecret";

export async function POST(req: NextRequest) {
  const hdr = req.headers.get("x-ops-secret");
  if (hdr !== SECRET)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  bus.emitEvent({ type: "telemetry", data: body });
  return NextResponse.json({ ok: true });
}
