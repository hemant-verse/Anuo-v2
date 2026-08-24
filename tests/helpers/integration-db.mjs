import fs from 'node:fs';
import mongoosePackage from 'mongoose';

// Node test scripts do not automatically load Next.js's .env.local.
// Prefer an explicitly exported environment, then load local development env files natively.
for (const envFile of ['.env.local', '.env']) {
  if (fs.existsSync(envFile)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envFile);
      } else {
        const content = fs.readFileSync(envFile, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
              const key = trimmed.slice(0, eqIdx).trim();
              const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
              if (!process.env[key]) process.env[key] = val;
            }
          }
        }
      }
    } catch {}
  }
}

let mongoose = mongoosePackage;

const PLACEHOLDER_VALUES = new Set([
  '',
  'your-test-mongodb-uri',
  'your-mongodb-uri',
  'mongodb://your-test-mongodb-uri',
  'your-test-only-secret',
  'your-secret',
]);

function valueIsUsable(value) {
  return typeof value === 'string' && value.trim() !== '' && !PLACEHOLDER_VALUES.has(value.trim());
}

export function hasIntegrationEnv() {
  return valueIsUsable(process.env.MONGO_URI) && valueIsUsable(process.env.JWT_ACCESS_SECRET);
}

function assertIntegrationEnv() {
  if (!valueIsUsable(process.env.MONGO_URI)) {
    throw new Error(
      'Integration tests require a real MONGO_URI. Set it in .env.local or the shell; do not use a placeholder value.'
    );
  }
  if (!valueIsUsable(process.env.JWT_ACCESS_SECRET)) {
    throw new Error(
      'Integration tests require JWT_ACCESS_SECRET. Set a test-only secret in .env.local or the shell.'
    );
  }
}

export async function connectIntegrationDb() {
  assertIntegrationEnv();
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to connect to MongoDB for integration tests: ${message}`);
  }
}

export async function resetIntegrationDb() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected; refusing to run test database cleanup.');
  }
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function closeIntegrationDb() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
