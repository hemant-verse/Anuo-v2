import mongoose from 'mongoose';
import { getEnv } from './env';

const globalForMongoose = globalThis;

export default async function connectDB() {
  const { MONGO_URI } = getEnv();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalForMongoose.__aunoMongoosePromise) {
    globalForMongoose.__aunoMongoosePromise = mongoose.connect(MONGO_URI);
  }

  try {
    const conn = await globalForMongoose.__aunoMongoosePromise;
    return conn.connection;
  } catch (error) {
    globalForMongoose.__aunoMongoosePromise = undefined;
    throw error;
  }
}