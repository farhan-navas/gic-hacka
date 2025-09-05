// import { NextResponse } from "next/server";
// import { readStore, writeStore } from "@/lib/store";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   const { action, feedback } = await req.json();
//   if (!action || !feedback) {
//     return NextResponse.json({ error: "Missing action/feedback" }, { status: 400 });
//   }
//   const store = await readStore();
//   store.pendingActions = store.pendingActions.filter((a) => a !== action);
//   store.feedback.push({ action, feedback, at: new Date().toISOString() });
//   await writeStore(store);
//   return NextResponse.json({ ok: true });
// }
