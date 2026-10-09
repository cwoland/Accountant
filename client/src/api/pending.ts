import type { PendingItemDto } from '@accountant/shared';
import { getPendingRawApi } from './endpoints';
import { listQueue } from '../lib/offlineQueue';

/**
 * Ряд «Продолжить» = серверные дела + офлайн-очередь.
 * Очередь живёт в IndexedDB и серверу не видна, поэтому склеиваем здесь.
 */
export async function getPendingApi(params: { accountId?: string | undefined }) {
  const { data } = await getPendingRawApi(params);
  const queued = await listQueue();
  if (queued.length === 0) return { data };

  const queuedItem: PendingItemDto = {
    kind: 'queued',
    id: 'offline-queue',
    title: 'Ждут отправки',
    subtitle: `${queued.length} записано офлайн`,
    amount: null,
    ink: 2,
    dueDate: null,
    url: '/transactions',
  };
  return { data: [queuedItem, ...data] };
}
