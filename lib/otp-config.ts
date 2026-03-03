/** OTP rate limits & config — SMS costs money (₹5/msg). Use strict defaults. */

function num(key: string, fallback: number): number {
  const v = process.env[key];
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : Math.max(0, n);
}

/** Minutes before same phone can request another OTP. Default 45. */
export const OTP_COOLDOWN_MINUTES = num("OTP_COOLDOWN_MINUTES", 45);

/** Max OTPs per phone per 24 hours. Default 3. */
export const OTP_DAILY_LIMIT_PER_PHONE = num("OTP_DAILY_LIMIT_PER_PHONE", 3);

/** Max OTPs per IP per 24 hours. Default 10. */
export const OTP_DAILY_LIMIT_PER_IP = num("OTP_DAILY_LIMIT_PER_IP", 10);

/** Max verify attempts before lockout. Default 5. */
export const OTP_MAX_VERIFY_ATTEMPTS = num("OTP_MAX_VERIFY_ATTEMPTS", 5);

/** Minutes to lockout after too many verify failures. Default 15. */
export const OTP_VERIFY_LOCKOUT_MINUTES = num("OTP_VERIFY_LOCKOUT_MINUTES", 15);

/** OTP validity in minutes. Default 5. */
export const OTP_VALIDITY_MINUTES = num("OTP_VALIDITY_MINUTES", 5);

export const OTP_COOLDOWN_MS = OTP_COOLDOWN_MINUTES * 60 * 1000;
export const OTP_VERIFY_LOCKOUT_MS = OTP_VERIFY_LOCKOUT_MINUTES * 60 * 1000;
export const OTP_VALIDITY_MS = OTP_VALIDITY_MINUTES * 60 * 1000;

/** Indian mobile: 10 digits, starts with 6, 7, 8, or 9. */
export function isValidIndianMobile(clean: string): boolean {
  return /^[6-9]\d{9}$/.test(clean);
}
