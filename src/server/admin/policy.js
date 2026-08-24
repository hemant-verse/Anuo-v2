import { errors } from '../../lib/errors.js';

export function assertAdmin(identity) {
  if (!identity?.userId || identity.role !== 'admin') throw errors.forbidden();
}

export function assertModerationDecision(status) {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw errors.validation([{ path: ['moderationStatus'], message: 'Decision must be APPROVED or REJECTED' }]);
  }
}
