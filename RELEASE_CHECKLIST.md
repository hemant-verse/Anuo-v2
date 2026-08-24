# Auno V2 Production Release Checklist

## 📌 Release Metadata
* **Release Version**: `v2.0.0` (PR17.5 Patch Hardened)
* **Target Environment**: Production (Vercel / Node.js)
* **Date**: August 2026
* **Status**: **CERTIFIED FOR PRODUCTION DEPLOYMENT**

---

## 1. Environment & Infrastructure Prerequisites

Ensure all production environment variables are properly provisioned in your hosting dashboard (Vercel / Cloud Provider):

| Variable Name | Description | Verification Status |
| :--- | :--- | :---: |
| `NODE_ENV` | Set to `production` | [x] Checked |
| `MONGO_URI` | MongoDB Atlas production connection string | [x] Checked |
| `JWT_ACCESS_SECRET` | Secret key for signing short-lived access tokens (min 32 chars) | [x] Checked |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for edge rate limiting | [x] Checked |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API Token | [x] Checked |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | [x] Checked |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit server-side private key | [x] Checked |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | [x] Checked |
| `SMTP_EMAIL` | Production email account for OTP transactional emails | [x] Checked |
| `SMTP_PASSWORD` | Production email app password for SMTP authentication | [x] Checked |

*Note: Refresh tokens use server-side opaque 32-byte digests stored in MongoDB (`Session` model); `JWT_REFRESH_SECRET` is not used.*

---

## 2. Database Migration & Schema Verification

Before opening live user traffic, verify database schemas and run V2 migration scripts:

- [x] **User V2 Migration**: Run `pnpm migrate:user-v2` to populate schema defaults.
- [x] **Product V2 Migration**: Run `pnpm migrate:product-v2` for state machine availability fields.
- [x] **Schema Verification**: Execute `pnpm verify:v2` to confirm zero legacy schema drift.

```bash
pnpm migrate:user-v2
pnpm migrate:product-v2
pnpm verify:v2
```

---

## 3. Security & Auth Hardening Verification

- [x] **Token Interceptor Fix**: Verified `src/lib/axios.js` extracts access tokens from `response.data.data.accessToken`.
- [x] **Edge Route Protection**: Confirmed `src/middleware.js` guards `/favorites`, `/sell`, `/my-listings`, `/dashboard`, and `/dashboard/audit` at the edge with HTTP 307 redirects for unauthenticated requests.
- [x] **Rate Limiter Fail-Open**: Confirmed `src/middleware.js` and `src/lib/rate-limit.js` fail-open on transient Redis network latency, preventing 503 Service Unavailable outages.
- [x] **Timing-Safe Hashing**: Verified `hashSecret` and `timingSafeEqual` in `src/lib/security.js` resist side-channel timing attacks.

---

## 4. Automated Test Suite Certification

All automated test layers must be 100% passing prior to deployment:

```bash
# 1. Level 1: Unit & Policy Tests (10/10 PASSING)
pnpm test

# 2. Level 2: Integration & DB Lifecycle Tests (7/7 PASSING)
pnpm test:integration

# 3. Level 3: Typecheck Gate (PASSING)
pnpm typecheck

# 4. Level 4: Next.js Production Build (30/30 Routes Compiled Cleanly)
pnpm build

# 5. Level 5: API E2E Smoke Journey (3/3 PASSING)
pnpm e2e

# 6. Level 6: Playwright Browser E2E (PASSING)
pnpm e2e:browser
```

---

## 5. Pre-Launch Sanity Verification Steps

1. **Clean Production Build**:
   ```bash
   pnpm build
   ```
2. **Start Production Server Locally**:
   ```bash
   pnpm start
   ```
3. **Manual Sanity Check**:
   - Access `http://localhost:3000/feed` and search for an item.
   - Register a test college user (`@college.edu`) and complete OTP verification.
   - Create a listing on `/sell` and verify the image preview works.
   - Log in as Admin on `/dashboard` and approve the pending item using the `<article>` action button.
   - Confirm the approved product appears in `/feed` and an entry exists in `/dashboard/audit`.

---

## 6. Post-Launch Monitoring & Operational Procedures

1. **Edge Middleware Logs**: Monitor Vercel Edge / Cloudflare logs for 429 rate limit events or 307 unauthorized redirects.
2. **MongoDB Audit Logs**: Inspect `AuditLog` collection to verify all moderation decisions are logged with product titles.
3. **Rollback Plan**: In the event of a critical regression, re-deploy the previous release tag in Vercel UI or execute:
   ```bash
   git checkout tags/v1.9.0-stable
   pnpm build
   ```
