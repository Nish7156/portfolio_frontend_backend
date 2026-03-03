import { promises as fs } from "fs";
import path from "path";
import { isValidObjectId } from "./object-id";

function getUploadsDir(): string {
  const base = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads", "resumes");
  return base;
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    if (process.env.NODE_ENV !== "test") console.error("[resume-storage] mkdir failed:", e);
  }
}

export async function saveResumeToFile(portfolioId: string, rawBase64: string): Promise<boolean> {
  if (!isValidObjectId(portfolioId)) return false;
  try {
    const dir = getUploadsDir();
    await ensureDir(dir);
    const filePath = path.join(dir, `${portfolioId}.pdf`);
    const buf = Buffer.from(rawBase64, "base64");
    await fs.writeFile(filePath, buf);
    return true;
  } catch (e) {
    if (process.env.NODE_ENV !== "test") console.error("[resume-storage] save failed:", e);
    return false;
  }
}

export async function readResumeFromFile(portfolioId: string): Promise<Buffer | null> {
  if (!isValidObjectId(portfolioId)) return null;
  try {
    const dir = getUploadsDir();
    const filePath = path.join(dir, `${portfolioId}.pdf`);
    return await fs.readFile(filePath);
  } catch (e) {
    if (process.env.NODE_ENV !== "test") console.error("[resume-storage] read failed:", e);
    return null;
  }
}
