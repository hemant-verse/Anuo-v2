# Auno V2 — Production Release Checklist

## Antigravity IDE Master Release Prompt

You are the final release engineer for **Auno V2**.

Assume the project is currently at **“all tests pass”**. Before changing anything, inspect the entire repository and the attached documentation:

- `Auno-V2-Documentation-Pack`
- `summary and report.txt`
- `instruction.txt`

Do not rewrite working architecture or features. Only make changes required to safely reach production.

## 1. Freeze & Baseline

- [ ] Identify current Git branch and commit.
- [ ] Confirm working tree is clean.
- [ ] Create/confirm release candidate commit/tag.
- [ ] Record Node.js and pnpm versions.
- [ ] Confirm `package.json` and lockfile are consistent.
- [ ] Confirm documentation matches the actual code/version.

## 2. Full Verification

Run the complete suite on the exact release candidate:

- [ ] Install with frozen lockfile.
- [ ] Lint.
- [ ] Typecheck.
- [ ] Unit tests.
- [ ] Integration tests.
- [ ] API E2E.
- [ ] Browser E2E.
- [ ] Production build.
- [ ] Start production build locally and smoke-test it.
- [ ] Record every result.

If anything fails, diagnose the root cause, fix it, and rerun the affected test plus the complete regression suite.

## 3. Security Gate

- [ ] Run dependency/security audit.
- [ ] Resolve critical/high vulnerabilities.
- [ ] Investigate all moderate vulnerabilities.
- [ ] Verify authentication/session security.
- [ ] Verify authorization and ownership checks.
- [ ] Verify admin protection.
- [ ] Verify rate limiting.
- [ ] Verify secure cookies/tokens.
- [ ] Verify input/file-upload validation.
- [ ] Check for committed secrets.
- [ ] Check production environment variables.
- [ ] Check logs for sensitive-data exposure.
- [ ] Verify security headers and production configuration.

Do not weaken security controls merely to make tests pass.

## 4. Database & Migration

- [ ] Verify production database configuration.
- [ ] Verify database connectivity.
- [ ] Confirm backup exists.
- [ ] Verify V2 migration status.
- [ ] Verify data integrity.
- [ ] Verify existing users/products/favorites/admin data.
- [ ] Verify no unintended legacy access.
- [ ] Confirm migration is reversible where required.
- [ ] Confirm rollback procedure works.

## 5. Critical User Journeys

### Buyer
- [ ] Register/login.
- [ ] Browse marketplace.
- [ ] Search/filter.
- [ ] View product.
- [ ] Favorite/unfavorite.
- [ ] Refresh session.
- [ ] Logout.

### Seller
- [ ] Login.
- [ ] Create listing.
- [ ] Upload image.
- [ ] Submit listing.
- [ ] Verify moderation state.
- [ ] Verify ownership/security.

### Admin
- [ ] Login.
- [ ] View pending listings.
- [ ] Approve listing.
- [ ] Reject listing.
- [ ] Verify audit record.
- [ ] Verify unauthorized users cannot perform admin actions.

## 6. Production Configuration

- [ ] Production environment variables verified.
- [ ] Secrets configured securely.
- [ ] Database URL verified.
- [ ] Storage/image configuration verified.
- [ ] Authentication configuration verified.
- [ ] Domain/origin configuration verified.
- [ ] CORS/security configuration verified.
- [ ] Rate limits verified.
- [ ] Error handling verified.
- [ ] Logging/monitoring enabled.
- [ ] No development/debug configuration enabled.

## 7. Staging Release

Deploy the exact release candidate to staging.

- [ ] Deployment succeeds.
- [ ] Application starts successfully.
- [ ] Database connects.
- [ ] Authentication works.
- [ ] Buyer journey works.
- [ ] Seller journey works.
- [ ] Admin journey works.
- [ ] Image upload works.
- [ ] API works.
- [ ] No critical browser/server errors.
- [ ] Smoke tests pass.
- [ ] Performance is acceptable.

## 8. CI/CD Gate

- [ ] CI runs against the exact release commit.
- [ ] All required checks pass.
- [ ] Build artifact is reproducible.
- [ ] Deployment uses the verified artifact.
- [ ] Production deployment requires successful CI.
- [ ] Rollback procedure is available.

## 9. Production Deployment

Only proceed when every required gate above is PASS.

- [ ] Production backup confirmed.
- [ ] Release commit/tag confirmed.
- [ ] Deployment window confirmed.
- [ ] Deploy exact tested artifact.
- [ ] Verify application startup.
- [ ] Verify database connectivity.
- [ ] Run production smoke tests.
- [ ] Verify authentication.
- [ ] Verify buyer/seller/admin journeys.
- [ ] Verify image uploads.
- [ ] Verify API health.
- [ ] Monitor errors and latency.
- [ ] Monitor database health.
- [ ] Monitor authentication failures.
- [ ] Monitor rate-limit behavior.

If a critical production regression occurs, stop rollout and execute rollback.

## 10. Post-Deployment

- [ ] Monitor application closely after deployment.
- [ ] Check server errors.
- [ ] Check API 4xx/5xx rates.
- [ ] Check database health.
- [ ] Check authentication/session failures.
- [ ] Check upload failures.
- [ ] Check browser/client errors.
- [ ] Confirm no security alerts.
- [ ] Confirm core user journeys remain functional.

## 11. Final Release Record

Create a concise final release report containing:

- Release version/tag
- Git commit
- Node/pnpm versions
- Test results
- Build result
- E2E result
- Security audit result
- Migration result
- Rollback result
- Deployment result
- Known issues
- Monitoring result
- Final release decision

## Release Decision

Mark **PRODUCTION READY** only when:

- [ ] All required tests pass.
- [ ] Security gate passes.
- [ ] Build passes.
- [ ] Migration is verified.
- [ ] Rollback is ready.
- [ ] Staging smoke tests pass.
- [ ] Production configuration is verified.
- [ ] Production smoke tests pass.
- [ ] No unresolved critical/high blocker exists.

Otherwise mark **NOT READY**, identify the exact blocker, fix it, and repeat the relevant verification.

### Final Rule

**Do not claim PASS without executing the check. Do not skip a failing check. Do not make unnecessary architectural changes. Preserve all currently working functionality. Fix root causes, verify them, and only then release.**