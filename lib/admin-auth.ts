import { createHash } from "crypto";

function getValidKeys(): string[] {
  const keys = process.env.ADMIN_KEYS;
  if (keys) {
    return keys.split(",").map((k) => k.trim()).filter(Boolean);
  }
  const single = process.env.ADMIN_SECRET;
  return single ? [single] : [];
}

export function validateAdminKey(key: string | null | undefined): boolean {
  if (!key) return false;
  const valid = getValidKeys();
  return valid.includes(key);
}

export function getAdminId(key: string): string {
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}
