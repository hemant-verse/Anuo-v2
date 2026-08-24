import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { errors } from '@/lib/errors';

function objectId(value) {
  return value && String(value);
}

async function requireUser(userId) {
  const user = await User.findById(userId).select('favorites');
  if (!user) throw errors.notFound('User');
  return user;
}

export async function list(identity) {
  await connectDB();
  const user = await User.findById(identity.userId)
    .select('favorites')
    .populate({
      path: 'favorites',
      select: 'title description price category condition images sellerId contacts moderationStatus availabilityStatus createdAt updatedAt',
      populate: { path: 'sellerId', select: 'userName' },
    })
    .lean();
  if (!user) throw errors.notFound('User');

  const items = (user.favorites || []).filter(Boolean);
  return {
    items,
    favoriteIds: items.map((item) => objectId(item._id)),
  };
}

export async function add(productId, identity) {
  await connectDB();
  const [product, user] = await Promise.all([
    Product.findById(productId).select('_id moderationStatus'),
    requireUser(identity.userId),
  ]);
  if (!product) throw errors.notFound('Product');
  if (product.moderationStatus !== 'APPROVED' && identity.role !== 'admin') {
    throw errors.notFound('Product');
  }

  await User.updateOne({ _id: identity.userId }, { $addToSet: { favorites: product._id } });
  return { productId: objectId(product._id), isFavorited: true };
}

export async function remove(productId, identity) {
  await connectDB();
  const user = await requireUser(identity.userId);
  const product = await Product.findById(productId).select('_id');
  if (!product) throw errors.notFound('Product');

  await User.updateOne({ _id: user._id }, { $pull: { favorites: product._id } });
  return { productId: objectId(product._id), isFavorited: false };
}

export async function toggle(productId, identity) {
  await connectDB();
  const [product, user] = await Promise.all([
    Product.findById(productId).select('_id moderationStatus sellerId'),
    requireUser(identity.userId),
  ]);
  if (!product) throw errors.notFound('Product');

  const existing = (user.favorites || []).some((id) => objectId(id) === objectId(product._id));
  if (existing) return remove(productId, identity);
  return add(productId, identity);
}
