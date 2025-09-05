import pdf from "pdf-parse";

export async function pdfToText(fileBuffer: Buffer): Promise<string> {
  const data = await pdf(fileBuffer);
  // Optional: tighten whitespace
  return (data.text || "").replace(/\s+\n/g, "\n").trim();
}
