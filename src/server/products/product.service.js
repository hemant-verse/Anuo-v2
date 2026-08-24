import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { errors } from '@/lib/errors';
import { assertAvailabilityTransition, assertModerationTransition } from './policy.js';
import { cleanupProductImage, uploadProductImage } from './image.service.js';

function objectId(value) {
  return value && String(value);
}

function assertOwner(product, userId) {
  if (!product || objectId(product.sellerId) !== objectId(userId)) throw errors.forbidden();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeProduct(product) {
  if (!product) return null;
  return product;
}

export async function create(input, identity) {
  await connectDB();
  const product = await Product.create({
    title: input.title,
    description: input.description,
    price: input.price,
    isNegotiable: input.isNegotiable,
    category: input.category,
    condition: input.condition,
    images: input.images || [],
    contacts: input.contacts,
    sellerId: identity.userId,
    moderationStatus: 'PENDING',
    availabilityStatus: 'AVAILABLE',
  });
  return normalizeProduct(product);
}

export async function createWithImage(input, image, identity) {
  let uploadedFileId;
  try {
    let images = input.images || [];
    if (image) {
      const uploaded = await uploadProductImage(image);
      uploadedFileId = uploaded.fileId;
      images = [uploaded.url];
    }
    return await create({ ...input, images }, identity);
  } catch (error) {
    if (uploadedFileId) await cleanupProductImage(uploadedFileId);
    throw error;
  }
}

export async function getPublicById(productId) {
  await connectDB();
  return Product.findOne({ _id: productId, moderationStatus: 'APPROVED' })
    .select('title description price category condition images')
    .lean();
}

export async function getById(productId, identity = null) {
  await connectDB();
  const product = await Product.findById(productId).populate('sellerId', 'userName').lean();
  if (!product) throw errors.notFound('Product');

  const publicVisible = product.moderationStatus === 'APPROVED';
  if (!publicVisible) {
    if (!identity?.userId) throw errors.authRequired();
    const isOwner = objectId(product.sellerId?._id || product.sellerId) === objectId(identity.userId);
    const isAdmin = identity.role === 'admin';
    if (!isOwner && !isAdmin) throw errors.forbidden();
  }

  return product;
}

export async function list(query = {}) {
  await connectDB();
  const page = query.page || 1;
  const limit = query.limit || 20;
  const filter = {
    moderationStatus: 'APPROVED',
    availabilityStatus: { $in: ['AVAILABLE', 'RESERVED'] },
  };
  if (query.category && query.category !== 'ALL') filter.category = query.category;
  if (query.search) {
    const escaped = escapeRegex(query.search);
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter)
      .select('title description price category condition images sellerId contacts moderationStatus availabilityStatus createdAt updatedAt')
      .populate('sellerId', 'userName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, hasNextPage: skip + items.length < total, total },
  };
}

export async function listMine(identity, query = {}) {
  await connectDB();
  const page = query.page || 1;
  const limit = query.limit || 20;
  const filter = { sellerId: identity.userId };
  if (query.category && query.category !== 'ALL') filter.category = query.category;
  if (query.search) {
    const escaped = escapeRegex(query.search);
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, hasNextPage: skip + items.length < total, total } };
}

export async function update(productId, input, identity) {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product) throw errors.notFound('Product');
  assertOwner(product, identity.userId);

  const nextAvailability = input.availabilityStatus;
  if (nextAvailability && nextAvailability !== product.availabilityStatus) {
    assertAvailabilityTransition(product.availabilityStatus, nextAvailability);
    const updateSet = {};
    for (const field of ['title', 'description', 'price', 'isNegotiable', 'category', 'condition', 'images', 'contacts']) {
      if (input[field] !== undefined) updateSet[field] = input[field];
    }
    updateSet.availabilityStatus = nextAvailability;
    const updated = await Product.findOneAndUpdate(
      { _id: product._id, sellerId: identity.userId, availabilityStatus: product.availabilityStatus },
      { $set: updateSet },
      { returnDocument: 'after' }
    );
    if (!updated) throw errors.invalidState('Product availability changed concurrently; retry the operation');
    return updated;
  }

  for (const field of ['title', 'description', 'price', 'isNegotiable', 'category', 'condition', 'images', 'contacts']) {
    if (input[field] !== undefined) product[field] = input[field];
  }

  await product.save();
  return product;
}

export async function changeAvailability(productId, availabilityStatus, identity) {
  return update(productId, { availabilityStatus }, identity);
}

export async function remove(productId, identity) {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product) throw errors.notFound('Product');
  assertOwner(product, identity.userId);
  await product.deleteOne();
  return { id: String(product._id) };
}

export async function moderate(productId, moderationStatus, identity) {
  if (identity?.role !== 'admin') throw errors.forbidden();
  await connectDB();
  const product = await Product.findById(productId);
  if (!product) throw errors.notFound('Product');
  assertModerationTransition(product.moderationStatus, moderationStatus);
  product.moderationStatus = moderationStatus;
  await product.save();
  return product;
}

export async function listCategories() {
  await connectDB();
  return Product.aggregate([
    { $match: { moderationStatus: 'APPROVED', availabilityStatus: { $in: ['AVAILABLE', 'RESERVED'] } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', count: 1 } },
    { $sort: { name: 1 } },
  ]);
}
