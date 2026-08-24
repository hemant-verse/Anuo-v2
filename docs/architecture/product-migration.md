# Product V2 Migration Runbook

## Field mapping

| Legacy | V2 |
| --- | --- |
| `seller` | `sellerId` |
| `verify` | `moderationStatus` |
| `status` | `availabilityStatus` |
| `imageUrl` | `images[0]` |
| `whatsapp`, `telegram`, `instagram` | `contacts.*` |

Existing ImageKit assets are intentionally reused. No image re-upload is required.

## Rollout

1. Back up the `products` collection.
2. Run `node scripts/migrate-product-v2.mjs` as a dry run.
3. Run with `--apply` against a production-like copy.
4. Run with `--verify` and investigate any non-zero result.
5. Deploy the canonical Product service/routes.
6. Only after all callers are migrated and verified, run `--cleanup` to remove legacy fields.

## Rollback

Before cleanup, rollback is application-level: deploy the previous application version because legacy fields remain intact. After cleanup, restore the collection backup if the old application must be restored.
