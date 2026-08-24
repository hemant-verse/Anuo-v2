# Product API Migration — PR-V2-06

## Canonical resources

The V2 product resource is the only new product API contract:

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

`GET /api/products?mine=true` is the authenticated resource view used by My Listings. It reuses the canonical product service and does not create a second product endpoint.

Favorites are now resource-oriented:

- `GET /api/favorites`
- `POST /api/favorites/:productId`
- `DELETE /api/favorites/:productId`

## Compatibility adapters

The following routes remain temporarily for migration only:

- `/api/products/create`
- `/api/products/sell`
- `/api/products/feed`
- `/api/products/my-listings`
- `/api/products/product/:id`
- `/api/products/verify`
- `/api/products/pending`
- `/api/products/:productId/favorite`
- `/api/user/favorites`

Each adapter delegates to a canonical service. No adapter is allowed to contain independent product persistence logic.

## Legacy model migration

Product consumers that previously used `product.model.js` now use `models/Product` for:

- marketplace feed
- product detail metadata
- favorites
- categories
- admin pending-listing query
- user inventory

Legacy field assumptions (`imageUrl`, `seller`, `status`, `verify`, `location`) are removed from migrated consumers.

## Deletion targets

Delete the compatibility routes only after all callers are verified against the canonical endpoints:

1. `/api/products/feed`
2. `/api/products/product/:id`
3. `/api/products/create`
4. `/api/products/my-listings`
5. `/api/products/:productId/favorite`
6. `/api/user/favorites`
7. `/api/products/pending`
8. `/api/products/verify` (after AdminService and canonical admin endpoints land)
9. `models/product.model.js`

The multipart `/api/products/sell` route is the final product-creation adapter. It should be removed only after image upload is exposed through the canonical creation workflow or a dedicated upload boundary is approved by the architecture.

## Location decision

The V2 Product model intentionally contains no `location`. Marketplace and favorites UIs no longer render a phantom location field. If location becomes a product requirement later, it must be added end-to-end: model → schema → service → API → UI → migration → tests.
