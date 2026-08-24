import { errors } from '../../lib/errors.js';

export function requireAuthenticated(identity) {
  if (!identity?.userId) throw errors.authRequired();
  return identity;
}

export function requireAdmin(identity) {
  requireAuthenticated(identity);
  if (identity.role !== 'admin') throw errors.forbidden();
  return identity;
}

export function requireOwner(identity, ownerId) {
  requireAuthenticated(identity);
  if (String(identity.userId) !== String(ownerId)) throw errors.forbidden();
  return identity;
}
