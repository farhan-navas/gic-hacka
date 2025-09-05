import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { openai } from "@/lib/openai";
import { pdfToText } from "@/lib/pdf";
import { readStore, writeStore } from "@/lib/store";
import { ANALYZE_SYSTEM, ANALYZE_USER } from "@/lib/prompts";

export const runtime = "nodejs"; // pdf-parse needs Node.js runtime

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF allowed" }, { status: 415 });
    }

    // Convert to Buffer
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    // === Save into /temp folder with a uuid ===
    const id = crypto.randomUUID();
    const filename = `${id}.pdf`;
    const tempPath = path.join(process.cwd(), "temp", filename);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, buf);

    // Parse text from buffer (you could also re-read from tempPath)
    const pdfText = await pdfToText(buf);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-5-mini"
      messages: [
        { role: "system", content: ANALYZE_SYSTEM },
        { role: "user", content: ANALYZE_USER(pdfText) },
      ],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const maybe = content.replace(/```json|```/g, "");
      parsed = JSON.parse(maybe);
    }

    // Persist: store pdfText + pending actions
    const store = await readStore();
    store.contexts[id] = pdfText; // keep text in JSON for refinement
    if (Array.isArray(parsed?.suggested_actions)) {
      store.pendingActions.push(...parsed.suggested_actions);
    }
    await writeStore(store);

    return NextResponse.json({
      id,
      filePath: `/temp/${filename}`, // optional reference to saved file
      summary: parsed?.summary ?? "",
      suggested_actions: parsed?.suggested_actions ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Analyze failed" },
      { status: 500 },
    );
  }
}
