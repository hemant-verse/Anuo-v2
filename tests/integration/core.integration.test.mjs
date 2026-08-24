import assert from 'node:assert/strict';
import test, { before, after, beforeEach } from 'node:test';

import { connectIntegrationDb, closeIntegrationDb, hasIntegrationEnv, resetIntegrationDb } from '../helpers/integration-db.mjs';

const enabled = hasIntegrationEnv();

test('integration environment is configured', { skip: !enabled }, async () => {
  assert.equal(await connectIntegrationDb(), true);
});

if (enabled) {
  const { register, verifyEmail, login, resetPassword } = await import('../../src/server/auth/auth.service.js');
  const { rotateSession, revokeSession, getUserFromAccessToken, createSession } = await import('../../src/server/auth/session.service.js');
  const { create, getById, update, moderate, list } = await import('../../src/server/products/product.service.js');
  const { add: addFavorite, list: listFavorites, remove: removeFavorite } = await import('../../src/server/favorites/favorite.service.js');
  const { approveProduct, rejectProduct, listPending, listAudit } = await import('../../src/server/admin/admin.service.js');
  const User = (await import('../../src/models/User.js')).default;
  const Product = (await import('../../src/models/Product.js')).default;
  const Session = (await import('../../src/models/Session.js')).default;
  const AuditLog = (await import('../../src/models/AuditLog.js')).default;

  let ready = false;

  before(async () => {
    if (ready !== true) ready = await connectIntegrationDb();
  });

  beforeEach(async () => {
    await resetIntegrationDb();
  });

  after(async () => {
    await closeIntegrationDb();
  });

  async function createVerifiedUser({ email, userName = 'Test User', role = 'user' }) {
    const result = await register({ userName, email, password: 'StrongPass123!' });
    await verifyEmail(email, result.otp);
    if (role !== 'user') await User.updateOne({ email }, { $set: { role } });
    return User.findOne({ email });
  }

  async function createProduct(sellerId, overrides = {}) {
    return create({
      title: 'Test textbook',
      description: 'A sufficiently descriptive test listing.',
      price: 250,
      isNegotiable: true,
      category: 'Books',
      condition: 'Good',
      images: [],
      contacts: { whatsapp: '9876543210', telegram: '', instagram: '' },
      ...overrides,
    }, { userId: String(sellerId), role: 'user' });
  }

  test('authentication: register, verify, login, rotate, revoke', async () => {
    const user = await createVerifiedUser({ email: 'auth1@indoreinstitute.com' });
    const session = await login({ email: user.email, password: 'StrongPass123!' });

    const authenticated = await getUserFromAccessToken(session.accessToken);
    assert.equal(String(authenticated._id), String(user._id));

    const rotated = await rotateSession(session.refreshToken);
    assert.notEqual(rotated.refreshToken, session.refreshToken);

    await assert.rejects(() => rotateSession(session.refreshToken), (error) => error.code === 'AUTH_INVALID');
    const revoked = await Session.findById(rotated.sessionId).select('revokedAt');
    assert.ok(revoked.revokedAt);
  });

  test('password reset invalidates every active session', async () => {
    const user = await createVerifiedUser({ email: 'auth2@indoreinstitute.com' });
    const first = await login({ email: user.email, password: 'StrongPass123!' });
    const second = await createSession(user);

    const resetRequest = await (await import('../../src/server/auth/auth.service.js')).requestPasswordReset(user.email);
    await resetPassword(user.email, resetRequest.otp, 'NewStrongPass456!');

    await assert.rejects(() => getUserFromAccessToken(first.accessToken), (error) => error.code === 'AUTH_INVALID');
    const sessions = await Session.find({ userId: user._id });
    assert.equal(sessions.every((entry) => entry.revokedAt), true);
    assert.ok(second.sessionId);
  });

  test('product visibility and ownership are enforced', async () => {
    const seller = await createVerifiedUser({ email: 'seller1@indoreinstitute.com' });
    const other = await createVerifiedUser({ email: 'buyer1@indoreinstitute.com' });
    const pending = await createProduct(seller._id);

    await assert.rejects(() => getById(pending._id, { userId: String(other._id), role: 'user' }), (error) => error.code === 'FORBIDDEN');
    const ownerView = await getById(pending._id, { userId: String(seller._id), role: 'user' });
    assert.equal(String(ownerView._id), String(pending._id));

    await assert.rejects(() => update(pending._id, { price: 1 }, { userId: String(other._id), role: 'user' }), (error) => error.code === 'FORBIDDEN');

    const approved = await moderate(pending._id, 'APPROVED', { userId: String((await createVerifiedUser({ email: 'admin1@indoreinstitute.com', role: 'admin' }))._id), role: 'admin' });
    const publicView = await getById(approved._id, null);
    assert.equal(publicView.moderationStatus, 'APPROVED');
  });

  test('favorites are idempotent and scoped to the user', async () => {
    const seller = await createVerifiedUser({ email: 'seller2@indoreinstitute.com' });
    const buyer = await createVerifiedUser({ email: 'buyer2@indoreinstitute.com' });
    const product = await createProduct(seller._id);
    const admin = await createVerifiedUser({ email: 'admin2@indoreinstitute.com', role: 'admin' });
    await approveProduct(product._id, { userId: String(admin._id), role: 'admin' });

    const identity = { userId: String(buyer._id), role: 'user' };
    await addFavorite(product._id, identity);
    await addFavorite(product._id, identity);
    const favorites = await listFavorites(identity);
    assert.equal(favorites.items.length, 1);

    await removeFavorite(product._id, identity);
    assert.equal((await listFavorites(identity)).items.length, 0);
  });

  test('admin moderation is atomic and audited', async () => {
    const seller = await createVerifiedUser({ email: 'seller3@indoreinstitute.com' });
    const admin = await createVerifiedUser({ email: 'admin3@indoreinstitute.com', role: 'admin' });
    const product = await createProduct(seller._id);
    const identity = { userId: String(admin._id), role: 'admin' };

    const pending = await listPending(identity, { page: 1, limit: 20 });
    assert.equal(pending.items.length, 1);

    const [first, second] = await Promise.allSettled([
      approveProduct(product._id, identity),
      rejectProduct(product._id, identity, { reason: 'concurrent test' }),
    ]);
    assert.equal([first, second].filter((result) => result.status === 'fulfilled').length, 1);

    const audit = await listAudit(identity, { page: 1, limit: 20 });
    assert.equal(audit.items.length, 1);
    assert.equal((await Product.findById(product._id)).moderationStatus, 'APPROVED');
    assert.equal(await AuditLog.countDocuments({ resourceId: product._id }), 1);
  });

  test('listing pagination exposes a stable contract', async () => {
    const seller = await createVerifiedUser({ email: 'seller4@indoreinstitute.com' });
    const admin = await createVerifiedUser({ email: 'admin4@indoreinstitute.com', role: 'admin' });
    const products = await Promise.all([
      createProduct(seller._id, { title: 'Book one' }),
      createProduct(seller._id, { title: 'Book two' }),
      createProduct(seller._id, { title: 'Book three' }),
    ]);
    await Promise.all(products.map((product) => approveProduct(product._id, { userId: String(admin._id), role: 'admin' })));

    const result = await list({ page: 1, limit: 2 });
    assert.equal(result.items.length, 2);
    assert.deepEqual(Object.keys(result.pagination).sort(), ['hasNextPage', 'limit', 'page', 'total']);
    assert.equal(result.pagination.hasNextPage, true);
  });
}
