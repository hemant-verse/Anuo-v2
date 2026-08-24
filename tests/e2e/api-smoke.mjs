import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const state = JSON.parse(await fs.readFile(new URL('../../.e2e-state.json', import.meta.url), 'utf8'));
const baseUrl = state.baseUrl.replace(/\/$/, '');
const seller = state.users.find((u) => u.role === 'user' && u.userName === 'E2E Seller');
const buyer = state.users.find((u) => u.role === 'user' && u.userName === 'E2E Buyer');
const admin = state.users.find((u) => u.role === 'admin');

function e2eHeaders(user, headers = {}) {
  return { 'x-forwarded-for': user.e2eIp, ...headers };
}

function cookieFrom(response) {
  const value = response.headers.get('set-cookie');
  if (!value) return '';
  return value.split(';', 1)[0];
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  let body = null;
  try { body = await response.json(); } catch {}
  return { response, body };
}

async function login(user) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    headers: e2eHeaders(user),
    body: JSON.stringify({ email: user.email, password: state.password }),
  });
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  return { accessToken: result.body.data.accessToken, cookie: cookieFrom(result.response) };
}

test('security regression: protected mutation without auth is rejected', async () => {
  const result = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify({ title: 'unauthorized', description: 'blocked', price: 1, category: 'Books', condition: 'Good', isNegotiable: false, images: [], contacts: {} }),
  });
  assert.equal(result.response.status, 401);
  assert.equal(result.body.success, false);
});

test('critical seller/buyer/admin journey: login → create → approve → browse → favorite', async () => {
  const sellerSession = await login(seller);
  const buyerSession = await login(buyer);
  const adminSession = await login(admin);

  const create = await request('/api/products', {
    method: 'POST',
    headers: { authorization: `Bearer ${sellerSession.accessToken}` },
    body: JSON.stringify({
      title: `E2E Listing ${Date.now()}`,
      description: 'A valid end-to-end listing.',
      price: 500,
      isNegotiable: true,
      category: 'Books',
      condition: 'Good',
      images: ['https://example.com/test.jpg'],
      contacts: { whatsapp: '9876543210', telegram: '', instagram: '' },
    }),
  });
  assert.equal(create.response.status, 201, JSON.stringify(create.body));
  const productId = create.body.data.product._id;

  const pending = await request('/api/admin/products/pending?page=1&limit=20', {
    headers: { authorization: `Bearer ${adminSession.accessToken}` },
  });
  assert.equal(pending.response.status, 200, JSON.stringify(pending.body));
  assert.ok(pending.body.data.items.some((item) => String(item._id) === String(productId)));

  const approve = await request(`/api/admin/products/${productId}/approve`, {
    method: 'POST',
    headers: { authorization: `Bearer ${adminSession.accessToken}` },
  });
  assert.equal(approve.response.status, 200, JSON.stringify(approve.body));

  const browse = await request(`/api/products/${productId}`);
  assert.equal(browse.response.status, 200, JSON.stringify(browse.body));
  assert.equal(browse.body.data.product.moderationStatus, 'APPROVED');

  const favorite = await request(`/api/favorites/${productId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${buyerSession.accessToken}` },
  });
  assert.equal(favorite.response.status, 200, JSON.stringify(favorite.body));

  const favorites = await request('/api/favorites', {
    headers: { authorization: `Bearer ${buyerSession.accessToken}` },
  });
  assert.equal(favorites.response.status, 200, JSON.stringify(favorites.body));
  assert.ok(favorites.body.data.items.some((item) => String(item._id) === String(productId)));
});

test('session regression: refresh rotates cookie and logout invalidates refresh token', async () => {
  const session = await login(buyer);
  assert.ok(session.cookie);

  const refresh = await request('/api/auth/refresh', {
    method: 'POST',
    headers: e2eHeaders(buyer, { cookie: session.cookie }),
  });
  assert.equal(refresh.response.status, 200, JSON.stringify(refresh.body));
  const rotatedCookie = cookieFrom(refresh.response);
  assert.ok(rotatedCookie);
  assert.notEqual(rotatedCookie, session.cookie);

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: e2eHeaders(buyer, { cookie: rotatedCookie }),
  });
  assert.equal(logout.response.status, 200, JSON.stringify(logout.body));

  const reused = await request('/api/auth/refresh', {
    method: 'POST',
    headers: e2eHeaders(buyer, { cookie: rotatedCookie }),
  });
  assert.equal(reused.response.status, 401, JSON.stringify(reused.body));
});
