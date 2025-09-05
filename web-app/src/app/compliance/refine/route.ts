// import { readPdfById } from "@/lib/pdfStore";

// // ...

// import { NextResponse } from "next/server";
// import { openai } from "@/lib/openai";
// import { readStore, writeStore } from "@/lib/store";
// import { REFINE_SYSTEM, REFINE_USER } from "@/lib/prompts";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { contextId, previousActions, feedback } = body as {
//       contextId: string;
//       previousActions: string[];
//       feedback: string;
//     };

//     if (!contextId || !feedback || !Array.isArray(previousActions)) {
//       return NextResponse.json({ error: "Missing contextId/feedback/actions" }, { status: 400 });
//     }

//     const store = await readStore();
//     // const pdfText = store.contexts[contextId] || "";
//     const pdfText = await readPdfById(contextId);

//     // Record feedback
//     store.feedback.push({
//       action: previousActions.join(" | "),
//       feedback,
//       at: new Date().toISOString(),
//     });

//     // Call OpenAI to improve
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: REFINE_SYSTEM },
//         { role: "user", content: REFINE_USER({ pdfText, previousActions, feedback }) },
//       ],
//       temperature: 0.2,
//     });

//     const content = completion.choices[0]?.message?.content || "{}";
//     let parsed: any;
//     try {
//       parsed = JSON.parse(content);
//     } catch {
//       const maybe = content.replace(/```json|```/g, "");
//       parsed = JSON.parse(maybe);
//     }

//     const improved = Array.isArray(parsed?.improved_actions)
//       ? parsed.improved_actions
//       : [];

//     // Add improved suggestions into pending queue
//     store.pendingActions.push(...improved);
//     await writeStore(store);

//     return NextResponse.json({ improved_actions: improved });
//   } catch (e: any) {
//     return NextResponse.json({ error: e?.message ?? "Refine failed" }, { status: 500 });
//   }
// }

