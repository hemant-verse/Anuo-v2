# Product Creation Migration — V2

## Status

PR-V2-08 establishes `POST /api/products` as the single canonical product-creation operation.

## Transport

The endpoint accepts both:

- `application/json` for API clients that already have hosted image URLs.
- `multipart/form-data` for the Sell UI, where the server validates and uploads one product image.

Both transports converge on the same `ProductService.create()` operation.

## Image boundary

Image validation and ImageKit orchestration live in `server/products/image.service.js`.

The server enforces:

- JPG, PNG, or WEBP only
- maximum 10 MB
- ImageKit upload under `campusmarket/products`

If database creation fails after a successful upload, the uploaded ImageKit file is deleted on a best-effort basis to avoid orphaned assets.

## Compatibility

`POST /api/products/sell` remains temporarily available as an alias to the canonical POST handler. It contains no independent business logic and should be removed after client/traffic verification.

The frontend Sell page now calls the canonical `/api/products` endpoint through `features/products/api.js`.

## Removal gate

Remove the compatibility alias only after:

1. production traffic confirms no remaining direct callers of `/api/products/sell`;
2. Sell page create flow is verified in staging;
3. ImageKit upload and orphan cleanup are verified;
4. product creation success/failure metrics are clean;
5. rollback procedure is documented.
