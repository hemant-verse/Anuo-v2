import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');

const legacyAdapterFiles = new Set();;

const legacyDefinitionFiles = new Set();

const forbidden = [
  { label: 'legacy user model import', re: /(?:@\/models\/user\.model|models\/user\.model|user\.model)/ },
  { label: 'legacy product model import', re: /(?:@\/models\/product\.model|models\/product\.model|product\.model)/ },
  { label: 'legacy admin audit model import', re: /(?:@\/models\/adminAudit\.model|models\/adminAudit\.model|adminAudit\.model)/ },
  { label: 'legacy product API caller', re: /['"`]\/api\/products\/(?:create|feed|my-listings|product\/|pending|verify|sell)/ },
  { label: 'legacy favorites API caller', re: /['"`]\/api\/(?:user\/favorites|products\/[^'"`]+\/favorite)/ },
  { label: 'legacy Product field consumer', re: /\.(?:imageUrl|seller)\b|\b(?:imageUrl|seller)\s*:/ },
  { label: 'legacy User field consumer', re: /\.(?:UserName|Password)\b/ },
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(?:js|jsx|mjs|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(src)) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (legacyAdapterFiles.has(rel) || legacyDefinitionFiles.has(rel)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    const match = text.match(rule.re);
    if (match) violations.push(`${rel}: ${rule.label} -> ${match[0]}`);
  }
}

const required = [
  'src/models/User.js',
  'src/models/Product.js',
  'src/models/Session.js',
  'src/models/Otp.js',
  'src/models/AuditLog.js',
  'src/server/auth/auth.service.js',
  'src/server/auth/session.service.js',
  'src/server/products/product.service.js',
  'src/server/admin/admin.service.js',
  'src/server/favorites/favorite.service.js',
  'src/app/api/products/route.js',
  'src/app/api/admin/products/pending/route.js',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) violations.push(`missing required V2 artifact: ${rel}`);
}

if (violations.length) {
  console.error('V2 migration verification FAILED');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('V2 migration verification PASSED');
const removedLegacyRoutes = [
  'src/app/api/products/create/route.js',
  'src/app/api/products/sell/route.js',
  'src/app/api/products/feed/route.js',
  'src/app/api/products/my-listings/route.js',
  'src/app/api/products/product/[id]/route.js',
  'src/app/api/products/pending/route.js',
  'src/app/api/products/verify/route.js',
  'src/app/api/products/[productId]/favorite/route.js',
  'src/app/api/user/favorites/route.js',
  'src/models/product.model.js',
];
for (const rel of removedLegacyRoutes) {
  if (fs.existsSync(path.join(root, rel))) {
    console.error(`legacy artifact still exists: ${rel}`);
    process.exit(1);
  }
}
console.log(`Scanned ${walk(src).length} source files; legacy compatibility routes/models are removed.`);
console.log('No active consumers reference legacy models, legacy API contracts, or legacy Product/User field names.');
