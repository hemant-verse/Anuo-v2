import connectDB from '@/lib/db';
import Product from '@/models/Product';
import AuditLog from '@/models/AuditLog';
import { errors } from '@/lib/errors';
import { assertModerationTransition } from '@/server/products/policy';
import { assertAdmin, assertModerationDecision } from './policy';

function normalizePage(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listPending(identity, query = {}) {
  assertAdmin(identity);
  await connectDB();

  const page = normalizePage(query.page, 1, 100000);
  const limit = normalizePage(query.limit, 20, 50);
  const filter = { moderationStatus: 'PENDING' };

  if (query.category && query.category !== 'ALL') filter.category = query.category;
  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter)
      .select('title description price category condition images sellerId contacts isNegotiable moderationStatus availabilityStatus createdAt updatedAt')
      .populate('sellerId', 'userName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, hasNextPage: skip + items.length < total, total } };
}

export async function moderateProduct(productId, moderationStatus, identity, metadata = {}) {
  assertAdmin(identity);
  assertModerationDecision(moderationStatus);
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) throw errors.notFound('Product');

  const previousStatus = product.moderationStatus;
  assertModerationTransition(previousStatus, moderationStatus);

  const updated = await Product.findOneAndUpdate(
    { _id: product._id, moderationStatus: previousStatus },
    { $set: { moderationStatus } },
    { returnDocument: 'after' }
  );
  if (!updated) throw errors.invalidState('Product moderation changed concurrently; retry the operation');

  await AuditLog.create({
    adminId: identity.userId,
    action: moderationStatus === 'APPROVED' ? 'APPROVE' : 'REJECT',
    resourceType: 'Product',
    resourceId: product._id,
    metadata: { title: product.title, previousStatus, newStatus: moderationStatus, ...metadata },
  });

  return updated;
}

export async function approveProduct(productId, identity) {
  return moderateProduct(productId, 'APPROVED', identity);
}

export async function rejectProduct(productId, identity, metadata = {}) {
  return moderateProduct(productId, 'REJECTED', identity, metadata);
}

export async function listAudit(identity, query = {}) {
  assertAdmin(identity);
  await connectDB();

  const page = normalizePage(query.page, 1, 100000);
  const limit = normalizePage(query.limit, 20, 100);
  const filter = {};
  if (query.adminId) filter.adminId = query.adminId;
  if (query.productId) filter.resourceId = query.productId;
  if (query.action) filter.action = query.action;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('adminId', 'userName email')
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { items, pagination: { page, limit, hasNextPage: skip + items.length < total, total } };
}
