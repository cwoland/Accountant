import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { dequeue, listQueue, markAttempt } from '../lib/offlineQueue';
import { createTransactionApi } from '../api/endpoints';
import { useOnline } from './useOnline';

const MAX_ATTEMPTS = 5;

export function useSyncQueue() {
  const online = useOnline();
  const qc = useQueryClient();
  const running = useRef(false);

  const sync = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      const queue = await listQueue();
      if (queue.length === 0) return;

      let ok = 0;
      let dropped = 0;

      for (const item of queue) {
        const { id, queuedAt: _q, attempts: _a, ...body } = item;
        try {
          await createTransactionApi(body);
          if (id !== undefined) await dequeue(id);
          ok += 1;
        } catch {
          if (item.attempts + 1 >= MAX_ATTEMPTS) {
            if (id !== undefined) await dequeue(id);
            dropped += 1;
          } else {
            await markAttempt(item);
          }
        }
      }

      if (ok > 0) {
        await qc.invalidateQueries({ queryKey: ['transactions'] });
        await qc.invalidateQueries({ queryKey: ['stats'] });
        toast.success(`Синхронизировано: ${ok}`);
      }
      if (dropped > 0) {
        toast.error(`Не удалось отправить ${dropped} — записи удалены из очереди`);
      }
    } finally {
      running.current = false;
    }
  }, [qc]);

  useEffect(() => {
    if (online) void sync();
  }, [online, sync]);

  return { sync };
}