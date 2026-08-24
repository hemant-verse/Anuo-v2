import { errors } from '../../lib/errors.js';

export const MODERATION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

export const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
});

const availabilityTransitions = new Map([
  ['AVAILABLE', new Set(['AVAILABLE', 'RESERVED', 'SOLD'])],
  ['RESERVED', new Set(['RESERVED', 'AVAILABLE', 'SOLD'])],
  ['SOLD', new Set(['SOLD'])],
]);

export function canChangeAvailability(from, to) {
  return availabilityTransitions.get(from)?.has(to) ?? false;
}

export function assertAvailabilityTransition(from, to) {
  if (!canChangeAvailability(from, to)) {
    throw errors.invalidState(`Cannot change availability from ${from} to ${to}`);
  }
}

export function canModerate(from, to) {
  if (!Object.values(MODERATION_STATUS).includes(from) || !Object.values(MODERATION_STATUS).includes(to)) return false;
  if (from === 'PENDING') return to === 'APPROVED' || to === 'REJECTED' || to === 'PENDING';
  return to === from;
}

export function assertModerationTransition(from, to) {
  if (!canModerate(from, to)) {
    throw errors.invalidState(`Cannot change moderation status from ${from} to ${to}`);
  }
}
