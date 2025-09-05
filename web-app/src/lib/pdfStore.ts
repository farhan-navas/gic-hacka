import { promises as fs } from "fs";
import path from "path";
import { pdfToText } from "./pdf";

export async function readPdfById(id: string) {
  const filePath = path.join(process.cwd(), "temp", `${id}.pdf`);
  const buf = await fs.readFile(filePath);
  return pdfToText(buf);
}
