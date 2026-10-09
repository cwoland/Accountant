import webpush, { WebPushError } from 'web-push';
import type { Types } from 'mongoose';
import { env, pushEnabled } from '../config/env.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { logger } from '../lib/logger.js';

export interface PushPayload {
  title: string;
  body?: string;
  icon?: string;
  url?: string;
  tag?: string;
}

if (pushEnabled) {
  webpush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL}`,
    env.VAPID_PUBLIC_KEY!,
    env.VAPID_PRIVATE_KEY!,
  );
}

export async function pushToUser(
  userId: Types.ObjectId,
  payload: PushPayload,
): Promise<number> {
  if (!pushEnabled) return 0;

  const subs = await PushSubscription.find({ user: userId }).lean();
  if (subs.length === 0) return 0;

  const body = JSON.stringify(payload);
  const stale: string[] = [];
  let delivered = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
          { TTL: 86_400 },
        );
        delivered += 1;
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
          stale.push(sub.endpoint);
          return;
        }
        logger.warn({ err, userId }, 'push: не доставлено');
      }
    }),
  );

  if (stale.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: stale } });
    logger.info({ removed: stale.length, userId }, 'push: удалены протухшие подписки');
  }

  return delivered;
}

export async function pushToMany(
  userIds: Types.ObjectId[],
  build: (userId: Types.ObjectId) => PushPayload | null,
  batchSize = 25,
): Promise<number> {
  let total = 0;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((id) => {
        const payload = build(id);
        return payload ? pushToUser(id, payload) : Promise.resolve(0);
      }),
    );
    total += results.reduce(
      (acc, r) => acc + (r.status === 'fulfilled' ? r.value : 0),
      0,
    );
  }
  return total;
}