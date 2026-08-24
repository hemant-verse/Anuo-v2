import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectIntegrationDb, closeIntegrationDb, resetIntegrationDb } from '../../tests/helpers/integration-db.mjs';

const User = (await import('../../src/models/User.js')).default;

const password = process.env.E2E_PASSWORD || 'E2E-StrongPass123!';
const root = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.resolve(root, '../../.e2e-state.json');

await connectIntegrationDb();
await resetIntegrationDb();
const passwordHash = await bcrypt.hash(password, 12);

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const users = [
  { email: `e2e-seller-${runId}@indoreinstitute.com`, userName: 'E2E Seller', role: 'user', e2eIp: '203.0.113.11' },
  { email: `e2e-buyer-${runId}@indoreinstitute.com`, userName: 'E2E Buyer', role: 'user', e2eIp: '203.0.113.12' },
  { email: `e2e-admin-${runId}@indoreinstitute.com`, userName: 'E2E Admin', role: 'admin', e2eIp: '203.0.113.13' },
];

await User.insertMany(users.map((user) => ({ ...user, passwordHash, isVerified: true })));
await fs.writeFile(statePath, JSON.stringify({ baseUrl: process.env.E2E_BASE_URL || 'http://localhost:3000', password, users }, null, 2));
console.log(`E2E fixtures created: ${statePath}`);
await closeIntegrationDb();
