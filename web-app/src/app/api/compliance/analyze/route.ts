import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { openai } from "@/lib/openai";
import { pdfToText } from "@/lib/pdf";
import { readStore, writeStore } from "@/lib/store";
import { ANALYZE_SYSTEM, ANALYZE_USER } from "@/lib/prompts";

export const runtime = "nodejs";

function devJson(data: any, status = 200) {
  // During dev, return structured JSON so you can read the message in the Network tab
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return devJson({ error: "Missing OPENAI_API_KEY" }, 500);
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return devJson({ error: "No file" }, 400);
    if (file.type !== "application/pdf") {
      return devJson({ error: "Only PDF allowed" }, 415);
    }

    // Read file to Buffer
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf.length) return devJson({ error: "Empty file buffer" }, 400);

    // (Optional) Save to /temp for debugging
    const id = crypto.randomUUID();
    const filename = `${id}.pdf`;
    const tempPath = path.join(process.cwd(), "temp", filename);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, buf);

    // Extract text
    const pdfText = await pdfToText(buf);
    if (!pdfText?.length) {
      return devJson({ error: "Failed to extract text from PDF" }, 500);
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4o-mini"
      messages: [
        { role: "system", content: ANALYZE_SYSTEM },
        { role: "user", content: ANALYZE_USER(pdfText) },
      ],
      temperature: 0.2,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    if (!content) {
      return devJson({ error: "OpenAI returned empty content" }, 500);
    }

    // Robust JSON parsing
    let parsed: any = null;
    const candidates = [
      content,
      content.replace(/```json|```/g, ""), // strip code fences if present
    ];
    for (const c of candidates) {
      try { parsed = JSON.parse(c); break; } catch {}
    }
    if (!parsed || (typeof parsed !== "object")) {
      console.error("OpenAI content (first 500 chars):", content.slice(0, 500));
      return devJson({ error: "Failed to parse OpenAI JSON" }, 500);
    }

    // Persist minimal context + suggested actions
    const store = await readStore();
    store.contexts[id] = pdfText;
    if (Array.isArray(parsed.suggested_actions)) {
      store.pendingActions.push(...parsed.suggested_actions);
    }
    await writeStore(store);

    return devJson({
      id,
      filePath: `/temp/${filename}`,
      summary: parsed.summary ?? "",
      suggested_actions: parsed.suggested_actions ?? [],
    }, 200);

  } catch (e: any) {
    console.error("Analyze route error:", e?.stack || e?.message || e);
    // In dev, return the message body so you can see it in the console/network
    return devJson({ error: e?.message ?? "Analyze failed" }, 500);
  }
}
