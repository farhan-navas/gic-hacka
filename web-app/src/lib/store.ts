import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "compliance.json");

export interface Guideline {
  category: string;
  rule: string;
  value: string | number;
}

export interface Store {
  // previous PDF contexts keyed by an id
  // (you can use the file name or a uuid returned after analyze)
  contexts: Record<string, string>; // id -> pdfText
  guidelines: Guideline[];
  pendingActions: string[];
  feedback: { action: string; feedback: string; at: string }[];
}

export async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    // initialize if missing
    const init: Store = {
      contexts: {},
      guidelines: [],
      pendingActions: [],
      feedback: [],
    };
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
}

export async function writeStore(next: Store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), "utf8");
}
