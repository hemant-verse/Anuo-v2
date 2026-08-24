# PR-V2-14 — Integration & Security Contract Tests

## Goal

Move the V2 release gate beyond unit-only coverage by exercising the canonical domain services against a real MongoDB instance.

## Covered flows

- registration, verification, login, access-token validation
- refresh rotation and refresh-token reuse detection
- password reset invalidating active sessions
- product visibility and owner authorization
- favorites idempotency and user scoping
- admin moderation, concurrent decisions, and audit logging
- product pagination contract

## Test environment

Integration tests use `MONGO_URI` and `JWT_ACCESS_SECRET`. The GitHub CI job provisions MongoDB and Redis services. Local execution skips the integration suite when the required MongoDB/auth environment is absent; CI is the authoritative execution environment.

A small Node ESM loader maps the repository's `@/*` imports to `src/*` so the domain modules can be tested without introducing a second application runtime or test framework solely for alias resolution.

## Release interpretation

Unit tests remain fast and deterministic. Integration tests are the database-backed contract gate. E2E remains a separate release requirement for the critical browser journeys listed in the V2 Testing Strategy.
