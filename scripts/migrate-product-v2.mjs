import 'dotenv/config';
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const VERIFY = process.argv.includes('--verify');
const CLEANUP = process.argv.includes('--cleanup');

const uri = process.env.MONGO_URI;
if (!uri) throw new Error('MONGO_URI is required');

await mongoose.connect(uri);
const collection = mongoose.connection.collection('products');

const legacyFilter = {
  $or: [
    { sellerId: { $exists: false } },
    { moderationStatus: { $exists: false } },
    { availabilityStatus: { $exists: false } },
    { contacts: { $exists: false } },
    { images: { $exists: false } },
  ],
};

const total = await collection.countDocuments(legacyFilter);
console.log(`Products requiring V2 field migration: ${total}`);

if (APPLY && total > 0) {
  const cursor = collection.find(legacyFilter);
  let migrated = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const update = {
      $set: {
        sellerId: doc.sellerId ?? doc.seller,
        moderationStatus: doc.moderationStatus ?? doc.verify ?? 'PENDING',
        availabilityStatus: doc.availabilityStatus ?? doc.status ?? 'AVAILABLE',
        contacts: doc.contacts ?? {
          whatsapp: doc.whatsapp || '',
          telegram: doc.telegram || '',
          instagram: doc.instagram || '',
        },
        images: doc.images ?? (doc.imageUrl ? [doc.imageUrl] : []),
      },
    };
    await collection.updateOne({ _id: doc._id }, update);
    migrated += 1;
  }
  console.log(`Migrated: ${migrated}`);
}

if (VERIFY || APPLY) {
  const remaining = await collection.countDocuments(legacyFilter);
  const invalid = await collection.countDocuments({
    $or: [
      { sellerId: { $exists: false } },
      { moderationStatus: { $nin: ['PENDING', 'APPROVED', 'REJECTED'] } },
      { availabilityStatus: { $nin: ['AVAILABLE', 'RESERVED', 'SOLD'] } },
    ],
  });
  console.log(`Remaining legacy-shape records: ${remaining}`);
  console.log(`Invalid canonical state records: ${invalid}`);
  if (remaining || invalid) process.exitCode = 2;
}

if (CLEANUP) {
  const result = await collection.updateMany(
    { sellerId: { $exists: true }, moderationStatus: { $exists: true }, availabilityStatus: { $exists: true } },
    { $unset: { seller: '', verify: '', status: '', imageUrl: '', imageFileId: '', whatsapp: '', telegram: '', instagram: '' } }
  );
  console.log(`Removed legacy product fields from ${result.modifiedCount} records.`);
}

await mongoose.disconnect();
