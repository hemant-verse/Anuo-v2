# Auno V2 E2E/API Smoke Runbook

This suite validates the deployed HTTP boundary against a real Next.js server and MongoDB. It is intentionally dependency-light and does not replace browser E2E tests.

## Prerequisites

- Node 20.9+
- pnpm
- MongoDB reachable through `MONGO_URI`
- Required V2 environment variables configured
- Production-like Next.js server running at `E2E_BASE_URL` (defaults to `http://localhost:3000`)

## Run

Terminal 1:

```bash
pnpm install
pnpm build
pnpm start
```

Terminal 2:

```bash
pnpm e2e:seed
pnpm e2e:api
```

Or:

```bash
pnpm e2e
```

`e2e:seed` clears the integration database and creates three verified test users. **Never point this at production data.**

## Coverage

- unauthenticated protected mutation → `401`
- seller login → canonical Product creation
- admin login → pending listing → approval
- public browse of approved listing
- buyer login → favorite → favorites listing
- refresh-token rotation
- logout → refresh-token rejection

## Important limitation

The HTTP smoke suite intentionally does not claim to cover browser rendering, accessibility, responsive behavior, or real email OTP delivery. Those remain separate release checks. OTP registration/verification is covered by the database-backed integration suite.
