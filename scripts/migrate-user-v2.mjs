import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI is required');

const mode = process.argv.includes('--apply')
  ? 'apply'
  : process.argv.includes('--cleanup')
    ? 'cleanup'
    : process.argv.includes('--verify')
      ? 'verify'
      : 'dry-run';

const db = await mongoose.connect(uri);
const users = db.connection.collection('users');

let scanned = 0;
let changed = 0;
let invalid = 0;

function sourceValues(user, fields, predicate) {
  return [...new Set(fields.map((field) => user[field]).filter(predicate))];
}

for await (const user of users.find({})) {
  scanned += 1;

  const names = sourceValues(
    user,
    ['userName', 'UserName', 'username', 'name'],
    (value) => typeof value === 'string' && value.trim().length > 0,
  ).map((value) => value.trim());
  const passwords = sourceValues(
    user,
    ['passwordHash', 'Password'],
    (value) => typeof value === 'string' && value.length > 0,
  );

  if (names.length !== 1 || passwords.length !== 1) {
    invalid += 1;
    console.error(`INVALID ${user._id}: expected exactly one deterministic userName and passwordHash source`);
    continue;
  }

  const [userName] = names;
  const [passwordHash] = passwords;

  if (mode === 'verify') {
    const legacyExists = ['UserName', 'username', 'name', 'Password'].some((field) => user[field] !== undefined);
    if (!user.userName || !user.passwordHash || legacyExists) {
      invalid += 1;
      console.error(`VERIFY_FAIL ${user._id}: canonical fields/legacy cleanup incomplete`);
    }
    continue;
  }

  if (mode === 'cleanup') {
    if (!user.userName || !user.passwordHash) {
      invalid += 1;
      console.error(`CLEANUP_BLOCKED ${user._id}: canonical fields missing`);
      continue;
    }
    await users.updateOne(
      { _id: user._id },
      { $unset: { UserName: '', username: '', name: '', Password: '' } },
    );
    changed += 1;
    continue;
  }

  if (mode === 'apply') {
    await users.updateOne(
      { _id: user._id },
      { $set: { userName, passwordHash } },
    );
    changed += 1;
  } else {
    console.log(`DRY_RUN ${user._id}: ${userName}`);
    changed += 1;
  }
}

const legacyRemaining = await users.countDocuments({
  $or: [
    { UserName: { $exists: true } },
    { username: { $exists: true } },
    { name: { $exists: true } },
    { Password: { $exists: true } },
  ],
});

console.log(JSON.stringify({ mode, scanned, changed, invalid, legacyRemaining }, null, 2));
await mongoose.disconnect();

if (invalid > 0) process.exitCode = 2;
