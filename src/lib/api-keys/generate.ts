import { randomBytes, createHash } from "crypto";

export function generateApiKey(): string {
  return `aios_${randomBytes(32).toString("hex")}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function verifyApiKey(rawKey: string, hash: string): boolean {
  return hashApiKey(rawKey) === hash;
}
