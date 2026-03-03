import { createHash } from "crypto";

function getValidKeys(): string[] {
  const keys = process.env.ADMIN_KEYS;
  if (keys) {
    return keys.split(",").map((k) => k.trim()).filter(Boolean);
  }
  const single = process.env.ADMIN_SECRET;
  return single ? [single] : [];
}

const ERROR_LIKE_PATTERNS = [
  /^Error\s/i,
  /Failed to load/i,
  /failed to fetch/i,
  /network error/i,
];

export function validateAdminKey(key: string | null | undefined): boolean {
  if (!key || typeof key !== "string") return false;
  const k = key.trim();
  if (!k) return false;
  if (ERROR_LIKE_PATTERNS.some((p) => p.test(k))) return false;
  const valid = getValidKeys();
  return valid.includes(k);
}

export function getAdminId(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}
