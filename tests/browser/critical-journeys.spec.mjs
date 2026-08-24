import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const state = JSON.parse(fs.readFileSync(path.resolve('.e2e-state.json'), 'utf8'));
const seller = state.users.find((u) => u.userName === 'E2E Seller');
const buyer = state.users.find((u) => u.userName === 'E2E Buyer');
const admin = state.users.find((u) => u.role === 'admin');
const imagePath = path.resolve('tests/fixtures/e2e-product.png');

async function login(page, user) {
  await page.goto('/login');
  await page.getByLabel('College email address').fill(user.email);
  await page.getByLabel('Password').fill(state.password);
  await page.getByRole('button', { name: 'Enter Dashboard' }).click();
  await expect(page).toHaveURL(/\/feed$/);
}

test('buyer journey: login → browse → favorite → favorites', async ({ page }) => {
  // Create one approved listing through the already-verified HTTP contract so this
  // browser test focuses on the buyer UI rather than duplicating API setup.
  const api = page.request;
  const loginResponse = await api.post('/api/auth/login', {
    headers: { 'x-forwarded-for': buyer.e2eIp },
    data: { email: buyer.email, password: state.password },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const buyerPayload = await loginResponse.json();
  expect(buyerPayload.data.accessToken).toBeTruthy();

  const sellerLogin = await api.post('/api/auth/login', {
    headers: { 'x-forwarded-for': seller.e2eIp },
    data: { email: seller.email, password: state.password },
  });
  const sellerData = await sellerLogin.json();
  const create = await api.post('/api/products', {
    headers: { authorization: `Bearer ${sellerData.data.accessToken}` },
    data: {
      title: `Browser Journey ${Date.now()}`,
      description: 'Browser E2E approved listing for marketplace verification.',
      price: 450,
      isNegotiable: true,
      category: 'Books',
      condition: 'Good',
      images: ['https://example.com/browser-e2e.jpg'],
      contacts: { whatsapp: '9876543210', telegram: '', instagram: '' },
    },
  });
  expect(create.status()).toBe(201);
  const created = await create.json();

  const adminLogin = await api.post('/api/auth/login', {
    headers: { 'x-forwarded-for': admin.e2eIp },
    data: { email: admin.email, password: state.password },
  });
  const adminData = await adminLogin.json();
  const approve = await api.post(`/api/admin/products/${created.data.product._id}/approve`, {
    headers: { authorization: `Bearer ${adminData.data.accessToken}` },
  });
  expect(approve.status()).toBe(200);
  // API setup uses the same browser context; remove its refresh cookie before the UI login.
  await page.context().clearCookies();
  await login(page, buyer);
  await page.getByRole('searchbox', { name: 'Search marketplace' }).fill(created.data.product.title);
  await expect(page.getByText(created.data.product.title)).toBeVisible();

  const card = page.getByRole('article').filter({ hasText: created.data.product.title });
  await card.getByRole('button', { name: 'Save to favorites' }).click();
  await expect(card.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

  await page.goto('/favorites');
  await expect(page.getByText(created.data.product.title)).toBeVisible();
});

test('seller/admin journey: create listing → pending → approve → audit', async ({ page, browser }) => {
  await login(page, seller);
  await page.goto('/sell');
  await expect(page.getByRole('heading', { name: 'List Your Item' })).toBeVisible();

  const title = `Browser Seller ${Date.now()}`;
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Description').fill('A browser-created listing used for release verification.');
  await page.getByLabel('Price (₹)').fill('650');
  await page.getByLabel('Category').selectOption('Books');
  await page.getByLabel('Condition').selectOption('Good');
  await page.getByLabel(/WhatsApp-Number Contact Info/).fill('9876543210');
  await page.locator('input[type="file"]').setInputFiles(imagePath);
  await expect(page.getByAltText('Product Preview')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Submit for Approval' }).click();
  await expect(page).toHaveURL(/\/feed$/ , { timeout: 30_000 });

  const adminPage = await browser.newPage();
  await login(adminPage, admin);
  await adminPage.goto('/dashboard');
  await expect(adminPage.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 });

  const listing = adminPage.getByRole('article').filter({ hasText: title });
  await expect(listing).toBeVisible();
  await listing.getByRole('button', { name: 'Approve' }).click();
  await expect(adminPage.getByText(title)).toHaveCount(0, { timeout: 15_000 });

  await adminPage.goto('/dashboard/audit');
  await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 });
  await adminPage.close();
});

test('security UI journey: protected page redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/sell');
  await expect(page).toHaveURL(/\/login\?redirect=%2Fsell$/);
  await expect(page.getByLabel('College email address')).toBeVisible();
});
