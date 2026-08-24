# Auno V2 Baseline

This repository is being migrated toward the Auno V2 documentation pack as a controlled modular-monolith rewrite.

## Current implementation checkpoint

- V2 foundation primitives created without deleting legacy routes.
- Canonical response/error contracts introduced.
- Security primitives isolated from HTTP/domain code.
- Distributed rate-limit adapter introduced for Upstash Redis.
- Canonical User, Session, Otp, Product, and AuditLog model shapes introduced alongside legacy models.
- Server authorization and product state policies introduced.
- Pure unit coverage started for security primitives and product state transitions.

## Migration rule

Legacy code remains recoverable until the corresponding V2 route/service has been migrated and verified. No legacy model or route is deleted merely because a V2 equivalent exists.
