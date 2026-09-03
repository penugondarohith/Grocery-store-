/**
 * Shared in-memory OTP store.
 * Works for development. For production with multiple instances, swap for Redis.
 *
 * Each entry is keyed by email. The actual code is never stored — only its SHA-256 hash.
 */
import crypto from 'crypto';

export interface OtpEntry {
  codeHash: string;    // SHA-256(code + email)
  expiresAt: number;   // Unix ms — 10 minutes from creation
  attempts: number;    // Wrong guesses so far
  lastSentAt: number;  // Unix ms — for cooldown enforcement
}

const store = new Map<string, OtpEntry>();

/** Remove all expired entries */
function cleanup() {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (val.expiresAt < now) store.delete(key);
  }
}

/** Hash code + email together to prevent cross-email code reuse */
export function hashCode(code: string, email: string): string {
  return crypto
    .createHash('sha256')
    .update(code.trim() + email.toLowerCase())
    .digest('hex');
}

/** Store a new OTP for the given email (replaces any existing entry) */
export function setOtp(email: string, code: string): void {
  cleanup();
  store.set(email.toLowerCase(), {
    codeHash: hashCode(code, email),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    lastSentAt: Date.now(),
  });
}

/** Retrieve OTP entry for email (or undefined if not found) */
export function getOtp(email: string): OtpEntry | undefined {
  return store.get(email.toLowerCase());
}

/** Increment attempt counter */
export function incrementAttempts(email: string): number {
  const entry = store.get(email.toLowerCase());
  if (!entry) return 0;
  const attempts = entry.attempts + 1;
  store.set(email.toLowerCase(), { ...entry, attempts });
  return attempts;
}

/** Delete OTP after use or lockout */
export function deleteOtp(email: string): void {
  store.delete(email.toLowerCase());
}

/** Check if a resend is allowed; returns wait seconds remaining */
export function resendCooldown(email: string): number {
  const entry = store.get(email.toLowerCase());
  if (!entry) return 0;
  const waitMs = entry.lastSentAt + 60_000 - Date.now();
  return waitMs > 0 ? Math.ceil(waitMs / 1000) : 0;
}
