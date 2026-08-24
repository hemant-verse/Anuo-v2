# User V2 Migration Runbook

## Canonical mapping

| Legacy | Canonical | Rule |
| --- | --- | --- |
| `UserName` | `userName` | Use the only non-empty candidate; fail on ambiguity |
| `username` | `userName` | Use only when no conflicting candidate exists |
| `name` | `userName` | Use only when no conflicting candidate exists |
| `Password` | `passwordHash` | Treat as an existing bcrypt hash; never re-hash |

## Safe rollout

1. Run `pnpm migrate:user-v2` against a production-like database.
2. Resolve every `INVALID` record before continuing.
3. Back up the database.
4. Run `pnpm migrate:user-v2 --apply`.
5. Deploy the application version that reads canonical fields.
6. Run `pnpm migrate:user-v2 --verify`.
7. After application smoke tests and verification pass, run `pnpm migrate:user-v2 --cleanup`.
8. Run `pnpm migrate:user-v2 --verify` again.

`--apply` intentionally preserves legacy fields so rollback remains possible until cleanup. `--cleanup` is the irreversible field-removal step and must happen only after verification.

## Rollback

Before `--cleanup`, rollback is application-level: deploy the previous application version and continue reading the preserved legacy fields. After cleanup, restore from the pre-migration database backup if rollback is required.
