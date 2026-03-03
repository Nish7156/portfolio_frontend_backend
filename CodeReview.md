# Code Review — Portfolio Generator

**Review date:** March 2026  
**Scope:** Full codebase security, reliability, and production readiness.

---

## Critical issues

### 1. Path traversal in resume storage and download — FIXED

**Location:** `lib/resume-storage.ts`, `app/api/r1t9/route.ts`, `lib/object-id.ts`  

**Issue:** `portfolioId` is used in `path.join()` without validation.

**Fix applied:** `isValidObjectId()` in `lib/object-id.ts`; validate before all file and DB operations.

---

### 2. Payment verification returns success when no record is updated — FIXED

**Location:** `app/api/h2j6/route.ts`  

**Issue:** `updateOne()` result is ignored. If no portfolio matches `userId` and `orderId`, the API still returns `{ success: true }`.

**Impact:** User may be told payment succeeded even when the portfolio record is not updated.

**Fix applied:** Check `result.modifiedCount === 0` and return 400.

---

### 3. No server-side size validation for resume upload — FIXED

**Location:** `app/api/c1d4/route.ts`  

**Issue:** Only the client enforces a 2MB limit. The API accepts any base64 payload. Large payloads can hit MongoDB’s 16MB document limit and cause failures or DoS.

**Impact:** DoS, DB load, possible performance and cost issues.

**Fix applied:** 2MB limit enforced in `c1d4/route.ts`.

---

### 4. Admin key sent via URL query string — FIXED

**Location:** `app/admin/page.tsx`, resume download  

**Issue:** Admin key is passed as `?key=` in URLs. Query params are often logged and cached, and can leak via Referer.

**Impact:** Credential exposure in logs, proxies, and browser history.

**Fix applied:** All admin fetches use `x-admin-key` header. CSV and resume download use fetch + blob instead of `window.open` with key in URL.

---

### 5. MongoDB `ObjectId` not validated before file operations — FIXED

**Location:** `app/api/r1t9/route.ts`  

**Issue:** `readResumeFromFile(portfolioId)` is called before `new ObjectId(portfolioId)`. Malformed or malicious `portfolioId` can be used in file path construction.

**Impact:** Path traversal and possible arbitrary file access (see issue #1).

**Fix applied:** `isValidObjectId()` used in `r1t9` and `resume-storage` before any file operations.

---

## High-priority issues

### 6. OTP stored in plaintext in database — FIXED

**Location:** `app/api/a7f2/route.ts`, `app/api/b3c9/route.ts`  

**Issue:** OTPs are stored as plain text in `otps` collection.

**Impact:** DB compromise exposes all OTPs; limited window (5 minutes).

**Fix applied:** OTPs hashed with SHA-256 before storage; verify compares hash.

---

### 7. JWT payload type assertion without structure validation — FIXED

**Location:** `lib/auth.ts`  

**Issue:** `verifyToken` casts the payload directly without checking the presence or type of fields such as `phone` and `userId`.

**Impact:** Downstream code may receive malformed payloads and behave unexpectedly.

**Fix applied:** `verifyToken` validates `phone` and `userId` presence and type.

---

### 8. Missing `Content-Security-Policy` header — FIXED

**Location:** `middleware.ts`, `next.config.ts`  

**Issue:** No CSP header is set, allowing XSS if any dynamic content is rendered unsafely.

**Impact:** Increased risk of script injection and related attacks.

**Fix applied:** CSP added in middleware. Previously: Add a restrictive `Content-Security-Policy` header appropriate for the app’s scripts and styles.

---

### 9. Razorpay script loaded from external CDN

**Location:** `app/portfolio/pay/page.tsx`  

**Issue:** Razorpay script is loaded from an external URL.

**Impact:** If the CDN is compromised, payment flows could be affected.

**Mitigation:** Use Razorpay’s official URL and SRI if available; consider CSP to limit script sources.

---

### 10. Middleware applied only to `/api/:path*`

**Location:** `middleware.ts`  

**Issue:** Security headers (X-Frame-Options, etc.) are set only for API routes, not for pages.

**Impact:** Pages might not benefit from these headers unless set elsewhere.

**Fix applied:** Middleware matcher extended to all routes except `_next/static`, `_next/image`, `favicon.ico`.

---

## Medium-priority issues

### 11. Database connection reused without pool configuration — FIXED

**Location:** `lib/db.ts`  

**Issue:** Single MongoClient instance is reused. No explicit connection pool or timeout settings.

**Impact:** Under load, connections may exhaust or behave unpredictably.

**Fix applied:** `maxPoolSize: 10`, `serverSelectionTimeoutMS`, `connectTimeoutMS` configured.

---

### 12. Swallowed errors in file storage — FIXED

**Location:** `lib/resume-storage.ts`  

**Issue:** `ensureDir` and file operations catch errors without logging or surfacing them.

**Impact:** Silent failures make debugging and incident response harder.

**Fix applied:** Errors logged when `NODE_ENV !== "test"`.

---

### 13. No rate limiting on API routes

**Location:** All API routes  

**Issue:** Only OTP endpoints have rate limiting. Other routes (portfolio, payment, analytics, admin) can be spammed.

**Impact:** DoS and abuse of services.

**Mitigation:** Add rate limiting for sensitive and high-cost operations.

---

### 14. Admin actions logged without strict schema

**Location:** `app/api/n4p7/route.ts`  

**Issue:** `meta` for admin actions is stored without validation or size limits.

**Impact:** Large or malicious payloads could bloat the DB or complicate querying.

**Fix applied:** `sanitizeMeta()` limits keys, value length, total size (1KB).

---

## Low-priority issues

### 15. Middleware deprecation warning

**Location:** `middleware.ts`  

**Issue:** Next.js suggests moving from `middleware` to the new “proxy” pattern.

**Impact:** Future compatibility and maintenance.

**Mitigation:** Plan migration according to Next.js migration guides.

---

### 16. IP detection can be spoofed

**Location:** OTP and analytics routes  

**Issue:** Client IP is taken from `x-forwarded-for` and `x-real-ip`. These can be spoofed if not behind a trusted proxy.

**Impact:** Rate limits and abuse detection may be bypassed if proxies are misconfigured.

**Mitigation:** Ensure only trusted reverse proxies set these headers; otherwise rely on the direct connection IP.

---

## Summary

| Severity   | Count |
|-----------|-------|
| Critical  | 5     |
| High     | 5     |
| Medium   | 4     |
| Low      | 2     |

**Immediate actions:** Fix issues #1–5 (path traversal, payment verification, resume size, admin key, ObjectId validation) before production use.
