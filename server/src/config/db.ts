import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../lib/logger.js';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () =>
    logger.warn('MongoDB отключена'),
  );
  mongoose.connection.on('reconnected', () =>
    logger.info('MongoDB переподключена'),
  );

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 10,
  });

  logger.info('MongoDB подключена');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close(false);
}