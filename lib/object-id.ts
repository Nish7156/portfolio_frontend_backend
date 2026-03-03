/** Validate MongoDB ObjectId to prevent path traversal and injection. */
export function isValidObjectId(id: string): boolean {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}
