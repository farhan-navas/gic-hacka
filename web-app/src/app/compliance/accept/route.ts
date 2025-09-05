// import { NextResponse } from "next/server";
// import { readStore, writeStore } from "@/lib/store";

// export const runtime = "nodejs";

// function parseAction(action: string) {
//   // naive parse: "Set new trading limit to SGD 5,000,000"
//   // customize this to your action templates
//   if (/trading limit/i.test(action)) {
//     const m = action.match(/(\d[\d,\.]*)/);
//     const val = m ? m[1] : action;
//     return { category: "Trading", rule: "Trading Limit", value: val };
//   }
//   return { category: "General", rule: action, value: "active" };
// }

// export async function POST(req: Request) {
//   const { action } = await req.json();
//   if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

//   const store = await readStore();
//   // remove from pending
//   store.pendingActions = store.pendingActions.filter((a) => a !== action);
//   // add to guidelines
//   store.guidelines.push(parseAction(action));
//   await writeStore(store);

//   return NextResponse.json({ ok: true });
// }
